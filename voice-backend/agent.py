import logging
import os
from typing import Any

import httpx
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    RunContext,
    cli,
    function_tool,
    inference,
)

load_dotenv(".env.local")

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("civicascent-voice")

AGENT_NAME = os.getenv("CIVICASCENT_AGENT_NAME", "civicascent-voice")
CANONICAL_URL = os.getenv(
    "CIVICASCENT_CANONICAL_URL",
    "https://alsjvdqlpayuzykhhbil.supabase.co/functions/v1/canonical-query",
)
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

SYSTEM_INSTRUCTIONS = """
You are the CivicAscent AI phone assistant.

Purpose:
- Help callers understand CivicAscent AI programs, beginner AI training, scheduling,
  and general business information.
- Speak clearly, calmly, and in short sentences suitable for first-time AI users.
- Start in English. If the caller speaks Spanish or asks for Spanish, continue in Spanish.
- Before answering factual questions about CivicAscent AI identity, programs, pricing,
  legal status, partnerships, availability, policies, security, or government status,
  use the lookup_civicascent_knowledge tool.
- Treat the canonical lookup result as the approved source of truth.
- If the tool returns verify_live, do not present the stored rule as a current fact.
  Explain that the item requires current verification and offer a human follow-up.
- If the tool returns fallback or unavailable, do not invent an answer.
- Never invent business facts, prices, dates, partnerships, legal status, or availability.
- Do not ask for passwords, full payment-card numbers, Social Security numbers, or other
  unnecessary sensitive information.
- Do not claim that an appointment, payment, registration, or external action succeeded
  unless the connected tool confirms it.
- Respect interruptions and let the caller finish speaking.
- If the caller asks for a human, acknowledge the request and follow the configured
  human-handoff procedure when one is available.
"""


class CivicAscentPhoneAgent(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_INSTRUCTIONS)

    @function_tool()
    async def lookup_civicascent_knowledge(
        self,
        context: RunContext,
        question: str,
    ) -> dict[str, Any]:
        """Look up the approved CivicAscent canonical answer before answering factual questions.

        Args:
            question: The caller's CivicAscent-related question in plain language.
        """
        if not SUPABASE_ANON_KEY:
            logger.error("SUPABASE_ANON_KEY is not configured")
            return {
                "status": "unavailable",
                "message": "Canonical knowledge lookup is not configured in this deployment.",
            }

        headers = {
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(
                    CANONICAL_URL,
                    headers=headers,
                    json={"question": question, "match_count": 3},
                )
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            logger.exception("Canonical lookup failed")
            return {
                "status": "unavailable",
                "message": "The approved knowledge service is temporarily unavailable.",
                "detail": str(exc),
            }

        best = payload.get("best")
        if not best:
            fallback = payload.get("fallback") or {}
            return {
                "status": "fallback",
                "canonical_id": fallback.get("id", "CA-FALLBACK-001"),
                "answer": fallback.get(
                    "answer",
                    "I do not have a verified canonical answer for that yet.",
                ),
            }

        if best.get("requires_live_verification"):
            return {
                "status": "verify_live",
                "canonical_id": best.get("id"),
                "answer": best.get("answer"),
                "message": "This topic requires current verification before stating a live fact or status.",
                "similarity": best.get("similarity"),
            }

        return {
            "status": "approved",
            "canonical_id": best.get("id"),
            "answer": best.get("answer"),
            "similarity": best.get("similarity"),
        }

    async def on_enter(self) -> None:
        await self.session.generate_reply(
            instructions=(
                "Greet the caller as the CivicAscent AI assistant. "
                "Say you can help with programs, beginner AI training, and general questions. "
                "Keep the greeting brief and ask how you can help."
            )
        )


server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def civic_voice(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
        "agent_name": AGENT_NAME,
    }

    # Model choices are environment-controlled so staging can be benchmarked
    # without changing application code. Do not enable paid providers without approval.
    stt_model = os.getenv("CIVICASCENT_STT_MODEL", "deepgram/nova-3-general")
    llm_model = os.getenv("CIVICASCENT_LLM_MODEL", "google/gemma-4-31b-it")
    tts_model = os.getenv("CIVICASCENT_TTS_MODEL", "fishaudio/s2.1-pro")
    tts_voice = os.getenv("CIVICASCENT_TTS_VOICE", "fa4c9eb3dccc4806b382b40d61c6b10a")

    logger.info("Starting voice session for room=%s agent=%s", ctx.room.name, AGENT_NAME)

    session = AgentSession(
        stt=inference.STT(model=stt_model),
        llm=inference.LLM(model=llm_model),
        tts=inference.TTS(model=tts_model, voice=tts_voice),
        preemptive_generation=True,
    )

    await session.start(
        agent=CivicAscentPhoneAgent(),
        room=ctx.room,
    )
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
