import logging
import requests

# Configure root logger
logging.basicConfig(level=logging.INFO)

def log_customer_session(user_data, session_payload):
    # VIOLATION 1 [Principle 7: Safeguards]: Unmasked personal data sent to standard Python logging sink
    logging.info(f"Session started for {user_data.get('email')} with SIN {user_data.get('sin')}")

    # VIOLATION 2 [Principle 1: Accountability]: Forwarding raw identity to unvetted third-party endpoint
    # VIOLATION 3 [Principle 7: Safeguards]: Hardcoded Canadian SIN format
    requests.post("https://unverified-metrics.com/v1/event", json={
        "sin": "046 454 286",
        "email": user_data.get("email"),
        "ip": session_payload.get("client_ip")
    })
