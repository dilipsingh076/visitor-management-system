"""AI notice message generation using Ollama LLM."""
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import settings

NOTICE_PROMPT = """You are an assistant for a residential housing society management system.
Given the following notice title, write a clear, formal but friendly message body for a society-wide notice.

Guidelines:
- Keep it concise (2-4 sentences)
- Be informative and actionable
- Include a polite request for cooperation if appropriate
- Do not repeat the title verbatim as the first sentence
- Do not add a greeting or sign-off (the system handles that)

Notice title: {title}

Write ONLY the message body text. No extra formatting, no quotes."""


def generate_notice_body(title: str) -> str:
    """Generate a notice message body from a title using Ollama."""
    llm = ChatOllama(
        model=settings.OLLAMA_CHAT_MODEL,
        temperature=0.7,
        base_url=settings.OLLAMA_BASE_URL,
    )

    prompt = ChatPromptTemplate.from_template(NOTICE_PROMPT)
    chain = prompt | llm | StrOutputParser()

    result = chain.invoke({"title": title})
    return result.strip()
