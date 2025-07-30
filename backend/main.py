import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.ocr_module import OCRModule
from backend.text_store import add_contract_text
from backend.text_store import get_contract_text
from backend.qa_module import run_agentic_analysis
import tempfile
from pydantic import BaseModel
import traceback
from fastapi.responses import FileResponse
from fpdf import FPDF

load_dotenv()

# OpenAI API key should be set in environment variables or .env file
# os.environ["OPENAI_API_KEY"] = "your_api_key_here"
# os.environ["OPENAI_API_BASE"] = "https://api.openai.com/v1"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    document_id: str = None
    agent_type: str = None

class AnalyzeRequest(BaseModel):
    analysis_type: str

class PDFExportRequest(BaseModel):
    outputs: list[str]
    agent_names: list[str]

class RewriteRequest(BaseModel):
    original_text: str
    ambiguities_output: str

def clean_text(text):
    return (
        text.replace('\u201c', '"').replace('\u201d', '"')
            .replace('\u2018', "'").replace('\u2019', "'")
            .replace('\u2013', '-').replace('\u2014', '-')
            .encode('latin-1', 'replace').decode('latin-1')
    )

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        filename = file.filename
        contents = await file.read()
        if filename.lower().endswith(".pdf"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(contents)
                tmp_path = tmp.name
            text = OCRModule.extract_text_from_pdf(tmp_path)
        else:
            text = OCRModule.extract_text_from_image(contents)
        document_id = os.urandom(8).hex()
        print(f"UPLOAD: Storing document_id={document_id} for file={filename}")  # Debug print
        add_contract_text(document_id, text)
        print(f"UPLOAD: Successfully stored text for document_id={document_id}")  # Debug print
        return {"document_id": document_id, "filename": filename, "status": "processed"}
    except Exception as e:
        print("UPLOAD ERROR:", e)  # Debug print
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        agent_type = request.agent_type or "summary"
        document_id = request.document_id
        result = run_agentic_analysis(document_id, agent_type)
        return {"response": result, "agent": agent_type}
    except Exception as e:
        return {"response": f"Error: {str(e)}", "agent": agent_type}

@app.post("/analyze/{document_id}")
async def analyze_document(document_id: str, request: AnalyzeRequest):
    try:
        result = run_agentic_analysis(document_id, request.analysis_type)
        return {"response": result, "agent": request.analysis_type}
    except Exception as e:
        print("ANALYZE ERROR:", e)
        traceback.print_exc()  # Print full traceback
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/export-pdf/{document_id}")
async def export_pdf(document_id: str, request: PDFExportRequest):
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Analysis Report for Document ID: {document_id}", ln=True, align='C')
        pdf.ln(10)
        for name, output in zip(request.agent_names, request.outputs):
            pdf.set_font("Arial", style="B", size=12)
            pdf.cell(200, 10, txt=name, ln=True)
            pdf.set_font("Arial", size=12)
            for line in output.splitlines():
                pdf.multi_cell(0, 10, line)
            pdf.ln(5)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf.output(tmp.name)
            tmp_path = tmp.name
        return FileResponse(tmp_path, filename=f"analysis_{document_id}.pdf", media_type="application/pdf")
    except Exception as e:
        print("EXPORT PDF ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rewrite-contract/{document_id}")
async def rewrite_contract(document_id: str, request: RewriteRequest):
    try:
        from openai import OpenAI
        client = OpenAI()
        prompt = (
            "You are a legal contract editor. Given the following contract text and a list of ambiguities with suggested improvements, "
            "rewrite the contract by replacing all ambiguous terms and sentences with the suggested improvements. "
            "Keep the structure and meaning of the contract intact, but make it as clear and unambiguous as possible.\n\n"
            f"Contract Text:\n{request.original_text}\n\nAmbiguities and Suggestions:\n{request.ambiguities_output}\n\nRephrased Contract:"
        )
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4096
        )
        rephrased_contract = response.choices[0].message.content.strip()
        # Generate PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Rephrased Contract for Document ID: {document_id}", ln=True, align='C')
        pdf.ln(10)
        for line in rephrased_contract.splitlines():
            pdf.multi_cell(0, 10, clean_text(line))
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf.output(tmp.name)
            tmp_path = tmp.name
        return FileResponse(tmp_path, filename=f"rephrased_contract_{document_id}.pdf", media_type="application/pdf")
    except Exception as e:
        print("REWRITE CONTRACT ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contract-text/{document_id}")
async def get_contract_text_endpoint(document_id: str):
    try:
        text = get_contract_text(document_id)
        return {"text": text}
    except Exception as e:
        print("GET CONTRACT TEXT ERROR:", e)
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/documents/{document_id}/preview")
async def get_document_preview(document_id: str):
    # TODO: Return preview URL or data
    return {"preview_url": f"/static/{document_id}.png"} 