import json
import gspread
import pandas as pd
from google.oauth2.service_account import Credentials

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive'
]

creds_file = 'kinetic-highway-510207-a3-f36fca0ef9f9.json'
sheet_id = '1zTUpdY8ufxg6aPTV-5WLDrkyxughn7NP'

def main():
    try:
        creds = Credentials.from_service_account_file(creds_file, scopes=SCOPES)
        gc = gspread.authorize(creds)
        sh = gc.open_by_key(sheet_id)
        print(f"SUCCESS: Opened Google Spreadsheet '{sh.title}'")
        
        for ws in sh.worksheets():
            print(f"\n--- Worksheet: '{ws.title}' (gid: {ws.id}) ---")
            values = ws.get_all_values()
            print(f"Total Rows: {len(values)}")
            if len(values) > 0:
                print("Header:", values[0])
                for row in values[1:10]:
                    print("Row:", row)
            
            # Save worksheet as excel/csv locally for indexing
            if len(values) > 1:
                df = pd.DataFrame(values[1:], columns=values[0])
                clean_title = ws.title.strip().replace(" ", "_").lower()
                csv_name = f"google_sheet_{clean_title}.csv"
                df.to_csv(csv_name, index=False)
                print(f"Saved local copy as {csv_name} ({len(df)} rows)")
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    main()
