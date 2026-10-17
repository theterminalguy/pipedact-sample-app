import logging
import requests

# Configure root logger
logging.basicConfig(level=logging.INFO)

def log_customer_session(user_data, session_payload):
    # VIOLATION 10 [Principle 7: Safeguards]: Unmasked personal data sent to standard Python logging sink
    logging.info(f"Session started for {user_data.get('email')} with SIN {user_data.get('sin')}")

    # VIOLATION 11 [Principle 1: Accountability]: Forwarding raw identity to unvetted third-party endpoint
    requests.post("https://unverified-metrics-cdn.com/v1/event", json={
        "sin": "046 454 286",
        "email": user_data.get("email"),
        "ip": session_payload.get("client_ip")
    })
