document.addEventListener("DOMContentLoaded", () => {
    let messageDiv = document.querySelector("#register-message");
    document.querySelector("#register-form").addEventListener("submit", event => {
        if (document.querySelector("#name").value === '') {
            event.preventDefault();
            messageDiv.innerHTML = "Name cannot be empty";
        } else if (document.querySelector("#username").value === '') {
            event.preventDefault();
            messageDiv.innerHTML = "Username cannot be empty";
        } else if (document.querySelector("#password").value === '') {
            event.preventDefault();
            messageDiv.innerHTML = "Password cannot be empty";
        } else if (document.querySelector("#password").value !== document.querySelector("#confirm-password").value) {
            event.preventDefault();
            messageDiv.innerHTML = "Password and confirm password are different";
        }
    });
});