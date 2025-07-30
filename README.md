# 🤖 Agentic Document Analysis

A sophisticated multi-agent AI system for legal contract analysis and document processing. This application combines OCR technology, AI agents, and a modern web interface to provide comprehensive document analysis capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.100+-green.svg)

## ✨ Features

### 🔍 **Multi-Agent Analysis System**
- **Ambiguity Detector**: Identifies unclear language and suggests improvements
- **Framework Analyzer**: Maps governing law provisions and identifies conflicts
- **Summarizer**: Extracts key details and provides comprehensive summaries
- **Deadline & Obligation Tracker**: Extracts critical dates and obligations
- **Risk Assessment Agent**: Analyzes potential risks and compliance issues

### 📄 **Document Processing**
- **OCR Support**: Extract text from PDFs and images using pytesseract
- **Multiple Formats**: Support for PDF, PNG, JPG, JPEG, GIF, BMP, WebP
- **Large File Support**: Handle documents up to 10MB
- **Text Storage**: Persistent storage using ChromaDB for efficient retrieval

### 💬 **Interactive Chat Interface**
- **Real-time Analysis**: Ask questions about uploaded documents
- **Agent-specific Actions**: Trigger specialized analysis with dedicated buttons
- **Chat History**: Maintain conversation context across sessions
- **Modern UI**: Clean, responsive interface with light theme

### 📊 **Export & Download Features**
- **PDF Export**: Download complete chat analysis as PDF
- **Contract Rewriting**: Rephrase contracts with ambiguities resolved
- **Structured Output**: Formatted results for easy reading

### 🛡️ **Security & Performance**
- **Environment Variables**: Secure API key management
- **CORS Support**: Cross-origin resource sharing for frontend-backend communication
- **Error Handling**: Comprehensive error management and user feedback
- **Loading States**: Visual feedback during processing

## 🏗️ Tech Stack

### **Backend (Python)**
- **FastAPI**: Modern, fast web framework for building APIs
- **CrewAI**: Multi-agent orchestration framework
- **OpenAI GPT-3.5-turbo**: Language model for AI agents
- **ChromaDB**: Vector database for document storage and retrieval
- **pytesseract**: OCR engine for text extraction
- **pdf2image**: PDF to image conversion
- **fpdf**: PDF generation for exports
- **uvicorn**: ASGI server for FastAPI

### **Frontend (React/TypeScript)**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Axios**: HTTP client for API communication
- **React Dropzone**: File upload functionality
- **Lucide React**: Beautiful icon library

### **Development Tools**
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Tesseract OCR (for text extraction)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agentic-document-analysis.git
   cd agentic-document-analysis
   ```

2. **Backend Setup**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

3. **Frontend Setup**
   ```bash
   cd contract-chat-ai-assist
   npm install
   ```

4. **Environment Configuration**
   
   **Option A: Use the setup script (recommended)**
   ```bash
   python setup_env.py
   ```
   
   **Option B: Create manually**
   Create a `.env` file in the project root:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o
   OPENAI_API_BASE=https://api.openai.com/v1
   ```
   
   ⚠️ **Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key. The `.env` file is already in `.gitignore` to prevent accidental commits.

### Running the Application

1. **Start the Backend Server**
   ```bash
   # From project root
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend Development Server**
   ```bash
   # From contract-chat-ai-assist directory
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📖 How It Works

### 1. **Document Upload & Processing**
```
User Upload → OCR Processing → Text Extraction → ChromaDB Storage
```

- Users upload PDF or image files through the web interface
- Backend processes files using pytesseract for OCR
- Extracted text is stored in ChromaDB for efficient retrieval
- Document metadata is tracked for analysis

### 2. **Multi-Agent Analysis**
```
User Query → Agent Selection → CrewAI Orchestration → AI Analysis → Response
```

- Users can trigger specific agents or ask general questions
- CrewAI orchestrates the selected agents with specialized prompts
- Each agent has specific expertise and constraints
- Results are formatted and returned to the user

