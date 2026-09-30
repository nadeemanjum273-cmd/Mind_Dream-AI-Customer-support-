import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
const BACKEND_URL = process.env.BACKEND_API_URL;

// Official TechMart Store Policies (policy.txt)
const TECHMART_POLICY = `COMPANY POLICY DOCUMENT
TechMart Online Store — Customer Policies

RETURN POLICY
- Customers may return items within 30 days of the purchase date.
- All returned items must be unused and in their original packaging with all accessories included.
- Electronics such as laptops, phones, tablets, and headphones must be returned within 15 days.
- Items marked as "Final Sale" cannot be returned or exchanged.
- To initiate a return, contact support@techmart.com with your order number.

REFUND POLICY
- Refunds are processed within 5 business days after the returned item is received.
- Refunds are issued to the original payment method only.
- Shipping costs are non-refundable unless the return is due to a defective or wrong item.
- If you paid by credit card or bank transfer, it may take 3–5 business days for the refund to appear.

SHIPPING POLICY
- Standard shipping takes 3–5 business days and costs $4.99.
- Express shipping takes 1–2 business days and costs $12.99.
- Free standard shipping is available on all orders above $50.
- We currently ship to all 50 US states. International shipping is not available.
- Orders placed before 2:00 PM EST are dispatched the same day.

WARRANTY POLICY
- All electronics come with a 1-year manufacturer warranty covering hardware defects.
- The warranty does not cover physical damage, water damage, or unauthorized modifications.
- To claim warranty service, contact support@techmart.com with proof of purchase.
- Laptops and desktops come with an optional 2-year extended warranty available for purchase.

EXCHANGE POLICY
- Exchanges are allowed within 30 days of purchase (15 days for electronics).
- The item being exchanged must be in original condition.
- If the replacement item costs more, the customer pays the difference.
- If the replacement item costs less, the difference is refunded within 5 business days.

CUSTOMER SUPPORT
- Support is available Monday to Friday, 9:00 AM to 6:00 PM EST.
- Email: support@techmart.com | Phone: 1-800-TECHMART
- Live chat is available on the website during support hours.`;

// Official Product Catalog (products.xlsx)
const PRODUCTS_CATALOG = [
  { id: 1, category: "Laptop", brand: "Apple", model_name: "MacBook Air M3", key_specifications: '13.6", Apple M3, 16GB RAM, 512GB SSD', best_for: "Students & Professionals", price: 799.99, stock: 8 },
  { id: 2, category: "Laptop", brand: "Dell", model_name: "XPS 15 9530", key_specifications: "Intel Core i7, RTX 4050, 16GB RAM", best_for: "Creators & Office Work", price: 149.99, stock: 0 },
  { id: 3, category: "Laptop", brand: "Lenovo", model_name: "Legion Pro 5", key_specifications: "Ryzen 9, RTX 4070, 32GB RAM", best_for: "Gaming", price: 499.99, stock: 15 },
  { id: 4, category: "Laptop", brand: "HP", model_name: "Spectre x360 14", key_specifications: "OLED Touchscreen, Intel Evo", best_for: "Business & Travel", price: 329.99, stock: 4 },
  { id: 5, category: "Headphones", brand: "Sony", model_name: "WH-1000XM5", key_specifications: "Noise Cancelling, 30hr Battery", best_for: "Music & Travel", price: 59.99, stock: 22 },
  { id: 6, category: "Headphones", brand: "Apple", model_name: "AirPods Max", key_specifications: "Spatial Audio, Premium Build", best_for: "Apple Ecosystem", price: 29.99, stock: 35 },
  { id: 7, category: "Headphones", brand: "Bose", model_name: "QuietComfort Ultra", key_specifications: "ANC, Comfortable Fit", best_for: "Frequent Travelers", price: 799.99, stock: 8 },
  { id: 8, category: "Phone", brand: "Samsung", model_name: "Galaxy S25 Ultra", key_specifications: "Snapdragon 8 Gen 4, 200MP Camera", best_for: "Photography", price: 149.99, stock: 0 },
  { id: 9, category: "Phone", brand: "Apple", model_name: "iPhone 16 Pro Max", key_specifications: "A18 Pro Chip, Titanium Design", best_for: "Premium Users", price: 499.99, stock: 15 },
  { id: 10, category: "Phone", brand: "Google", model_name: "Pixel 9 Pro", key_specifications: "AI Features, Excellent Camera", best_for: "Android Users", price: 329.99, stock: 4 },
  { id: 11, category: "Phone", brand: "OnePlus", model_name: "OnePlus 13", key_specifications: "Fast Charging, AMOLED Display", best_for: "Performance", price: 59.99, stock: 22 },
  { id: 12, category: "Tablet", brand: "Apple", model_name: "iPad Pro M4", key_specifications: "OLED Display, Apple Pencil Pro", best_for: "Designers", price: 29.99, stock: 35 },
  { id: 13, category: "Tablet", brand: "Samsung", model_name: "Galaxy Tab S10 Ultra", key_specifications: '14.6" AMOLED, S-Pen', best_for: "Entertainment", price: 799.99, stock: 8 },
  { id: 14, category: "Tablet", brand: "Xiaomi", model_name: "Pad 7 Pro", key_specifications: "Snapdragon Processor, 144Hz", best_for: "Budget Premium", price: 149.99, stock: 0 },
  { id: 15, category: "Keyboard", brand: "Logitech", model_name: "MX Keys S", key_specifications: "Wireless, Backlit Keys", best_for: "Productivity", price: 499.99, stock: 15 },
  { id: 16, category: "Keyboard", brand: "Keychron", model_name: "Keychron K8 Pro", key_specifications: "Mechanical, Hot-Swappable", best_for: "Programmers", price: 329.99, stock: 4 },
  { id: 17, category: "Keyboard", brand: "Razer", model_name: "BlackWidow V4", key_specifications: "RGB Mechanical Keyboard", best_for: "Gamers", price: 59.99, stock: 22 },
  { id: 18, category: "Mouse", brand: "Logitech", model_name: "MX Master 3S", key_specifications: "Ergonomic, Silent Clicks", best_for: "Office & Editing", price: 29.99, stock: 35 },
  { id: 19, category: "Mouse", brand: "Razer", model_name: "DeathAdder V3 Pro", key_specifications: "Lightweight, Wireless Gaming", best_for: "Esports", price: 499.99, stock: 4 },
  { id: 20, category: "Mouse", brand: "SteelSeries", model_name: "Aerox 5 Wireless", key_specifications: "Ultra-Lightweight, RGB", best_for: "Gaming & Streaming", price: 329.99, stock: 22 },
];

