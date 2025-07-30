import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import io

class OCRModule:
    @staticmethod
    def extract_text_from_image(image_bytes: bytes) -> str:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image)
            if not text.strip():
                raise ValueError("No text detected. Image may be blurry or low quality.")
            return text
        except Exception as e:
            raise RuntimeError(f"OCR failed: {e}")

    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        try:
            pages = convert_from_path(pdf_path)
            all_text = []
            for page in pages:
                text = pytesseract.image_to_string(page)
                all_text.append(text)
            if not any(t.strip() for t in all_text):
                raise ValueError("No text detected in PDF. Scans may be poor quality.")
            return "\n".join(all_text)
        except Exception as e:
            raise RuntimeError(f"PDF OCR failed: {e}") 