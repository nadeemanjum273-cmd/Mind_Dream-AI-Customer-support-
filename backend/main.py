import os
import re
from typing import List, Optional, Dict, Any
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from rag_engine import rag_engine, PRODUCTS_PATH, POLICY_PATH, GOOGLE_DRIVE_EXCEL_PATH, BASE_DIR

app = FastAPI(
    title="Mind_dream E-Commerce Support Agent API",
    description="High-performance backend powering Mind_dream Next.js support agent with LangChain, ChromaDB, and Gemini",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    reply: str
    retrieved_docs: List[Dict[str, Any]]
    query: str

class SyncSheetRequest(BaseModel):
    sheet_url: Optional[str] = None
    sheet_type: Optional[str] = "orders"

@app.on_event("startup")
async def startup_event():
    """Ensure vectorstore and documents are ready on startup."""
    try:
        rag_engine.sync_google_sheet_data()
        if not rag_engine.vectorstore:
            rag_engine.build_index()
        print("[STARTUP] ChromaDB RAG and Live Google Sheet initialized successfully!")
    except Exception as e:
        print(f"[STARTUP WARN] Init note: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "agent": "Mind_dream",
        "primary_model": "Gemini 3.5 Flash-Lite (Fast)",
        "fallback_model": "Gemini 3.8 Flash",
        "embeddings": "gemini-embedding-2",
        "indexed": rag_engine.vectorstore is not None or len(rag_engine._raw_docs) > 0,
        "cached_queries": len(rag_engine._cache)
    }

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    try:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
        result = rag_engine.query(request.message, history=history_dicts)
        return ChatResponse(
            reply=result["reply"],
            retrieved_docs=result["retrieved_docs"],
            query=result["query"]
        )
    except Exception as e:
        print(f"[ERROR in /api/chat]: {e}")
        return ChatResponse(
            reply="I don't know",
            retrieved_docs=[],
            query=request.message
        )

@app.get("/api/products")
def get_products():
    """Returns products list for dashboard product tables & catalog."""
    source_file = GOOGLE_DRIVE_EXCEL_PATH if GOOGLE_DRIVE_EXCEL_PATH.exists() else PRODUCTS_PATH
    if not source_file.exists():
        raise HTTPException(status_code=404, detail="Products dataset not found")
    try:
        excel_f = pd.ExcelFile(source_file)
        sheet_to_read = "products" if "products" in excel_f.sheet_names else 0
        df = pd.read_excel(source_file, sheet_name=sheet_to_read)
        df = df.fillna("")
        products = []
        for idx, row in df.iterrows():
            products.append({
                "id": idx + 1,
                "category": str(row.get("Category", "")),
                "brand": str(row.get("Brand", "")),
                "model_name": str(row.get("Model Name", "")),
                "key_specifications": str(row.get("Key Specifications", "")),
                "best_for": str(row.get("Best For", "")),
                "price": float(row.get("price", 0.0)),
                "stock": int(row.get("stock", 0))
            })
        return {"products": products, "total": len(products)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read products: {e}")

@app.get("/api/orders")
def get_orders():
    """Returns live customer orders and refund bank details."""
    if not GOOGLE_DRIVE_EXCEL_PATH.exists():
        return {"orders": [], "bank_details": []}
    try:
        excel_f = pd.ExcelFile(GOOGLE_DRIVE_EXCEL_PATH)
        orders = []
        bank_details = []
        if "Orders" in excel_f.sheet_names:
            df_o = pd.read_excel(GOOGLE_DRIVE_EXCEL_PATH, sheet_name="Orders").fillna("")
            orders = df_o.to_dict(orient="records")
        if "Bank_details" in excel_f.sheet_names:
            df_b = pd.read_excel(GOOGLE_DRIVE_EXCEL_PATH, sheet_name="Bank_details").fillna("")
            bank_details = df_b.to_dict(orient="records")
        return {"orders": orders, "bank_details": bank_details}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/policy")
def get_policy():
    if not POLICY_PATH.exists():
        raise HTTPException(status_code=404, detail="policy.txt not found")
    try:
        with open(POLICY_PATH, "r", encoding="utf-8") as f:
            raw_text = f.read()
        return {"raw": raw_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reindex")
def reindex_endpoint():
    try:
        rag_engine.build_index(force=True)
        return {"status": "success", "message": "Vector store reindexed successfully with gemini-embedding-2!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reindexing failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
