"""Query guardrailing: ensure queries are meeting-related before hitting the LLM."""
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import settings
from app.services.meeting_ai.templates import GUARDRAIL_PROMPT

MEETING_KEYWORDS = {
    "meeting", "agenda", "transcript", "minutes", "action item",
    "attendee", "schedule", "summary", "decision", "follow-up",
    "discussion", "notes", "recap", "standup", "retrospective",
    "conference", "call", "sync", "participant", "action items",
    "key decisions", "meeting notes", "meeting summary",
    "blocked", "blocker", "update", "deadline", "assign",
    "task", "project", "team", "sprint", "release", "deploy",
    "status", "progress", "discuss", "decided", "agreed",
    "who", "what", "when", "deliverable",
}


def _keyword_check(query: str) -> bool:
    lower = query.lower()
    return any(kw in lower for kw in MEETING_KEYWORDS)


def _llm_check(query: str) -> bool:
    try:
        llm = ChatOllama(
            model=settings.OLLAMA_CHAT_MODEL,
            temperature=0.0,
            base_url=settings.OLLAMA_BASE_URL,
        )
        prompt = ChatPromptTemplate.from_template(GUARDRAIL_PROMPT)
        chain = prompt | llm | StrOutputParser()
        result = chain.invoke({"query": query}).strip().upper()
        return result.startswith("YES")
    except Exception:
        return False


def is_meeting_related(query: str) -> bool:
    """Check if a query is meeting-related using keyword check first, then LLM fallback."""
    if _keyword_check(query):
        return True
    return _llm_check(query)
