import hashlib
import hmac
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import razorpay
from razorpay.errors import BadRequestError, ServerError


ROOT = Path(__file__).resolve().parent


def load_env():
    env_path = ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"\''))


load_env()
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")
if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class RequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve only the built site. Serving ROOT would expose the whole
        # repository over HTTP, including .git and the source.
        super().__init__(*args, directory=str(ROOT / "dist" / "client"), **kwargs)

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            return json.loads(self.rfile.read(length))
        except (ValueError, json.JSONDecodeError):
            return None

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/create-order":
            self.create_order()
        elif path == "/api/verify-payment":
            self.verify_payment()
        else:
            self.send_json(404, {"error": "Not found"})

    def do_GET(self):
        if urlparse(self.path).path == "/api/config":
            self.send_json(200, {"key_id": RAZORPAY_KEY_ID})
            return
        super().do_GET()

    def create_order(self):
        data = self.read_json()
        amount = data.get("amount") if isinstance(data, dict) else None
        if isinstance(amount, bool) or not isinstance(amount, int) or amount < 100:
            self.send_json(400, {"error": "Amount must be an integer of at least 100 paise"})
            return

        try:
            order = client.order.create({
                "amount": amount,
                "currency": "INR",
                "receipt": "different-strokes-" + os.urandom(6).hex(),
            })
        except (BadRequestError, ServerError) as error:
            if "auth" in str(error).lower() or "credential" in str(error).lower():
                self.send_json(401, {"error": "Razorpay authentication failed"})
                return
            self.send_json(500, {"error": "Razorpay rejected the order request"})
            return
        except Exception:
            self.send_json(500, {"error": "Unable to create Razorpay order"})
            return

        self.send_json(200, {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
        })

    def verify_payment(self):
        data = self.read_json()
        required = ("razorpay_order_id", "razorpay_payment_id", "razorpay_signature")
        if not isinstance(data, dict) or any(not data.get(field) for field in required):
            self.send_json(400, {"error": "Missing payment verification fields"})
            return

        message = data["razorpay_order_id"] + "|" + data["razorpay_payment_id"]
        expected = hmac.new(
            RAZORPAY_KEY_SECRET.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, data["razorpay_signature"]):
            self.send_json(400, {"error": "Payment signature verification failed"})
            return

        self.send_json(200, {"success": True, "message": "Payment verified successfully"})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", int(os.environ.get("PORT", "8000"))), RequestHandler)
    print("Different Strokes running at http://127.0.0.1:%s" % server.server_address[1])
    server.serve_forever()
