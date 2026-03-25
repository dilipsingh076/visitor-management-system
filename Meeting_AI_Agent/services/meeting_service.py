from rag.embeddings import vector_store
from rag.chain import answer_question


def query_meetings(question: str) -> dict:
    docs = vector_store.search(question, k=5)

    if not docs:
        return {
            "answer": "No meeting data available to answer your question. Please add some meeting transcripts first.",
            "source_meeting_ids": [],
        }

    context = "\n\n---\n\n".join(doc.page_content for doc in docs)
    answer = answer_question(question, context)

    source_ids = list({doc.metadata.get("meeting_id", "") for doc in docs if doc.metadata.get("meeting_id")})

    return {
        "answer": answer,
        "source_meeting_ids": source_ids,
    }
