function addErrMessage(message, messageDiv) {
    const backendMessage = document.querySelector("#backend-message");
    messageDiv.innerHTML = message;
    messageDiv.style.display = "block";
    if (backendMessage !== null) {
        backendMessage.style.display = "none";
    }
}