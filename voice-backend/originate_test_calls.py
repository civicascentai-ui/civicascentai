import asyncio
import logging
import os
import uuid

from dotenv import load_dotenv
from livekit import api

load_dotenv(".env.local")

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("civicascent-call-originator")

AGENT_NAME = os.getenv("CIVICASCENT_AGENT_NAME", "civicascent-voice")
OUTBOUND_TRUNK_ID = os.getenv("LIVEKIT_SIP_OUTBOUND_TRUNK_ID", "").strip()
TEST_CALL_TO = os.getenv("CIVICASCENT_TEST_CALL_TO", "").strip()
TEST_CALL_COUNT = int(os.getenv("CIVICASCENT_TEST_CALL_COUNT", "5"))

MAX_TEST_CALLS = 5
INTER_CALL_DELAY_SECONDS = float(
    os.getenv("CIVICASCENT_TEST_CALL_DELAY_SECONDS", "8")
)


def validate_configuration() -> None:
    if not OUTBOUND_TRUNK_ID:
        raise RuntimeError("LIVEKIT_SIP_OUTBOUND_TRUNK_ID is not configured")
    if not TEST_CALL_TO.startswith("+"):
        raise RuntimeError("CIVICASCENT_TEST_CALL_TO must be configured in E.164 format")
    if TEST_CALL_COUNT < 1 or TEST_CALL_COUNT > MAX_TEST_CALLS:
        raise RuntimeError(
            f"CIVICASCENT_TEST_CALL_COUNT must be between 1 and {MAX_TEST_CALLS}"
        )


async def originate_one_call(lkapi: api.LiveKitAPI, sequence: int) -> None:
    test_id = uuid.uuid4().hex[:8]
    room_name = f"civicascent-staging-calltest-{sequence}-{test_id}"

    await lkapi.agent_dispatch.create_dispatch(
        api.CreateAgentDispatchRequest(
            agent_name=AGENT_NAME,
            room=room_name,
            metadata=f"staging-five-call-test:{sequence}:{test_id}",
        )
    )

    logger.info(
        "Originating staging test call %s/%s room=%s",
        sequence,
        TEST_CALL_COUNT,
        room_name,
    )

    participant = await lkapi.sip.create_sip_participant(
        api.CreateSIPParticipantRequest(
            sip_trunk_id=OUTBOUND_TRUNK_ID,
            sip_call_to=TEST_CALL_TO,
            room_name=room_name,
            participant_identity=f"civicascent-test-callee-{sequence}",
            participant_name=f"CivicAscent Test Call {sequence}",
            wait_until_answered=True,
        )
    )

    logger.info(
        "Test call %s connected participant=%s",
        sequence,
        getattr(participant, "participant_identity", "unknown"),
    )


async def main() -> None:
    validate_configuration()
    lkapi = api.LiveKitAPI()
    try:
        for sequence in range(1, TEST_CALL_COUNT + 1):
            await originate_one_call(lkapi, sequence)
            if sequence < TEST_CALL_COUNT:
                await asyncio.sleep(INTER_CALL_DELAY_SECONDS)
    finally:
        await lkapi.aclose()


if __name__ == "__main__":
    asyncio.run(main())
