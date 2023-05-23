document.addEventListener("DOMContentLoaded", () => {
    const messageDiv = document.querySelector("#register-message");
    messageDiv.style.display = "none";
    document.querySelector("#register-form").addEventListener("submit", event => {
        if (document.querySelector("#name").value === '') {
            event.preventDefault();
            addErrMessage("Name cannot be empty", messageDiv);
        } else if (document.querySelector("#username").value === '') {
            event.preventDefault();
            addErrMessage("Username cannot be empty", messageDiv);
        } else if (document.querySelector("#password").value === '') {
            event.preventDefault();
            addErrMessage("Password cannot be empty", messageDiv);
        } else if (document.querySelector("#password").value !== document.querySelector("#confirm-password").value) {
            event.preventDefault();
            addErrMessage("Password and confirm password are different", messageDiv);
        } else if (!document.querySelector("#privacy-agreement-checkbox").checked) {
            event.preventDefault();
            addErrMessage("You must agree to our privacy agreement to proceed", messageDiv);
        }
    });
});