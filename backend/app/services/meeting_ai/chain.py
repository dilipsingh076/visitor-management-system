"""LangChain QA chain for meeting queries using Ollama."""
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import settings
from app.services.meeting_ai.templates import QA_PROMPT


def get_llm(model: str | None = None, temperature: float = 0.0):
    return ChatOllama(
        model=model or settings.OLLAMA_CHAT_MODEL,
        temperature=temperature,
        base_url=settings.OLLAMA_BASE_URL,
    )


def answer_question(question: str, context: str) -> str:
    llm = get_llm()
    prompt = ChatPromptTemplate.from_template(QA_PROMPT)
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"question": question, "context": context})
