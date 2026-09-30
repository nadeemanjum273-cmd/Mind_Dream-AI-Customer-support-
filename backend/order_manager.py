import os
import re
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import pandas as pd
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

BASE_DIR = Path(__file__).resolve().parent.parent
EXCEL_PATH = BASE_DIR / "google_drive_data.xlsx"
PRODUCTS_PATH = BASE_DIR / "products.xlsx"
CREDS_FILE = BASE_DIR / "kinetic-highway-510207-a3-f36fca0ef9f9.json"
GOOGLE_DRIVE_FILE_ID = "1zTUpdY8ufxg6aPTV-5WLDrkyxughn7NP"

def get_excel_path() -> Path:
    if EXCEL_PATH.exists():
        return EXCEL_PATH
    return PRODUCTS_PATH

def sync_to_google_drive():
    """Uploads the updated local spreadsheet directly to Google Drive."""
    if not CREDS_FILE.exists() or not EXCEL_PATH.exists():
        return
    try:
        scopes = ['https://www.googleapis.com/auth/drive']
        creds = Credentials.from_service_account_file(str(CREDS_FILE), scopes=scopes)
        service = build('drive', 'v3', credentials=creds)
        media = MediaFileUpload(
            str(EXCEL_PATH),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            resumable=True
        )
        service.files().update(fileId=GOOGLE_DRIVE_FILE_ID, media_body=media).execute()
        print(f"[GOOGLE DRIVE] Successfully updated remote spreadsheet {GOOGLE_DRIVE_FILE_ID}!")
    except Exception as e:
        print(f"[GOOGLE DRIVE NOTE] Remote drive sync: {e}")

def place_order(customer_name: str, product_name: str, category: str = "Electronics") -> Dict[str, Any]:
    """Places a new order and appends it to the Orders worksheet in the spreadsheet."""
    path = get_excel_path()
    try:
        excel_f = pd.ExcelFile(path)
        
        # Read Orders sheet or create one
        if "Orders" in excel_f.sheet_names:
            df_orders = pd.read_excel(path, sheet_name="Orders")
        else:
            df_orders = pd.DataFrame(columns=["order_id", "customer", "product", "category", "days_ago", "Status"])
            
        # Determine next order ID
        existing_ids = df_orders["order_id"].dropna().tolist()
        numeric_ids = []
        for oid in existing_ids:
            m = re.search(r"ORD-(\d+)", str(oid))
            if m:
                numeric_ids.append(int(m.group(1)))
        next_num = max(numeric_ids, default=107) + 1
        new_order_id = f"ORD-{next_num}"
        
        new_row = {
            "order_id": new_order_id,
            "customer": customer_name.strip() if customer_name else "Valued Customer",
            "product": product_name.strip(),
            "category": category,
            "days_ago": 0,
            "Status": "Order Placed / Processing"
        }
        
        # Append row
        df_orders = pd.concat([df_orders, pd.DataFrame([new_row])], ignore_index=True)
        
        # Write back all sheets safely
        all_sheets = {}
        for sname in excel_f.sheet_names:
            if sname == "Orders":
                all_sheets[sname] = df_orders
            else:
                all_sheets[sname] = pd.read_excel(path, sheet_name=sname)
        if "Orders" not in all_sheets:
            all_sheets["Orders"] = df_orders
            
        with pd.ExcelWriter(path, engine="openpyxl") as writer:
            for sname, sheet_df in all_sheets.items():
                sheet_df.to_excel(writer, sheet_name=sname, index=False)
                
        # Sync back to Google Drive
        sync_to_google_drive()
                
        return {
            "success": True,
            "order_id": new_order_id,
            "customer": new_row["customer"],
            "product": new_row["product"],
            "category": category,
            "message": f"Order {new_order_id} successfully created for {new_row['customer']} ({new_row['product']})!"
        }
    except Exception as e:
        print(f"[ERROR in place_order]: {e}")
        return {"success": False, "error": str(e)}

def record_refund_bank_details(order_id: str, customer_name: str, product_name: str, bank_name: str, account_number: str, mobile_number: str) -> Dict[str, Any]:
    """Updates order status to Return Approved and saves bank details to Bank_details sheet."""
    path = get_excel_path()
    try:
        excel_f = pd.ExcelFile(path)
        all_sheets = {}
        for sname in excel_f.sheet_names:
            all_sheets[sname] = pd.read_excel(path, sheet_name=sname)
            
        # Update Orders status
        if "Orders" in all_sheets:
            df_orders = all_sheets["Orders"]
            mask = df_orders["order_id"].astype(str).str.upper() == order_id.upper().strip()
            if mask.any():
                df_orders.loc[mask, "Status"] = "Return Approved"
                all_sheets["Orders"] = df_orders
                
        # Read or create Bank_details
        if "Bank_details" in all_sheets:
            df_bank = all_sheets["Bank_details"]
        else:
            df_bank = pd.DataFrame(columns=["order_id", "customer", "product", "Bank_Name", "Account Number", "Mobile Number"])
            
        # Remove existing if already present, then add updated
        df_bank = df_bank[df_bank["order_id"].astype(str).str.upper() != order_id.upper().strip()]
        new_bank_row = {
            "order_id": order_id.upper().strip(),
            "customer": customer_name.strip(),
            "product": product_name.strip(),
            "Bank_Name": bank_name.strip(),
            "Account Number": str(account_number).strip(),
            "Mobile Number": str(mobile_number).strip()
        }
        df_bank = pd.concat([df_bank, pd.DataFrame([new_bank_row])], ignore_index=True)
        all_sheets["Bank_details"] = df_bank
        
        with pd.ExcelWriter(path, engine="openpyxl") as writer:
            for sname, sheet_df in all_sheets.items():
                sheet_df.to_excel(writer, sheet_name=sname, index=False)
                
        # Sync back to Google Drive
        sync_to_google_drive()
                
        return {
            "success": True,
            "order_id": order_id.upper().strip(),
            "bank_name": bank_name,
            "account_number": account_number,
            "message": f"Refund details recorded for {order_id}. Bank: {bank_name}, Account: {account_number}. Direct refund will be processed within 5 business days."
        }
    except Exception as e:
        print(f"[ERROR in record_refund_bank_details]: {e}")
        return {"success": False, "error": str(e)}
