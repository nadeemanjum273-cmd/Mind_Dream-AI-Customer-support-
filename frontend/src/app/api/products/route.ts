import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

const FALLBACK_PRODUCTS = [
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

export async function GET() {
  if (BACKEND_URL && BACKEND_URL !== "http://127.0.0.1:8000") {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback below
    }
  }

  return NextResponse.json({ products: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length });
}
