from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from config import settings


class MeetingVectorStore:
    def __init__(self, index_path: str):
        self.index_path = index_path
        self.embeddings = None
        self.store: FAISS | None = None
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
        )

    def _get_embeddings(self):
        if self.embeddings is None:
            self.embeddings = OllamaEmbeddings(
                model=settings.ollama_embed_model,
                base_url=settings.ollama_base_url,
            )
        return self.embeddings

    def load(self):
        if Path(self.index_path).exists():
            self.store = FAISS.load_local(
                self.index_path,
                self._get_embeddings(),
                allow_dangerous_deserialization=True,
            )

    def add_transcript(self, meeting_id: str, text: str):
        docs = self.splitter.create_documents(
            [text],
            metadatas=[{"meeting_id": meeting_id}],
        )
        if self.store is None:
            self.store = FAISS.from_documents(docs, self._get_embeddings())
        else:
            self.store.add_documents(docs)
        self.store.save_local(self.index_path)

    def search(self, query: str, k: int = 5, meeting_id: str | None = None) -> list[Document]:
        if self.store is None:
            return []
        results = self.store.similarity_search(query, k=k * 2 if meeting_id else k)
        if meeting_id:
            results = [d for d in results if d.metadata.get("meeting_id") == meeting_id][:k]
        return results

    def as_retriever(self, **kwargs):
        if self.store is None:
            return None
        return self.store.as_retriever(**kwargs)


vector_store = MeetingVectorStore(settings.faiss_index_path)
