"""Meeting query service using RAG (vector search + LLM)."""
from app.services.meeting_ai.embeddings import vector_store
from app.services.meeting_ai.chain import answer_question


def query_meetings(society_id: str, question: str) -> dict:
    """Query across all meetings for a society using semantic search + LLM."""
    docs = vector_store.search(society_id, question, k=5)

    if not docs:
        return {
            "answer": "No meeting data available to answer your question. Please add some meeting transcripts first.",
            "source_meeting_ids": [],
        }

    context = "\n\n---\n\n".join(doc.page_content for doc in docs)
    answer = answer_question(question, context)

    source_ids = list({
        doc.metadata.get("meeting_id", "")
        for doc in docs
        if doc.metadata.get("meeting_id")
    })

    return {
        "answer": answer,
        "source_meeting_ids": source_ids,
    }
