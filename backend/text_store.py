import chromadb
from chromadb.utils import embedding_functions
import chromadb.config

chroma_client = chromadb.Client(
    chromadb.config.Settings(
        persist_directory="chromadb_data"
    )
)
collection = chroma_client.create_collection("contracts")

# Add contract text to ChromaDB

def add_contract_text(document_id: str, text: str):
    collection.add(
        documents=[text],
        ids=[document_id],
        metadatas=[{"document_id": document_id}]
    )
    # chroma_client.persist()  # Removed, not supported

# Retrieve contract text by document_id

def get_contract_text(document_id: str) -> str:
    results = collection.get(ids=[document_id])
    if results and results["documents"]:
        return results["documents"][0]
    raise ValueError(f"No contract found for document_id: {document_id}") 