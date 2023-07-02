document.addEventListener("DOMContentLoaded", () => {
    const messageDiv = document.querySelector("#register-message");
    messageDiv.style.display = "none";
    let usernameUnique = true;

    const form = document.querySelector("#register-form");
    const nameInput = document.querySelector("#name");
    const usernameInput = document.querySelector("#username");
    const usernameFeedback = usernameInput.parentElement.querySelector(".invalid-feedback");
    const passwordInput = document.querySelector("#password");
    const confirmPassword = document.querySelector("#confirm-password");
    const agreement = document.querySelector("#privacy-agreement-checkbox");

    form.addEventListener("submit", event => {
        if (!agreement.checked) {
            event.preventDefault();
            addErrMessage("You must agree to our privacy agreement to proceed", messageDiv, agreement);
        } else {
            approve(agreement);
        }
        if (passwordInput.value !== confirmPassword.value) {
            event.preventDefault();
            addErrMessage("Password and confirm password are different", messageDiv, confirmPassword);
        } else {
            approve(confirmPassword);
        }
        if (passwordInput.value === '') {
            event.preventDefault();
            addErrMessage("Password cannot be empty", messageDiv, passwordInput);
        } else {
            approve(passwordInput);
        }
        if (usernameInput.value === '') {
            event.preventDefault();
            usernameFeedback.innerText = 'Please enter a username';
            addErrMessage("Username cannot be empty", messageDiv, usernameInput);
        } else if (!usernameUnique) {
            event.preventDefault();
            usernameFeedback.innerText = 'Username taken, please enter a different username';
            addErrMessage("Username cannot be empty", messageDiv, usernameInput);
        } else {
            approve(usernameInput);
        }
        if (nameInput.value === '') {
            event.preventDefault();
            addErrMessage("Name cannot be empty", messageDiv, nameInput);
        } else {
            approve(nameInput);
        }
    });

    usernameInput.addEventListener('blur', () => {
        fetch(`/check_unique_username_async?username=${usernameInput.value}`)
            .then(response => response.text())
            .then(response => {
                if (response !== 'username is unique') {
                    usernameUnique = false;
                    addErrMessage("Username is already taken", messageDiv);
                } else {
                    usernameUnique = true;
                    messageDiv.style.display = "none";
                }
            })
    })
});