document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("contact-form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        const form = event.target;
        const formData = new FormData(form);
        const responseMessage = document.getElementById("response-message");

        fetch("https://formspree.io/f/xldjddjl", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                responseMessage.textContent = "Message sent successfully!";
                responseMessage.style.color = "green";
                form.reset(); // Clear the form
            } else {
                responseMessage.textContent = "Oops! Something went wrong.";
                responseMessage.style.color = "red";
            }
        }).catch(() => {
            responseMessage.textContent = "Oops! Something went wrong.";
            responseMessage.style.color = "red";
        });
    });
});
