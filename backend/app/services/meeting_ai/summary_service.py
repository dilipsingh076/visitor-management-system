"""AI summary generation for meetings using Ollama LLM."""
import json

from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import settings
from app.services.meeting_ai.templates import SUMMARY_PROMPT


def generate_summary(text: str, title: str, agenda: str, meeting_id: str) -> dict:
    """Generate structured summary from meeting transcript text."""
    llm = ChatOllama(
        model=settings.OLLAMA_CHAT_MODEL,
        temperature=0.0,
        base_url=settings.OLLAMA_BASE_URL,
    )

    prompt = ChatPromptTemplate.from_template(SUMMARY_PROMPT)
    chain = prompt | llm | StrOutputParser()

    raw_output = chain.invoke({
        "text": text,
        "title": title,
        "agenda": agenda,
    })

    # Parse the JSON response, stripping markdown code blocks if present
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
        cleaned = cleaned.rsplit("```", 1)[0]

    result = json.loads(cleaned)

    return {
        "summary": result.get("summary", ""),
        "action_items": result.get("action_items", []),
        "key_decisions": result.get("key_decisions", []),
        "description": result.get("description", ""),
    }
