import sys
import pdfplumber
import pandas as pd

def main():
    if len(sys.argv) < 3:
        print("Usage: python pdf2excel.py <input.pdf> <output.xlsx>")
        sys.exit(1)

    pdf_file = sys.argv[1]
    xlsx_file = sys.argv[2]

    try:
        with pdfplumber.open(pdf_file) as pdf:
            with pd.ExcelWriter(xlsx_file, engine='openpyxl') as writer:
                sheets_created = 0
                for i, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for j, table in enumerate(tables):
                        if table:
                            df = pd.DataFrame(table)
                            # Ensure sheet name is <= 31 chars
                            sheet_name = f'Page_{i+1}_Table_{j+1}'[:31]
                            df.to_excel(writer, sheet_name=sheet_name, index=False, header=False)
                            sheets_created += 1
                
                if sheets_created == 0:
                    df = pd.DataFrame(["No tables found in PDF"])
                    df.to_excel(writer, sheet_name='Sheet1', index=False, header=False)
                    
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
