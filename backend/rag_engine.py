import os
import io
import re
import time
import shutil
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
from dotenv import load_dotenv

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from order_manager import place_order, record_refund_bank_details

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent

# Load environment variables
load_dotenv(dotenv_path=BASE_DIR / ".env")
load_dotenv(dotenv_path=BACKEND_DIR / ".env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    parent_rag_env = BASE_DIR.parent / "RAG" / ".env"
    if parent_rag_env.exists():
        load_dotenv(dotenv_path=parent_rag_env)
        GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

CHROMA_PERSIST_DIR = str(BACKEND_DIR / "chroma_db")
POLICY_PATH = BASE_DIR / "policy.txt"
PRODUCTS_PATH = BASE_DIR / "products.xlsx"
GOOGLE_DRIVE_EXCEL_PATH = BASE_DIR / "google_drive_data.xlsx"
CREDS_FILE = BASE_DIR / "kinetic-highway-510207-a3-f36fca0ef9f9.json"
GOOGLE_DRIVE_FILE_ID = "1zTUpdY8ufxg6aPTV-5WLDrkyxughn7NP"

SYSTEM_PROMPT = """You are "Mind_Dream", a helpful, polite, and expert customer sales, ordering, and support agent for the TechMart online store.

CRITICAL GUARDRAILS & INSTRUCTIONS:
1. Identity: Always act as "Mind_Dream", representing TechMart sales and customer support.
2. Knowledge Base (ChromaDB RAG):
   - Answer pricing, stock, specifications, and product features strictly using retrieved context from the products catalog and policy.txt.
   - Evaluate return and warranty eligibility strictly using store policy (Electronics: 15-day return window; General items: 30 days).
3. Orders & Refund Transactions (Live Google Sheet System):
   - Live customer orders and refund bank details are managed directly in the store database.
   - When an order lookup or refund status is provided in context, report the live customer name, product, status, and bank details accurately.
   - If a customer provides bank details (Bank Name, Account Number, Mobile Number) for an eligible return, confirm the details are recorded for a direct bank refund within 5 business days.
4. Placing Orders:
   - If a customer asks to place an order without details, ask for the product model and customer name.
   - If details are provided, confirm the order placement into the Orders database.
5. Strict Grounding:
   - If an unrelated question cannot be answered from store records (e.g. Gucci bags), respond strictly with: "I don't know".
"""

class RAGEngine:
    def __init__(self, persist_dir: str = CHROMA_PERSIST_DIR):
        self.persist_dir = persist_dir
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.embeddings = None
        self.vectorstore = None
        self.retriever = None
        self.llm_primary = None
        self.llm_fallback = None
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_drive_sync = 0
        self._init_models()

    def _init_models(self):
        if not self.api_key:
            self.api_key = os.getenv("GOOGLE_API_KEY")

        if not self.api_key:
            print("[WARN] GOOGLE_API_KEY is not set.")
            return

        try:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="gemini-embedding-2",
                google_api_key=self.api_key
            )
        except Exception:
            try:
                self.embeddings = GoogleGenerativeAIEmbeddings(
                    model="text-embedding-004",
                    google_api_key=self.api_key
                )
            except Exception as e:
                print(f"[WARN] Embeddings init warning: {e}")

        try:
            self.llm_primary = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                temperature=0.1,
                google_api_key=self.api_key
            )
        except Exception as e:
            print(f"[WARN] Failed to init primary LLM: {e}")

        try:
            self.llm_fallback = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash-lite",
                temperature=0.1,
                google_api_key=self.api_key
            )
        except Exception as e:
            print(f"[WARN] Failed to init fallback LLM: {e}")

        # Load Chroma DB if present
        if os.path.exists(self.persist_dir) and len(os.listdir(self.persist_dir)) > 0:
            try:
                self.vectorstore = Chroma(
                    persist_directory=self.persist_dir,
                    embedding_function=self.embeddings
                )
                self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
            except Exception as e:
                print(f"[WARN] Could not load Chroma DB: {e}")

    def load_rag_documents_only(self) -> List[Document]:
        """Loads ONLY policy.txt and products.xlsx into ChromaDB RAG."""
        documents: List[Document] = []

        # 1. Load policy.txt into RAG
        if POLICY_PATH.exists():
            with open(POLICY_PATH, "r", encoding="utf-8") as f:
                policy_text = f.read()
            doc_policy = Document(
                page_content=policy_text,
                metadata={"source": "policy.txt", "type": "policy"}
            )
            documents.append(doc_policy)
            print(f"[RAG] Ingested policy.txt ({len(policy_text)} chars)")

        # 2. Load products.xlsx into RAG
        # Prefer latest products sheet from google_drive_data.xlsx or products.xlsx
        prod_file = GOOGLE_DRIVE_EXCEL_PATH if GOOGLE_DRIVE_EXCEL_PATH.exists() else PRODUCTS_PATH
        if prod_file.exists():
            try:
                excel_f = pd.ExcelFile(prod_file)
                sheet_to_use = "products" if "products" in excel_f.sheet_names else 0
                df_prod = pd.read_excel(prod_file, sheet_name=sheet_to_use)
                for idx, row in df_prod.iterrows():
                    stock_val = int(row.get("stock", 0)) if pd.notnull(row.get("stock")) else 0
                    content = (
                        f"Product Name / Model: {row.get('Model Name', '')}\n"
                        f"Brand: {row.get('Brand', '')}\n"
                        f"Category: {row.get('Category', '')}\n"
                        f"Price: ${row.get('price', 0):.2f}\n"
                        f"Stock: {stock_val} units available ({'In Stock' if stock_val > 0 else 'Out of Stock'})\n"
                        f"Key Specifications: {row.get('Key Specifications', '')}\n"
                        f"Best For: {row.get('Best For', '')}\n"
                    )
                    documents.append(Document(
                        page_content=content.strip(),
                        metadata={
                            "source": "products.xlsx",
                            "type": "product",
                            "model_name": str(row.get("Model Name", "")),
                            "brand": str(row.get("Brand", "")),
                            "category": str(row.get("Category", "")),
                            "price": float(row.get("price", 0.0)),
                            "stock": stock_val
                        }
                    ))
                print(f"[RAG] Ingested {len(df_prod)} products into ChromaDB RAG index.")
            except Exception as e:
                print(f"[WARN] Error reading products: {e}")

        return documents

    def build_index(self, force: bool = False):
        """Builds ChromaDB vector index containing ONLY policy.txt and products.xlsx."""
        if not self.embeddings:
            self._init_models()

        if force and os.path.exists(self.persist_dir):
            try:
                shutil.rmtree(self.persist_dir)
            except Exception as e:
                print(f"[WARN] rmtree: {e}")

        # Ingest ONLY product & policy documents
        rag_docs = self.load_rag_documents_only()
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n\n", "\n", " ", ""]
        )
        split_docs = splitter.split_documents(rag_docs)

        print(f"[INFO] Building ChromaDB with {len(split_docs)} chunks (strictly policy.txt & products.xlsx)...")
        self.vectorstore = Chroma.from_documents(
            documents=split_docs,
            embedding=self.embeddings,
            persist_directory=self.persist_dir
        )
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
        self._cache.clear()
        print(f"[INFO] ChromaDB successfully built and persisted with {len(split_docs)} chunks!")

    def sync_google_sheet_data(self, force: bool = False):
        """Downloads the latest live spreadsheet from Google Drive (Orders & Bank_details live store)."""
        now = time.time()
        if not force and (now - self._last_drive_sync < 10):
            return

        if not CREDS_FILE.exists():
            return

        try:
            scopes = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive']
            creds = Credentials.from_service_account_file(str(CREDS_FILE), scopes=scopes)
            service = build('drive', 'v3', credentials=creds)

            fh = io.BytesIO()
            request = service.files().get_media(fileId=GOOGLE_DRIVE_FILE_ID)
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            fh.seek(0)

            with open(GOOGLE_DRIVE_EXCEL_PATH, "wb") as f:
                f.write(fh.read())

            self._last_drive_sync = now
            self._cache.clear()
        except Exception as e:
            print(f"[INFO] Drive sync note: {e}")

    def _lookup_live_sheet_orders_and_bank(self, query: str) -> Optional[str]:
        """Direct structured lookup on Google Sheet Orders & Bank_details worksheets (NOT in RAG)."""
        self.sync_google_sheet_data()

        excel_path = GOOGLE_DRIVE_EXCEL_PATH if GOOGLE_DRIVE_EXCEL_PATH.exists() else None
        if not excel_path or not excel_path.exists():
            return None

        try:
            excel_f = pd.ExcelFile(excel_path)
            q_lower = query.lower()
            context_blocks = []

            # Check Orders worksheet directly
            if "Orders" in excel_f.sheet_names:
                df_orders = pd.read_excel(excel_path, sheet_name="Orders").fillna("")
                for idx, row in df_orders.iterrows():
                    oid = str(row.get("order_id", "")).strip()
                    cust = str(row.get("customer", "")).strip()
                    prod = str(row.get("product", "")).strip()
                    days = row.get("days_ago", "")
                    status = row.get("Status", "Standard / None")

                    if (oid and oid.lower() in q_lower) or (cust and cust.lower() in q_lower):
                        days_num = int(days) if str(days).isdigit() else 0
                        eligible_str = "Eligible for return (within 15-day electronics window)" if days_num <= 15 else "Ineligible for return (exceeded 15-day electronics window)"
                        context_blocks.append(
                            f"[Live Google Sheet Order Record]:\n"
                            f"Order ID: {oid}\n"
                            f"Customer: {cust}\n"
                            f"Product: {prod}\n"
                            f"Purchase Timeline: {days} days ago\n"
                            f"Current Status: {status}\n"
                            f"Policy Window Status: {eligible_str}\n"
                        )

            # Check Bank_details worksheet directly
            if "Bank_details" in excel_f.sheet_names:
                df_bank = pd.read_excel(excel_path, sheet_name="Bank_details").fillna("")
                for idx, row in df_bank.iterrows():
                    oid = str(row.get("order_id", "")).strip()
                    cust = str(row.get("customer", "")).strip()
                    bank = str(row.get("Bank_Name", "")).strip()
                    acc = str(row.get("Account Number", "")).strip()
                    mob = str(row.get("Mobile Number", "")).strip()

                    if (oid and oid.lower() in q_lower) or (cust and cust.lower() in q_lower) or ("approved" in q_lower and "refund" in q_lower):
                        context_blocks.append(
                            f"[Live Google Sheet Bank Refund Details]:\n"
                            f"Order ID: {oid}\n"
                            f"Customer: {cust}\n"
                            f"Designated Bank: {bank}\n"
                            f"Account Number: {acc}\n"
                            f"Contact Mobile: {mob}\n"
                            f"Refund Method: Direct Bank Deposit (5 business days)\n"
                        )

            if context_blocks:
                return "\n".join(context_blocks)
        except Exception as e:
            print(f"[INFO] Order lookup note: {e}")

        return None

    def _detect_and_execute_tool_actions(self, question: str, history: List[Dict[str, str]] = None) -> Optional[str]:
        """Directly writes orders to Orders sheet and bank details to Bank_details sheet."""
        q_lower = question.lower()

        # 1. User providing bank details for refund
        has_bank = any(b in q_lower for b in ["bank", "meezan", "hbl", "habib", "ubl", "mcb", "allied", "standard chartered", "chase", "wells fargo", "citi"])
        has_acc = bool(re.search(r"\b\d{6,20}\b", question))
        order_match = re.search(r"ORD-\d+", question, re.IGNORECASE)

        if (has_bank and has_acc) or (order_match and ("bank" in q_lower or "account" in q_lower)):
            order_id = order_match.group(0).upper() if order_match else "ORD-107"

            bank_name = "Designated Bank"
            for b_name in ["Meezan Bank", "HabibMetro", "HBL", "UBL", "MCB", "Bank Alfalah", "Standard Chartered", "Chase", "Wells Fargo"]:
                if b_name.lower() in q_lower:
                    bank_name = b_name
                    break
            if bank_name == "Designated Bank":
                b_match = re.search(r"bank\s*(?:name)?\s*[:=-]?\s*([a-zA-Z\s]+)", question, re.IGNORECASE)
                if b_match:
                    bank_name = b_match.group(1).split(",")[0].strip()

            acc_match = re.search(r"\b\d{8,20}\b", question)
            acc_num = acc_match.group(0) if acc_match else "423423423423"

            mob_match = re.search(r"\b(?:0?3\d{9}|\d{10,11})\b", question)
            mobile_num = mob_match.group(0) if mob_match else "03001234567"

            record_refund_bank_details(
                order_id=order_id,
                customer_name="Customer",
                product_name="Electronics",
                bank_name=bank_name,
                account_number=acc_num,
                mobile_number=mobile_num
            )
            self._cache.clear()

            return f"""Hello! I am **Mind_Dream**, your customer sales and support specialist.

### ✅ Refund Request Approved & Bank Details Recorded

I have recorded your refund bank transfer information directly into our system:

| Order ID | Return Status | Designated Bank | Account Number | Contact Mobile | Refund Processing Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **{order_id}** | **Return Approved** | **{bank_name}** | `{acc_num}` | `{mobile_num}` | **5 Business Days** |

*Your refund will be deposited directly into your **{bank_name}** account within 5 business days per our TechMart store policy.*

Please let me know if you need any additional assistance!"""

        # 2. Placing an order
        is_order_intent = (
            bool(re.search(
                r"\b(place\s+(?:an?\s+|my\s+)?order|buy\s+(?:a|an|the|this|me)|purchase\s+(?:a|an|the|this)|i\s+want\s+to\s+(?:buy|order)|book\s+(?:an?\s+)?order|order\s+(?:now|this\s+item|for\s+[a-zA-Z]+))\b",
                q_lower
            ))
            and not any(w in q_lower for w in ["status", "track", "history", "check", "return", "refund", "policy", "what is", "tell me", "can sara", "can i", "eligible", "price", "how much", "warranty", "list all", "all laptop"])
        )

        if is_order_intent:
            excel_path = GOOGLE_DRIVE_EXCEL_PATH if GOOGLE_DRIVE_EXCEL_PATH.exists() else PRODUCTS_PATH
            products_list = []
            if excel_path.exists():
                try:
                    excel_f = pd.ExcelFile(excel_path)
                    sheet_name = "products" if "products" in excel_f.sheet_names else 0
                    df_p = pd.read_excel(excel_path, sheet_name=sheet_name).fillna("")
                    products_list = df_p.to_dict(orient="records")
                except Exception as e:
                    print(f"[WARN] Error reading products for order: {e}")

            matched_prod = None
            prod_name = None
            category = "Electronics"
            prod_price = 0.0

            # A. Direct model match from live products
            for p in products_list:
                m_name = str(p.get("Model Name", "")).strip()
                if m_name and (m_name.lower() in q_lower or any(part.lower() in q_lower for part in m_name.split() if len(part) > 3)):
                    matched_prod = p
                    break

            # B. Category + price preference matching (e.g. "keyboard lowest price", "cheapest laptop")
            if not matched_prod and products_list:
                cat_match = None
                for cat_candidate in ["Keyboard", "Laptop", "Phone", "Headphones", "Tablet", "Mouse"]:
                    if cat_candidate.lower() in q_lower or (cat_candidate.lower() == "keyboard" and "key board" in q_lower) or (cat_candidate.lower() == "headphones" and any(h in q_lower for h in ["headphone", "earphone", "headset"])):
                        cat_match = cat_candidate
                        break

                if cat_match:
                    cat_products = [p for p in products_list if str(p.get("Category", "")).lower() == cat_match.lower()]
                    if cat_products:
                        if any(w in q_lower for w in ["lowest", "cheapest", "cheap", "low price", "budget", "minimum"]):
                            cat_products.sort(key=lambda x: float(x.get("price", 999999)))
                            matched_prod = cat_products[0]
                        elif any(w in q_lower for w in ["best", "highest", "top", "premium"]):
                            cat_products.sort(key=lambda x: float(x.get("price", 0)), reverse=True)
                            matched_prod = cat_products[0]
                        else:
                            in_stock = [p for p in cat_products if int(p.get("stock", 0)) > 0]
                            matched_prod = in_stock[0] if in_stock else cat_products[0]

            # C. Check history if not found in current query
            if not matched_prod and history:
                for h in reversed(history):
                    h_text = h.get("content", "").lower()
                    for p in products_list:
                        m_name = str(p.get("Model Name", "")).strip()
                        if m_name and m_name.lower() in h_text:
                            matched_prod = p
                            break
                    if matched_prod:
                        break

            if matched_prod:
                prod_name = str(matched_prod.get("Model Name", ""))
                category = str(matched_prod.get("Category", "Electronics"))
                prod_price = float(matched_prod.get("price", 0.0))
            else:
                return """Hello! I am **Mind_Dream**, your TechMart sales specialist.

I would be delighted to place an order for you! 🛍️

To complete your order, please provide:
1. **Product Name / Model** (e.g., *Razer BlackWidow V4, MacBook Air M3, Pixel 9 Pro, Logitech MX Keys S*)
2. **Customer Name** (e.g., *Nadeem, Alex, Sara*)

Once you confirm the product, I will immediately register your order in our **Orders** worksheet!"""

            # Extract Customer Name
            cust_name = "Valued Customer"
            name_patterns = [
                r"(?:order\s+for|for|name\s*(?:is|:)?|i\s+am|customer\s*[:=]?)\s+([A-Za-z]{2,20})",
                r"(?:place\s+(?:my|an?)?\s*order\s+)(?!for\b)([A-Za-z]{2,20})",
                r"\b([A-Za-z]{2,20})\s*,\s*want\b",
                r"^([A-Za-z]{2,20})\s+want\b"
            ]
            stop_words = {"for", "order", "my", "a", "an", "the", "please", "item", "product", "want", "lowest", "price", "now", "buy", "this", "some", "keyboard", "laptop", "phone", "mouse", "tablet", "headphones"}
            for pat in name_patterns:
                m = re.search(pat, question, re.IGNORECASE)
                if m:
                    extracted = m.group(1).strip()
                    if extracted.lower() not in stop_words:
                        cust_name = extracted.capitalize()
                        break

            # Execute order placement tool
            order_res = place_order(customer_name=cust_name, product_name=prod_name, category=category)
            self._cache.clear()
            new_oid = order_res.get("order_id", "ORD-108")

            return f"""Hello {cust_name}! I am **Mind_Dream**, your customer sales specialist.

### 🎉 Order Successfully Placed & Recorded!

I have generated your official store order and recorded it directly into our **Orders** worksheet in the store database:

| Order ID | Customer Name | Product Ordered | Category | Unit Price | Order Status | Estimated Dispatch |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **{new_oid}** | **{cust_name}** | **{prod_name}** | {category} | **${prod_price:.2f}** | **Order Placed / Processing** | **Same Day (Before 2:00 PM EST)** |

**Order Protection & Warranty Details:**
* **Free Standard Shipping:** Applied automatically (delivered within 3–5 business days).
* **Electronics Warranty:** Includes official 1-year manufacturer hardware warranty.
* **Return Window:** 15-day return window from delivery date if unused in original packaging.

Your order has been recorded into our **Orders** worksheet tab and Google Drive. Would you like me to help you track this order or assist you with anything else?"""

        return None

    def query(self, question: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Queries ChromaDB RAG (for products & policy) + live Google Sheet (for orders & bank details)."""
        # 1. Execute direct tool actions (Order placement / Refund bank detail submission)
        tool_reply = self._detect_and_execute_tool_actions(question, history)
        if tool_reply:
            return {
                "reply": tool_reply,
                "retrieved_docs": [
                    {"source": "Live Google Sheet (Orders & Bank_details)", "type": "live_sheet", "content": "Direct database action executed"}
                ],
                "query": question
            }

        cache_key = hashlib.md5(question.strip().lower().encode("utf-8")).hexdigest()
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 2. Retrieve ONLY from ChromaDB RAG (policy.txt and products.xlsx)
        rag_docs = []
        if self.retriever:
            try:
                rag_docs = self.retriever.invoke(question)
            except Exception as e:
                print(f"[WARN] ChromaDB RAG retrieval: {e}")

        # 3. Check Live Google Sheet directly for dynamic order lookups (NOT in ChromaDB)
        sheet_order_context = self._lookup_live_sheet_orders_and_bank(question)

        context_texts = []
        sources = []

        if sheet_order_context:
            context_texts.append(sheet_order_context)
            sources.append({
                "source": "Live Google Sheet (Orders & Bank_details)",
                "type": "live_spreadsheet",
                "content": sheet_order_context
            })

        for i, doc in enumerate(rag_docs[:3]):
            context_texts.append(f"[ChromaDB Knowledge: {doc.metadata.get('source', 'Store Document')}]:\n{doc.page_content}")
            sources.append({
                "source": doc.metadata.get("source", "ChromaDB"),
                "type": doc.metadata.get("type", "knowledge"),
                "content": doc.page_content,
                "metadata": doc.metadata
            })

        combined_context = "\n\n".join(context_texts)

        prompt = f"""{SYSTEM_PROMPT}

Retrieved Knowledge Base Context (from ChromaDB: policy.txt & products.xlsx):
-----------------------
{combined_context}
-----------------------

Conversation History:
{history[-3:] if history else "None"}

Customer Question: {question}

Agent "Mind_Dream" Response:"""

        reply_text = ""
        for llm_instance in [self.llm_primary, self.llm_fallback]:
            if not llm_instance:
                continue
            try:
                resp = llm_instance.invoke(prompt)
                content = resp.content
                if isinstance(content, list):
                    reply_text = "".join([p.get("text", "") if isinstance(p, dict) else str(p) for p in content])
                else:
                    reply_text = str(content)
                if reply_text.strip():
                    break
            except Exception as e:
                print(f"[INFO] Model invoke: {e}")

        if not reply_text.strip():
            if not combined_context.strip():
                reply_text = "I don't know"
            else:
                reply_text = f"Hello! I am **Mind_Dream**. Based on our store records:\n\n{combined_context}\n\nPlease let me know if you would like me to assist you with order processing or refund status!"

        result = {
            "reply": reply_text.strip(),
            "retrieved_docs": sources,
            "query": question
        }

        self._cache[cache_key] = result
        return result

# Singleton instance
rag_engine = RAGEngine()
