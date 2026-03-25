from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import settings
from prompts.templates import QA_PROMPT


def get_llm(model: str | None = None, temperature: float = 0.0):
    return ChatOllama(
        model=model or settings.ollama_chat_model,
        temperature=temperature,
        base_url=settings.ollama_base_url,
    )


def answer_question(question: str, context: str) -> str:
    llm = get_llm()
    prompt = ChatPromptTemplate.from_template(QA_PROMPT)
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"question": question, "context": context})
