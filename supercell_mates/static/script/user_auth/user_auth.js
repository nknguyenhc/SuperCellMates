function addErrMessage(message, messageDiv, inputField, newFeedback) {
    const backendMessage = document.querySelector("#backend-message");
    messageDiv.innerText = message;
    messageDiv.style.display = "block";
    if (backendMessage !== null) {
        backendMessage.style.display = "none";
    }
    inputField.classList.add('is-invalid');
    inputField.classList.remove('is-valid');
    if (newFeedback) {
        inputField.parentElement.querySelector(".invalid-feedback").innerText = newFeedback;
    }
}

function approve(inputField) {
    inputField.classList.remove('is-invalid');
    inputField.classList.add('is-valid');
}