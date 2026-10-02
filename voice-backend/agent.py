import logging
import os

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    cli,
    inference,
)

load_dotenv(".env.local")

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("civicascent-voice")

AGENT_NAME = os.getenv("CIVICASCENT_AGENT_NAME", "civicascent-voice")

SYSTEM_INSTRUCTIONS = """
You are the CivicAscent AI phone assistant.

Purpose:
- Help callers understand CivicAscent AI programs, beginner AI training, scheduling,
  and general business information.
- Speak clearly, calmly, and in short sentences suitable for first-time AI users.
- Start in English. If the caller speaks Spanish or asks for Spanish, continue in Spanish.
- Never invent business facts, prices, dates, partnerships, legal status, or availability.
- When information is uncertain or unavailable, say so and offer a human follow-up.
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

    async def on_enter(self) -> None:
        self.session.generate_reply(
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
