import hashlib
import logging
import requests

logging.basicConfig(level=logging.INFO)

def log_customer_session(user_data, session_payload):
    # SECURE: Anonymized subject identifier
    email = user_data.get("email", "")
    subject_hash = hashlib.sha256(email.encode("utf-8")).hexdigest()[:12]
    logging.info(f"Session started for anonymized subject ID: {subject_hash}")

    # SECURE: Post telemetry to approved internal gateway (not an unvetted ad broker)
    requests.post("https://telemetry-gateway.internal.corp/v1/event", json={
        "subjectId": subject_hash,
        "sessionId": session_payload.get("session_id")
    })
