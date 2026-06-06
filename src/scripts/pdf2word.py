import sys
from pdf2docx import Converter

def main():
    if len(sys.argv) < 3:
        print("Usage: python pdf2word.py <input.pdf> <output.docx>")
        sys.exit(1)

    pdf_file = sys.argv[1]
    docx_file = sys.argv[2]

    try:
        cv = Converter(pdf_file)
        cv.convert(docx_file)
        cv.close()
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