### 3. **Agent Capabilities**

#### **Ambiguity Detector**
- Identifies vague or unclear language in contracts
- Suggests specific improvements and clarifications
- Provides follow-up questions for contract rewriting

#### **Framework Analyzer**
- Maps legal frameworks and governing laws
- Identifies potential conflicts between jurisdictions
- Analyzes compliance requirements

#### **Summarizer**
- Extracts key terms and conditions
- Provides executive summaries
- Highlights important clauses and deadlines

#### **Deadline & Obligation Tracker**
- Identifies critical dates and deadlines
- Tracks obligations for all parties
- Provides timeline analysis

#### **Risk Assessment Agent**
- Analyzes potential legal and compliance risks
- Identifies problematic clauses
- Provides risk mitigation suggestions

### 4. **Export & Download**
- Users can download complete chat analysis as PDF
- Contract rewriting feature creates improved versions
- All exports are properly formatted and structured

## 🔧 API Endpoints

### **Document Management**
- `POST /upload` - Upload and process documents
- `GET /contract-text/{document_id}` - Retrieve original text

### **Analysis**
- `POST /chat` - General chat with AI assistant
- `POST /analyze/{document_id}` - Run specific agent analysis

### **Export**
- `POST /export-pdf/{document_id}` - Generate PDF of chat analysis
- `POST /rewrite-contract/{document_id}` - Create improved contract version

## 🎯 Usage Examples

### **Basic Document Analysis**
1. Upload a legal contract (PDF or image)
2. Use the "Summarizer" agent to get an overview
3. Ask specific questions about the document
4. Download the analysis as PDF

### **Advanced Analysis**
1. Upload multiple related documents
2. Use "Framework Analyzer" to identify legal conflicts
3. Run "Risk Assessment" for compliance analysis
4. Use "Ambiguity Detector" to improve contract language
5. Export rewritten contract with improvements

### **Interactive Chat**
- Ask general legal questions
- Get explanations of legal terms
- Request analysis of specific clauses
- Compare different contract provisions

## 🛠️ Development

### **Project Structure**
```
legal-agentic2/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── ocr_module.py        # OCR processing
│   ├── crew_agents.py       # AI agent definitions
│   ├── qa_module.py         # Agent orchestration
│   └── text_store.py        # ChromaDB integration
├── contract-chat-ai-assist/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── store/          # State management
│   │   └── hooks/          # Custom hooks
│   └── package.json
├── requirements.txt         # Python dependencies
└── README.md
```

### **Adding New Agents**
1. Define agent in `backend/crew_agents.py`
2. Add task configuration
3. Update `AGENT_MAP` in `backend/qa_module.py`
4. Add frontend button in `AgentActions.tsx`

### **Customizing Analysis**
- Modify agent prompts in `crew_agents.py`
- Adjust analysis parameters in `qa_module.py`
- Update UI components for new features

## 🔒 Security Considerations

- **API Keys**: Never commit `.env` files to version control
- **File Uploads**: Implement proper file validation and size limits
- **CORS**: Configure appropriate CORS settings for production
- **Rate Limiting**: Consider implementing rate limiting for API endpoints

## 🚀 Deployment

### **Production Setup**
1. Set up production environment variables
2. Configure CORS for your domain
3. Set up proper logging and monitoring
4. Use production-grade ASGI server (Gunicorn)
5. Configure reverse proxy (Nginx)

### **Docker Deployment**
```dockerfile
# Example Dockerfile for backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CrewAI** for multi-agent orchestration
- **OpenAI** for language model capabilities
- **ChromaDB** for vector storage
- **FastAPI** for the excellent web framework
- **React** and **Tailwind CSS** for the modern UI

## 📞 Support

For support, email support@yourdomain.com or create an issue in the GitHub repository.

---

**Made with ❤️ for legal professionals and document analysts**
