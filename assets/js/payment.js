document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("payment-form");
    const amountInput = document.getElementById("payment-amount");
    const statusMessage = document.getElementById("payment-status");
    const payButton = document.getElementById("pay-button");

    if (!form || !amountInput || !statusMessage || !payButton) {
        return;
    }

    function showStatus(message, isError) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? "payment-status error" : "payment-status success";
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const amountInRupees = Number(amountInput.value);
        const amount = Math.round(amountInRupees * 100);

        if (!Number.isFinite(amountInRupees) || amount < 100) {
            showStatus("Please enter an amount of at least Rs. 1.", true);
            return;
        }

        payButton.disabled = true;
        showStatus("Preparing secure payment...", false);

        try {
            const [configResponse, orderResponse] = await Promise.all([
                fetch("/api/config"),
                fetch("/api/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: amount })
                })
            ]);
            const config = await configResponse.json();
            const order = await orderResponse.json();

            if (!configResponse.ok || !orderResponse.ok) {
                throw new Error(order.error || "Unable to start payment");
            }

            const checkout = new Razorpay({
                key: config.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "Different Strokes",
                description: "Artwork payment",
                order_id: order.order_id,
                handler: async function (response) {
                    const verificationResponse = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(response)
                    });
                    const verification = await verificationResponse.json();
                    if (!verificationResponse.ok || !verification.success) {
                        throw new Error(verification.error || "Payment verification failed");
                    }
                    showStatus("Payment received and verified. Thank you.", false);
                },
                modal: {
                    ondismiss: function () {
                        showStatus("Payment cancelled.", true);
                    }
                },
                theme: { color: "#222222" }
            });

            checkout.on("payment.failed", function (response) {
                showStatus(response.error.description || "Payment failed. Please try again.", true);
            });
            checkout.open();
        } catch (error) {
            showStatus(error.message || "Unable to start payment. Please try again.", true);
        } finally {
            payButton.disabled = false;
        }
    });
});