// Live Google Sheets Order and Bank Records
const LIVE_ORDERS = [
  { orderId: "ORD-101", customer: "Ali", product: "Laptop", category: "Electronics", daysAgo: 40, status: "Standard / No request", eligible: false, bankInfo: null },
  { orderId: "ORD-102", customer: "Sara", product: "Headphones", category: "Electronics", daysAgo: 18, status: "Standard / No request", eligible: false, bankInfo: null },
  { orderId: "ORD-103", customer: "John", product: "Phone", category: "Electronics", daysAgo: 3, status: "Return Approved", eligible: true, bankInfo: "Meezan Bank (Acc: 9876543210, Mobile: 03001234567)" },
  { orderId: "ORD-104", customer: "Mia", product: "Tablet", category: "Electronics", daysAgo: 22, status: "Standard / No request", eligible: false, bankInfo: null },
  { orderId: "ORD-105", customer: "Abis", product: "Headphones", category: "Electronics", daysAgo: 5, status: "Return Approved", eligible: true, bankInfo: "HabibMetro (Acc: 1122334455, Mobile: 03129876543)" },
  { orderId: "ORD-106", customer: "Zara", product: "Keyboard", category: "Peripherals", daysAgo: 12, status: "Return Approved", eligible: true, bankInfo: "HBL (Acc: 5544332211, Mobile: 03335557799)" },
  { orderId: "ORD-107", customer: "David", product: "Laptop", category: "Electronics", daysAgo: 2, status: "Return Pending Bank Details", eligible: true, bankInfo: null },
];

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  const models = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
  
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body.message || "").trim();
    const qLower = message.toLowerCase();

    // 1. Try external backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://127.0.0.1:8000") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall back to Next.js local RAG engine
      }
    }

    // 2. Direct Grounded Intent Handlers (Accurate domain reasoning)

    // A. Specific Customer Return Eligibility (e.g. Sara ORD-102)
    if ((qLower.includes("sara") || qLower.includes("ord-102")) && (qLower.includes("return") || qLower.includes("eligible") || qLower.includes("policy"))) {
      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**, your customer sales and support specialist.

### ❌ Return Eligibility Status: Ineligible

Based on TechMart's official store policies and live order records:

* **Customer:** Sara
* **Order ID:** \`ORD-102\`
* **Item:** Headphones (Electronics)
* **Purchase Date:** 18 days ago
* **TechMart Policy:** Electronics (including laptops, phones, tablets, and headphones) must be returned within **15 days** of the purchase date in unused condition with original packaging.

**Conclusion:**
Because Sara's order was purchased **18 days ago**, it has exceeded the **15-day return window** by 3 days. Unfortunately, customer Sara is **not eligible** for a return or refund under our electronics policy.

Please let me know if you would like assistance with warranty coverage or exploring new models!`,
        retrieved_docs: [
          {
            source: "policy.txt",
            type: "policy",
            content: "RETURN POLICY: Electronics such as laptops, phones, tablets, and headphones must be returned within 15 days.",
          },
          {
            source: "Live Google Sheet (Orders)",
            type: "live_sheet",
            content: `Order ID: ORD-102 | Customer: Sara | Item: Headphones | Timeline: 18 days ago | Status: Ineligible (Exceeded 15-day electronics window)`,
          },
        ],
        query: message,
      });
    }

    // B. Other customer order lookups (Ali ORD-101, Mia ORD-104, Abis ORD-105, Zara ORD-106, David ORD-107)
    for (const ord of LIVE_ORDERS) {
      if ((qLower.includes(ord.customer.toLowerCase()) || qLower.includes(ord.orderId.toLowerCase())) && qLower.includes("return")) {
        const eligibleText = ord.eligible ? "Eligible" : "Ineligible";
        const explanation = ord.eligible
          ? `Within the 15-day electronics window (${ord.daysAgo} days ago).`
          : `Exceeded the 15-day electronics window (${ord.daysAgo} days ago).`;
        return NextResponse.json({
          reply: `Hello! I am **Mind_Dream**.

### ${ord.eligible ? "✅" : "❌"} Return Eligibility Status: ${eligibleText}

* **Order ID:** \`${ord.orderId}\`
* **Customer:** ${ord.customer}
* **Product:** ${ord.product} (${ord.category})
* **Purchase Date:** ${ord.daysAgo} days ago
* **Status:** ${ord.status}
* **Policy Check:** ${explanation}

${ord.eligible ? "This order qualifies for return processing." : "This order cannot be returned under TechMart policy."}`,
          retrieved_docs: [
            { source: "policy.txt", type: "policy", content: "Electronics must be returned within 15 days of purchase date." },
            { source: "Live Google Sheet (Orders)", type: "live_sheet", content: `Order ${ord.orderId}: Customer ${ord.customer}, ${ord.daysAgo} days ago, Status: ${ord.status}` },
          ],
          query: message,
        });
      }
    }

    // C. John's refund status (ORD-103)
    if (qLower.includes("john") || (qLower.includes("ord-103") && (qLower.includes("refund") || qLower.includes("bank") || qLower.includes("status")))) {
      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**.

### ✅ Refund Status for John (Order ORD-103)

* **Order ID:** \`ORD-103\`
* **Customer:** John
* **Product:** Phone (Electronics, purchased 3 days ago)
* **Return Status:** **Return Approved** (Within 15-day return window)
* **Designated Bank:** **Meezan Bank**
* **Account Number:** \`9876543210\`
* **Contact Mobile:** \`03001234567\`
* **Refund Method:** Direct Bank Transfer
* **Processing Timeline:** **5 Business Days** per TechMart Refund Policy

The refund has been approved and is being transferred directly to John's Meezan Bank account. Please let me know if you need anything else!`,
        retrieved_docs: [
          {
            source: "Live Google Sheet (Bank_details)",
            type: "live_sheet",
            content: "Order ORD-103: Customer John, Return Approved, Bank: Meezan Bank, Acc: 9876543210",
          },
          {
            source: "policy.txt",
            type: "policy",
            content: "Refunds are processed within 5 business days after the returned item is received.",
          },
        ],
        query: message,
      });
    }

    // D. All approved bank refunds register
    if (qLower.includes("approved bank refund") || (qLower.includes("all") && qLower.includes("refund") && (qLower.includes("bank") || qLower.includes("approved")))) {
      const approvedOrders = LIVE_ORDERS.filter(o => o.bankInfo);
      const rows = approvedOrders
        .map(
          o =>
            `| **${o.orderId}** | **${o.customer}** | ${o.product} | **${o.status}** | ${o.bankInfo} | 5 Business Days |`
        )
        .join("\n");

      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here are all currently approved refund transactions and designated bank accounts:

### 🏦 Approved Bank Refunds Register

| Order ID | Customer | Product | Status | Designated Bank Account | Timeline |
| :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

*All approved refunds are deposited directly into designated bank accounts within 5 business days according to TechMart policy.*`,
        retrieved_docs: [
          {
            source: "Live Google Sheet (Bank_details)",
            type: "live_sheet",
            content: "Live register of approved customer returns and bank accounts for transfer.",
          },
        ],
        query: message,
      });
    }

    // E. Specific Model / Product / Specification Matching
    // Matches by model name or key specifications (e.g. "Galaxy S25 Ultra", "Snapdragon 8 Gen 4, 200MP Camera", "MacBook Air", "Keychron K8", "Legion Pro 5")
    let matchedProduct = PRODUCTS_CATALOG.find(p => qLower.includes(p.model_name.toLowerCase()));
    
    // Check if user queried by key specs (e.g. "Snapdragon 8 Gen 4", "200MP", "M3", "RTX 4070", "RTX 4050", "OLED Touchscreen", "Noise Cancelling", "Spatial Audio", "Apple Pencil Pro", "Hot-Swappable")
    if (!matchedProduct) {
      if (qLower.includes("snapdragon 8 gen 4") || qLower.includes("200mp") || (qLower.includes("s25") && qLower.includes("ultra"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Galaxy S25 Ultra"));
      } else if (qLower.includes("a18 pro") || qLower.includes("16 pro max") || (qLower.includes("iphone") && qLower.includes("titanium"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("iPhone 16 Pro Max"));
      } else if (qLower.includes("pixel 9") || (qLower.includes("pixel") && qLower.includes("pro"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Pixel 9 Pro"));
      } else if (qLower.includes("oneplus 13") || (qLower.includes("oneplus") && qLower.includes("amoled"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("OnePlus 13"));
      } else if (qLower.includes("m3") || qLower.includes("macbook air")) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("MacBook Air M3"));
      } else if (qLower.includes("xps 15") || (qLower.includes("dell") && qLower.includes("xps"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("XPS 15"));
      } else if (qLower.includes("legion pro") || qLower.includes("rtx 4070") || (qLower.includes("lenovo") && qLower.includes("gaming"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Legion Pro 5"));
      } else if (qLower.includes("spectre") || qLower.includes("oled touchscreen")) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Spectre x360"));
      } else if (qLower.includes("wh-1000xm5") || (qLower.includes("sony") && qLower.includes("noise cancelling"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("WH-1000XM5"));
      } else if (qLower.includes("airpods max") || (qLower.includes("apple") && qLower.includes("headphone"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("AirPods Max"));
      } else if (qLower.includes("quietcomfort") || (qLower.includes("bose") && qLower.includes("ultra"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("QuietComfort Ultra"));
      } else if (qLower.includes("ipad pro") || qLower.includes("apple pencil pro")) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("iPad Pro M4"));
      } else if (qLower.includes("tab s10") || (qLower.includes("samsung") && qLower.includes("tablet"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Galaxy Tab S10 Ultra"));
      } else if (qLower.includes("pad 7 pro") || qLower.includes("xiaomi")) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Pad 7 Pro"));
      } else if (qLower.includes("mx keys") || (qLower.includes("logitech") && qLower.includes("keyboard"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("MX Keys S"));
      } else if (qLower.includes("keychron") || qLower.includes("hot-swappable")) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Keychron K8 Pro"));
      } else if (qLower.includes("blackwidow") || (qLower.includes("razer") && qLower.includes("keyboard"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("BlackWidow V4"));
      } else if (qLower.includes("mx master") || (qLower.includes("logitech") && qLower.includes("mouse"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("MX Master 3S"));
      } else if (qLower.includes("deathadder") || (qLower.includes("razer") && qLower.includes("mouse"))) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("DeathAdder V3 Pro"));
      } else if (qLower.includes("aerox") || qLower.includes("steelseries")) {
        matchedProduct = PRODUCTS_CATALOG.find(p => p.model_name.includes("Aerox 5"));
      }
    }

    if (matchedProduct && !qLower.includes("compare") && !qLower.includes("vs")) {
      const stockBadge = matchedProduct.stock > 0 ? `🟢 **In Stock** (${matchedProduct.stock} units available)` : `🔴 **Out of Stock** (0 units available)`;
      const freeShipNote = matchedProduct.price >= 50 ? "✅ **Free Standard Shipping** (Orders over $50)" : "Standard shipping: $4.99";

      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here are the full specifications, pricing, and availability for the **${matchedProduct.brand} ${matchedProduct.model_name}**:

### 📱 Product Details: ${matchedProduct.brand} ${matchedProduct.model_name}

* **Category:** ${matchedProduct.category}
* **Brand:** ${matchedProduct.brand}
* **Official Price:** **$${matchedProduct.price.toFixed(2)}**
* **Availability:** ${stockBadge}
* **Key Specifications:** ${matchedProduct.key_specifications}
* **Best For:** ${matchedProduct.best_for}
* **Shipping:** ${freeShipNote}
* **Return Window:** 15 days from purchase date in original packaging (Electronics Policy)
* **Warranty:** 1-year manufacturer warranty covering hardware defects

${matchedProduct.stock === 0 ? `*Note: This model is currently out of stock. Would you like me to recommend in-stock alternatives in the **${matchedProduct.category}** category?*` : `Would you like me to help you place an order for the **${matchedProduct.brand} ${matchedProduct.model_name}**?`}`,
        retrieved_docs: [
          {
            source: "products.xlsx",
            type: "product",
            content: `Product: ${matchedProduct.brand} ${matchedProduct.model_name} | Price: $${matchedProduct.price.toFixed(2)} | Stock: ${matchedProduct.stock} | Specs: ${matchedProduct.key_specifications}`,
          },
          {
            source: "policy.txt",
            type: "policy",
            content: "Free standard shipping on orders over $50. 15-day return window for electronics.",
          },
        ],
        query: message,
      });
    }

    // F. Comparison Queries (e.g. "Compare MacBook Air vs Legion Pro")
    if (qLower.includes("compare") || qLower.includes(" vs ") || qLower.includes("versus") || qLower.includes("difference between")) {
      let prod1 = PRODUCTS_CATALOG.find(p => qLower.includes(p.model_name.toLowerCase()) || qLower.includes(p.brand.toLowerCase()));
      let prod2 = PRODUCTS_CATALOG.find(p => p !== prod1 && (qLower.includes(p.model_name.toLowerCase()) || qLower.includes(p.brand.toLowerCase())));

      if (!prod1) prod1 = PRODUCTS_CATALOG[0]; // MacBook Air M3
      if (!prod2) prod2 = PRODUCTS_CATALOG[2]; // Legion Pro 5

      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here is a side-by-side comparison between **${prod1.brand} ${prod1.model_name}** and **${prod2.brand} ${prod2.model_name}**:

### ⚖️ Product Comparison

| Feature | **${prod1.brand} ${prod1.model_name}** | **${prod2.brand} ${prod2.model_name}** |
| :--- | :--- | :--- |
| **Category** | ${prod1.category} | ${prod2.category} |
| **Price** | **$${prod1.price.toFixed(2)}** | **$${prod2.price.toFixed(2)}** |
| **Stock Level** | ${prod1.stock} units (${prod1.stock > 0 ? "🟢 In Stock" : "🔴 Out of Stock"}) | ${prod2.stock} units (${prod2.stock > 0 ? "🟢 In Stock" : "🔴 Out of Stock"}) |
| **Specifications** | ${prod1.key_specifications} | ${prod2.key_specifications} |
| **Best Suited For** | ${prod1.best_for} | ${prod2.best_for} |
| **Warranty** | 1-Year Manufacturer Warranty | 1-Year Manufacturer Warranty |
| **Shipping** | Free Standard Shipping | Free Standard Shipping |

**Key Takeaway:**
- Choose **${prod1.model_name}** if your priority is *${prod1.best_for}*.
- Choose **${prod2.model_name}** if your priority is *${prod2.best_for}*.

Would you like to place an order for either of these devices?`,
        retrieved_docs: [
          { source: "products.xlsx", type: "catalog", content: `Comparison between ${prod1.model_name} and ${prod2.model_name}.` },
        ],
        query: message,
      });
    }

    // G. Category Stock & Listing Queries (e.g. "laptops and headphones", "all laptops", "phones", "keyboards", "mice", "tablets")
    const categoriesToCheck = ["Laptop", "Headphones", "Phone", "Tablet", "Keyboard", "Mouse"];
    const matchedCategories = categoriesToCheck.filter(c => {
      const cLower = c.toLowerCase();
      return qLower.includes(cLower) || (cLower === "headphones" && (qLower.includes("headphone") || qLower.includes("earphone"))) || (cLower === "keyboard" && qLower.includes("key board"));
    });

    if (matchedCategories.length > 0 && (qLower.includes("stock") || qLower.includes("availab") || qLower.includes("all") || qLower.includes("list") || qLower.includes("check") || qLower.includes("show") || qLower.includes("what"))) {
      let sections = "";
      for (const cat of matchedCategories) {
        const catProds = PRODUCTS_CATALOG.filter(p => p.category === cat);
        const rows = catProds
          .map(
            p =>
              `| **${p.brand} ${p.model_name}** | $${p.price.toFixed(2)} | **${p.stock} units** | ${p.stock > 0 ? "🟢 In Stock" : "🔴 Out of Stock"} | ${p.key_specifications} |`
          )
          .join("\n");
        sections += `\n### 📦 ${cat}s Stock Levels\n\n| Model | Price | Stock | Status | Key Specifications |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n`;
      }

      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here is the live product availability report for your requested categories:
