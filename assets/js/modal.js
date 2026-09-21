let modalImageRequest = 0;

function openModal(imageSrc, title, description) {
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-img");
    const requestId = ++modalImageRequest;

    modal.style.display = "flex";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    modalImage.style.visibility = "hidden";
    modalImage.removeAttribute("src");
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-description").textContent = description;

    const nextImage = new Image();
    nextImage.onload = function () {
        if (requestId !== modalImageRequest) {
            return;
        }

        modalImage.src = imageSrc;
        modalImage.style.visibility = "visible";
    };
    nextImage.onerror = function () {
        if (requestId !== modalImageRequest) {
            return;
        }

        modalImage.src = imageSrc.replace(/^images\//, "images/optimized/");
        modalImage.style.visibility = "visible";
    };
    nextImage.src = imageSrc;
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.opacity = "0";
    setTimeout(() => {
        modal.style.visibility = "hidden";
    }, 300);
}

// Close modal when clicking outside the content
document.getElementById("modal").addEventListener("click", function (event) {
    if (event.target === this) {
        closeModal();
    }
});

// Hide modal without racing clicks made before the page finishes loading.
function initializeModal() {
    const modal = document.getElementById("modal");
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
}

initializeModal();
