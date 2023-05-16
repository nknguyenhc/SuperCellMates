document.addEventListener("DOMContentLoaded", () => {
    const messageDiv = document.querySelector("#login-message");
    messageDiv.style.display = "none";
    document.querySelector("#login-form").addEventListener("submit", event => {
        if (document.querySelector("#username").value === '') {
            event.preventDefault();
            addErrMessage("Username cannot be empty", messageDiv);
        } else if (document.querySelector("#password").value === '') {
            event.preventDefault();
            addErrMessage("Password cannot be empty", messageDiv);
        }
    });
});