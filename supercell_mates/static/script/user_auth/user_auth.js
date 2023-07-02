function addErrMessage(message, messageDiv, inputField) {
    const backendMessage = document.querySelector("#backend-message");
    messageDiv.innerHTML = message;
    messageDiv.style.display = "block";
    if (backendMessage !== null) {
        backendMessage.style.display = "none";
    }
    inputField.classList.add('is-invalid');
    inputField.classList.remove('is-valid');
}

function approve(inputField) {
    inputField.classList.remove('is-invalid');
    inputField.classList.add('is-valid');
}