function openModal(imageSrc, title, description) {
    const modal = document.getElementById("modal");
    document.getElementById("modal").style.display = "flex";
    document.getElementById("modal-img").src = imageSrc;
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-description").textContent = description;

    modal.style.visibility = "visible";
    modal.style.opacity = "1";
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

// Hide modal completely on page load
window.onload = function () {
    const modal = document.getElementById("modal");
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
};
