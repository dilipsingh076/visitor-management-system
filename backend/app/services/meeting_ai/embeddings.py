"""FAISS vector store wrapper for meeting transcript embeddings."""
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.core.config import settings


class MeetingVectorStore:
    """Per-society FAISS vector store for semantic search over meeting transcripts."""

    def __init__(self, base_index_path: str):
        self.base_index_path = base_index_path
        self.embeddings = None
        self.stores: dict[str, FAISS] = {}  # society_id -> FAISS store
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
        )

    def _get_embeddings(self):
        if self.embeddings is None:
            self.embeddings = OllamaEmbeddings(
                model=settings.OLLAMA_EMBED_MODEL,
                base_url=settings.OLLAMA_BASE_URL,
            )
        return self.embeddings

    def _index_path(self, society_id: str) -> str:
        return str(Path(self.base_index_path) / society_id)

    def load(self, society_id: str):
        """Load FAISS index for a society if it exists on disk."""
        path = self._index_path(society_id)
        if Path(path).exists() and society_id not in self.stores:
            self.stores[society_id] = FAISS.load_local(
                path,
                self._get_embeddings(),
                allow_dangerous_deserialization=True,
            )

    def add_transcript(self, society_id: str, meeting_id: str, text: str):
        """Chunk and index a transcript for a given society."""
        docs = self.splitter.create_documents(
            [text],
            metadatas=[{"meeting_id": str(meeting_id), "society_id": str(society_id)}],
        )
        store = self.stores.get(society_id)
        if store is None:
            store = FAISS.from_documents(docs, self._get_embeddings())
            self.stores[society_id] = store
        else:
            store.add_documents(docs)
        path = self._index_path(society_id)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        store.save_local(path)

    def search(self, society_id: str, query: str, k: int = 5, meeting_id: str | None = None) -> list[Document]:
        """Semantic search across a society's meeting transcripts."""
        self.load(society_id)
        store = self.stores.get(society_id)
        if store is None:
            return []
        results = store.similarity_search(query, k=k * 2 if meeting_id else k)
        if meeting_id:
            results = [d for d in results if d.metadata.get("meeting_id") == str(meeting_id)][:k]
        return results


vector_store = MeetingVectorStore(settings.FAISS_INDEX_PATH)