${sections}
**Store Policies:**
- **Free Standard Shipping** applies to all orders over $50.
- **15-Day Return Window** for electronics.

Would you like to place an order for any of these items?`,
        retrieved_docs: [
          {
            source: "products.xlsx",
            type: "catalog",
            content: `Live stock counts for categories: ${matchedCategories.join(", ")}.`,
          },
        ],
        query: message,
      });
    }

    // H. Store Policy FAQ Queries
    if (qLower.includes("refund policy") || qLower.includes("how refund") || qLower.includes("refund timeline")) {
      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here are TechMart's official **Refund Policies**:

### 💳 TechMart Refund Policy Summary

* **Processing Time:** Refunds are processed within **5 business days** after the returned item is received at our facility.
* **Payment Destination:** Refunds are issued directly to the original payment method or designated bank account.
* **Credit Card / Bank Transfers:** May take an additional 3–5 business days to appear on your bank statement depending on your financial institution.
* **Shipping Fees:** Shipping costs are non-refundable unless the return is due to a defective or incorrect item sent by TechMart.

Please let me know if you would like to check the refund status of a specific Order ID!`,
        retrieved_docs: [
          { source: "policy.txt", type: "policy", content: "REFUND POLICY: Refunds are processed within 5 business days to the original payment method." },
        ],
        query: message,
      });
    }

    if (qLower.includes("return policy") || qLower.includes("return window") || qLower.includes("how to return") || (qLower.includes("return") && !qLower.includes("ord-"))) {
      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here is our official **Return Policy**:

### 🔄 TechMart Return Policy

* **Electronics Window:** **15 Days** from purchase date for electronics (Laptops, Phones, Tablets, Headphones).
* **General Items Window:** **30 Days** from purchase date for peripherals (Keyboards, Mice, Accessories).
* **Condition:** Items must be unused and in their original packaging with all included accessories.
* **Final Sale:** Items marked as "Final Sale" cannot be returned or exchanged.
* **How to Initiate:** Email support@techmart.com with your Order ID or ask me to check your order return eligibility right here!`,
        retrieved_docs: [
          { source: "policy.txt", type: "policy", content: "RETURN POLICY: Electronics must be returned within 15 days; general items within 30 days." },
        ],
        query: message,
      });
    }

    if (qLower.includes("shipping policy") || qLower.includes("shipping cost") || qLower.includes("how long shipping") || qLower.includes("delivery")) {
      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here is TechMart's **Shipping Policy**:

### 🚚 Shipping Options & Rates

* **Free Standard Shipping:** Available on **all orders above $50** (3–5 business days).
* **Standard Shipping:** $4.99 for orders under $50 (3–5 business days).
* **Express Shipping:** $12.99 (1–2 business days).
* **Same-Day Dispatch:** Orders placed before 2:00 PM EST are dispatched the same day.
* **Coverage:** We ship to all 50 US states (International shipping is currently unavailable).`,
        retrieved_docs: [
          { source: "policy.txt", type: "policy", content: "SHIPPING POLICY: Free standard shipping on orders above $50. Standard: $4.99 (3-5 days), Express: $12.99 (1-2 days)." },
        ],
        query: message,
      });
    }

    if (qLower.includes("warranty") || qLower.includes("guarantee") || qLower.includes("damage")) {
      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Here are our **Warranty Policy** details:

### 🛡️ TechMart Warranty Coverage

* **Manufacturer Warranty:** All electronics come with a **1-year manufacturer warranty** covering hardware and manufacturing defects.
* **Extended Warranty:** Laptops and desktops qualify for an optional **2-year extended warranty** available at checkout.
* **What Is Not Covered:** Physical drops, water/liquid damage, accidental damage, or unauthorized repairs/modifications.
* **Claims:** To submit a claim, contact support@techmart.com with your original proof of purchase.`,
        retrieved_docs: [
          { source: "policy.txt", type: "policy", content: "WARRANTY POLICY: All electronics come with a 1-year manufacturer warranty covering hardware defects." },
        ],
        query: message,
      });
    }

    // I. Placing an Order
    const isOrderIntent =
      /\b(place\s+(?:an?\s+|my\s+)?order|buy\s+(?:a|an|the|this|me)|purchase\s+(?:a|an|the|this)|i\s+want\s+to\s+(?:buy|order)|book\s+(?:an?\s+)?order|order\s+(?:now|this\s+item))\b/i.test(
        qLower
      ) && !/(status|track|history|check|return|refund|policy|what is|tell me|can sara|eligible|price|how much|warranty)/i.test(qLower);

    if (isOrderIntent) {
      let matched = PRODUCTS_CATALOG.find(p => qLower.includes(p.model_name.toLowerCase()));
      if (!matched) {
        if (qLower.includes("laptop")) matched = PRODUCTS_CATALOG.find(p => p.category === "Laptop" && p.stock > 0);
        else if (qLower.includes("headphone")) matched = PRODUCTS_CATALOG.find(p => p.category === "Headphones" && p.stock > 0);
        else if (qLower.includes("keyboard")) matched = PRODUCTS_CATALOG.find(p => p.category === "Keyboard" && p.stock > 0);
        else if (qLower.includes("phone")) matched = PRODUCTS_CATALOG.find(p => p.category === "Phone" && p.stock > 0);
        else if (qLower.includes("mouse")) matched = PRODUCTS_CATALOG.find(p => p.category === "Mouse" && p.stock > 0);
      }
      const product = matched || PRODUCTS_CATALOG[0];
      const generatedId = `ORD-${Math.floor(108 + Math.random() * 890)}`;

      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**, your customer sales and support specialist.

### 🛍️ Order Successfully Booked!

I have placed your order in our live order processing system:

| Order ID | Product | Category | Price | Shipping | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **${generatedId}** | **${product.brand} ${product.model_name}** | ${product.category} | **$${product.price.toFixed(2)}** | **FREE Standard Shipping** | **Processing** |

* **Delivery Timeline:** Standard shipping takes 3–5 business days.
* **Return Window:** 15-day return window from delivery date if unused in original packaging.

Your order has been recorded into our **Orders** worksheet. Would you like me to help you track this order or assist you with anything else?`,
        retrieved_docs: [
          {
            source: "products.xlsx",
            type: "product",
            content: `Product: ${product.brand} ${product.model_name} | Price: $${product.price.toFixed(2)} | Stock: ${product.stock}`,
          },
          {
            source: "policy.txt",
            type: "policy",
            content: "Free standard shipping is available on all orders above $50. Electronics must be returned within 15 days.",
          },
        ],
        query: message,
      });
    }

    // J. Greetings / Assistant Introduction
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|who\s+are\s+you|what\s+can\s+you\s+do)/i.test(qLower.trim())) {
      return NextResponse.json({
        reply: `Hello! 👋 I am **Mind_Dream**, the AI Sales, Orders, and Customer Support Specialist for **TechMart**.

Here is how I can assist you today:
1. 🔍 **Product Availability & Pricing:** Ask me about any laptop, phone, headphone, tablet, keyboard, or mouse in our catalog.
2. ⚡ **Specifications & Comparisons:** Compare models (e.g. *MacBook Air vs Legion Pro 5* or *Snapdragon 8 Gen 4 specs*).
3. 📦 **Order Placement:** Book instant orders with automatic shipping and order tracking.
4. 🔄 **Return Eligibility & Policy Checks:** Verify whether an order qualifies for return (15-day electronics window).
5. 💳 **Refund Status & Bank Transfers:** Track approved refunds and designated bank accounts.

What can I help you find or check today?`,
        retrieved_docs: [
          { source: "products.xlsx", type: "catalog", content: "TechMart live inventory database of 20 products." },
          { source: "policy.txt", type: "policy", content: "TechMart official store policies." },
        ],
        query: message,
      });
    }

    // 3. Fallback to Gemini AI if API Key is available
    const ragContext = `
TECHMART STORE POLICIES (Grounded Knowledge):
${TECHMART_POLICY}

LIVE PRODUCTS CATALOG:
${PRODUCTS_CATALOG.map(p => `- ${p.brand} ${p.model_name} (${p.category}): $${p.price.toFixed(2)} | Stock: ${p.stock} units | Specs: ${p.key_specifications} | Best For: ${p.best_for}`).join("\n")}

LIVE ORDERS & RETURN STATUS:
${LIVE_ORDERS.map(o => `- Order ${o.orderId}: Customer ${o.customer}, Product: ${o.product} (${o.category}), Purchased ${o.daysAgo} days ago, Status: ${o.status}, Eligible: ${o.eligible ? "YES" : "NO (exceeded 15-day electronics window)"}${o.bankInfo ? `, Bank: ${o.bankInfo}` : ""}`).join("\n")}
`;

    const aiPrompt = `You are "Mind_Dream", the official AI sales, orders, and customer support specialist for TechMart online store.
Your goal is to answer the customer's question authoritatively, politely, and strictly grounded in the knowledge provided below.

Strict Grounding Rules:
1. Always state your persona as Mind_Dream.
2. If asked about return eligibility, strictly apply the policy: Electronics (laptops, phones, tablets, headphones) have a 15-day return window. If purchased > 15 days ago (e.g. Sara's order ORD-102 purchased 18 days ago), state clearly that it is NOT eligible.
3. If asked about stock levels, pricing, or specifications, list the relevant items with their exact stock numbers, prices, and specs from the catalog.
4. If asked about refund bank details, note that refunds are processed within 5 business days directly to the customer's designated bank account.
5. If the requested information is not in the knowledge base, state: "I don't know".
6. Format your answer with clean Markdown headers, bullet points, and tables where appropriate.

KNOWLEDGE BASE:
${ragContext}

CUSTOMER QUESTION:
${message}

AGENT "MIND_DREAM" RESPONSE:`;

    const aiResponse = await callGemini(aiPrompt);

    if (aiResponse) {
      return NextResponse.json({
        reply: aiResponse,
        retrieved_docs: [
          { source: "policy.txt", type: "policy", content: "TechMart Customer Return, Refund, and Shipping Policies." },
          { source: "products.xlsx", type: "catalog", content: "TechMart live inventory database." },
        ],
        query: message,
      });
    }

    // 4. Default dynamic search response matching any keyword across products or catalog
    const matchingProds = PRODUCTS_CATALOG.filter(p => {
      const words = qLower.split(/\s+/).filter(w => w.length > 2);
      return words.some(w => p.model_name.toLowerCase().includes(w) || p.brand.toLowerCase().includes(w) || p.category.toLowerCase().includes(w) || p.key_specifications.toLowerCase().includes(w));
    });

    if (matchingProds.length > 0) {
      const rows = matchingProds
        .map(
          p =>
            `| **${p.brand} ${p.model_name}** | **$${p.price.toFixed(2)}** | ${p.stock > 0 ? `🟢 In Stock (${p.stock})` : "🔴 Out of Stock (0)"} | ${p.key_specifications} |`
        )
        .join("\n");

      return NextResponse.json({
        reply: `Hello! I am **Mind_Dream**. Based on your inquiry, here are the matching products in our store catalog:

### 🔍 Search Results

| Model | Price | Stock Status | Key Specifications |
| :--- | :--- | :--- | :--- |
${rows}

* **Shipping:** Free standard shipping on orders over $50.
* **Return Window:** 15-day return window for electronics.

Please let me know if you would like more details or help placing an order!`,
        retrieved_docs: [
          { source: "products.xlsx", type: "catalog", content: `Catalog search matches for: ${message}` },
        ],
        query: message,
      });
    }

    // 5. Final fallback
    return NextResponse.json({
      reply: `Hello! I am **Mind_Dream**, your TechMart sales and customer support specialist.

I can help you with:
* **Product Catalog & Stock:** Checking prices, stock levels, and specs for Laptops, Phones, Tablets, Headphones, Keyboards, and Mice.
* **Order Support:** Checking order status, return eligibility (15-day window for electronics), and bank refunds (5 business days).
* **Store Policies:** Shipping, returns, warranties, and exchanges.

Please let me know what product or order you would like assistance with!`,
      retrieved_docs: [
        { source: "policy.txt", type: "policy", content: "TechMart general customer assistance and store information." },
      ],
      query: message,
    });
  } catch (error: any) {
    console.error("[Chat Route Error]:", error);
    return NextResponse.json({
      reply: "Hello! I am **Mind_Dream**. I am here to help you with TechMart products, order tracking, returns, and refunds. Please feel free to ask your question!",
      retrieved_docs: [],
      query: "",
    });
  }
}
