from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    ollama_chat_model: str = "llama3.2"
    ollama_embed_model: str = "nomic-embed-text"
    database_url: str = "sqlite:///data/meetings.db"
    faiss_index_path: str = "data/faiss_index"

    model_config = {"env_file": ".env"}


settings = Settings()
