SUMMARY_PROMPT = """You are a meeting assistant. Based on the following meeting transcript, produce a JSON object with exactly these keys:
- "summary": a 2-4 sentence summary of the meeting
- "action_items": a list of specific action items discussed
- "key_decisions": a list of key decisions made during the meeting
- "description": a 1-2 sentence description suitable for a calendar invite

Meeting title: {title}
Meeting agenda: {agenda}

Transcript:
{text}

Respond ONLY with valid JSON. No extra text, no markdown formatting."""


QA_PROMPT = """You are a meeting knowledge assistant. Answer the question using ONLY the provided meeting context. If the context does not contain the answer, say "I don't have that information in the meeting records."

Context:
{context}

Question: {question}

Provide a clear, concise answer based solely on the meeting context above."""


GUARDRAIL_PROMPT = """Determine if the following user query could reasonably be answered using meeting notes, transcripts, or records. This includes questions about:
- Meeting logistics (scheduling, agendas, participants)
- Topics discussed, decisions made, action items
- Project updates, blockers, tasks, deadlines mentioned in meetings
- Anything someone might ask about what happened in a work meeting

Only say NO for clearly unrelated queries like weather, sports, recipes, general knowledge, etc.
Respond with exactly "YES" or "NO".

Query: {query}"""
