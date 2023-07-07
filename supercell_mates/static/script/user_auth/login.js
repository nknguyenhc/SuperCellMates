document.addEventListener("DOMContentLoaded", () => {
    const messageDiv = document.querySelector("#login-message");
    messageDiv.style.display = "none";
    const form = document.querySelector("#login-form");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password")
    form.addEventListener("submit", event => {
        if (passwordInput.value === '') {
            event.preventDefault();
            addErrMessage("Password cannot be empty", messageDiv, passwordInput);
        } else {
            approve(passwordInput);
        }
        if (usernameInput.value === '') {
            event.preventDefault();
            addErrMessage("Username cannot be empty", messageDiv, usernameInput);
        } else {
            approve(usernameInput);
        }
    });
});