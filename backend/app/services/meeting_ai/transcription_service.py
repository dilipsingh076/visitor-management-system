"""Audio transcription service using faster-whisper (local Whisper STT)."""
import asyncio
import tempfile
from pathlib import Path

from sqlalchemy import update
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import structlog

from app.core.config import settings
from app.models.meeting import Transcript
from app.services.meeting_ai.embeddings import vector_store

logger = structlog.get_logger()

# Local audio storage directory
AUDIO_DIR = Path(settings.AUDIO_STORAGE_PATH)

# Lazy-loaded Whisper model singleton
_whisper_model = None


def _get_whisper_model():
    """Load faster-whisper model on first use (lazy singleton)."""
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        logger.info(
            "Loading Whisper model",
            size=settings.WHISPER_MODEL_SIZE,
            device=settings.WHISPER_DEVICE,
            compute_type=settings.WHISPER_COMPUTE_TYPE,
        )
        _whisper_model = WhisperModel(
            settings.WHISPER_MODEL_SIZE,
            device=settings.WHISPER_DEVICE,
            compute_type=settings.WHISPER_COMPUTE_TYPE,
        )
    return _whisper_model


def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file using faster-whisper. Auto-detects language (Hindi, English, etc.)."""
    model = _get_whisper_model()
    lang = settings.WHISPER_LANGUAGE or None  # None = auto-detect
    segments, info = model.transcribe(
        file_path,
        language=lang,
        beam_size=5,
        vad_filter=True,
    )
    text = " ".join(segment.text.strip() for segment in segments)
    logger.info("Transcription complete", language=info.language, duration=f"{info.duration:.1f}s")
    return text


def correct_transcript(text: str) -> str:
    """Use Ollama LLM to fix grammar, spelling, and incomplete words in the transcript."""
    try:
        from langchain_ollama import ChatOllama
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser

        llm = ChatOllama(
            model=settings.OLLAMA_CHAT_MODEL,
            temperature=0.0,
            base_url=settings.OLLAMA_BASE_URL,
        )

        prompt = ChatPromptTemplate.from_template(
            "You are a transcript corrector. Fix grammar, spelling, incomplete/cut-off words, "
            "and punctuation in the following transcript. Keep the original meaning, language, "
            "and structure exactly the same. Do NOT add, remove, or rephrase any content. "
            "Do NOT add any commentary or explanation. Return ONLY the corrected transcript.\n\n"
            "Transcript:\n{text}"
        )

        chain = prompt | llm | StrOutputParser()
        corrected = chain.invoke({"text": text}).strip()

        if not corrected:
            return text

        logger.info("Transcript corrected via LLM", original_len=len(text), corrected_len=len(corrected))
        return corrected

    except Exception as e:
        logger.warning("LLM correction failed, using raw transcript", error=str(e))
        return text


def save_audio_locally(file_data: bytes, object_key: str) -> str:
    """Save audio bytes to local filesystem. Returns the file path."""
    file_path = AUDIO_DIR / object_key
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(file_data)
    logger.info("Audio saved locally", path=str(file_path), size=len(file_data))
    return str(file_path)


def process_audio_transcript(
    transcript_id: str,
    meeting_id: str,
    society_id: str,
    audio_key: str,
    database_url: str,
):
    """
    Background task: read audio from local storage, transcribe with Whisper,
    update transcript record, index in FAISS.
    Runs synchronously in a thread (called via BackgroundTasks).
    """

    async def _process():
        # Create a fresh async engine + session for background task
        db_url = database_url
        if db_url.startswith("postgres://"):
            db_url = "postgresql+asyncpg://" + db_url[len("postgres://"):]
        elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
            db_url = "postgresql+asyncpg://" + db_url[len("postgresql://"):]

        engine = create_async_engine(db_url)
        SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        try:
            # Read audio from local storage
            audio_path = AUDIO_DIR / audio_key
            if not audio_path.exists():
                raise FileNotFoundError(f"Audio file not found: {audio_path}")

            # Transcribe
            logger.info("Starting transcription", transcript_id=transcript_id, audio_path=str(audio_path))
            text = transcribe_audio(str(audio_path))

            if not text.strip():
                text = "[No speech detected in audio]"
            else:
                # Post-process: LLM correction for grammar, spelling, etc.
                logger.info("Running LLM correction", transcript_id=transcript_id)
                text = correct_transcript(text)

            # Update transcript in database
            async with SessionLocal() as session:
                await session.execute(
                    update(Transcript)
                    .where(Transcript.id == transcript_id)
                    .values(content=text, transcription_status="completed")
                )
                await session.commit()

            # Index in FAISS for RAG
            try:
                vector_store.add_transcript(society_id, meeting_id, text)
            except Exception as e:
                logger.warning("FAISS indexing failed after transcription", error=str(e))

            logger.info("Transcription completed", transcript_id=transcript_id)

        except Exception as e:
            logger.error("Transcription failed", transcript_id=transcript_id, error=str(e))
            # Mark as failed
            try:
                async with SessionLocal() as session:
                    await session.execute(
                        update(Transcript)
                        .where(Transcript.id == transcript_id)
                        .values(
                            content=f"[Transcription failed: {str(e)}]",
                            transcription_status="failed",
                        )
                    )
                    await session.commit()
            except Exception:
                pass
        finally:
            await engine.dispose()

    # Run the async function
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(_process())
    finally:
        loop.close()
