import io
import pandas as pd
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive'
]

creds_file = 'kinetic-highway-510207-a3-f36fca0ef9f9.json'
file_id = '1zTUpdY8ufxg6aPTV-5WLDrkyxughn7NP'

def main():
    try:
        creds = Credentials.from_service_account_file(creds_file, scopes=SCOPES)
        service = build('drive', 'v3', credentials=creds)
        
        # Get file metadata
        file_meta = service.files().get(fileId=file_id, fields='id, name, mimeType, size').execute()
        print("File Metadata:")
        print(file_meta)
        
        mime_type = file_meta.get('mimeType')
        name = file_meta.get('name', 'downloaded_sheet.xlsx')
        
        fh = io.BytesIO()
        if mime_type == 'application/vnd.google-apps.spreadsheet':
            # Export Google Sheet to Excel
            request = service.files().export_media(fileId=file_id, mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        else:
            # Direct binary download for uploaded Excel files
            request = service.files().get_media(fileId=file_id)
            
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
            if status:
                print(f"Download Progress: {int(status.progress() * 100)}%")
                
        fh.seek(0)
        
        # Save as local excel
        save_path = "google_drive_data.xlsx"
        with open(save_path, "wb") as f:
            f.write(fh.read())
        print(f"\nSUCCESS: Saved downloaded file as '{save_path}'")
        
        # Read all sheets in the Excel workbook
        excel_file = pd.ExcelFile(save_path)
        print("\nSheets found in workbook:", excel_file.sheet_names)
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(save_path, sheet_name=sheet_name)
            print(f"\n================ Sheet: '{sheet_name}' (Total Rows: {len(df)}) ================")
            print("Columns:", list(df.columns))
            print(df.head(10))
            
    except Exception as e:
        print("Error during Drive extraction:", e)

if __name__ == "__main__":
    main()
