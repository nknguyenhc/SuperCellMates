document.addEventListener("DOMContentLoaded", () => {
    const messageDiv = document.querySelector("#register-message");
    messageDiv.style.display = "none";
    let usernameUnique = true;

    const form = document.querySelector("#register-form");
    const nameInput = document.querySelector("#name");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const confirmPassword = document.querySelector("#confirm-password");
    const agreement = document.querySelector("#privacy-agreement-checkbox");

    let isLoading = false;
    function setIsLoading(newValue) {
        isLoading = newValue;
        document.querySelector(".loading-icon").style.display = newValue ? 'block' : 'none';
    }

    form.addEventListener("submit", event => {
        if (isLoading) {
            event.preventDefault();
            return;
        }
        if (!agreement.checked) {
            event.preventDefault();
            addErrMessage("You must agree to our privacy agreement to proceed", messageDiv, agreement, "You must agree to proceed");
        } else {
            approve(agreement);
        }
        if (passwordInput.value !== confirmPassword.value) {
            event.preventDefault();
            addErrMessage("Password and confirm password are different", messageDiv, confirmPassword, "Password and confirm password does not match");
        } else {
            approve(confirmPassword);
        }
        if (passwordInput.value === '') {
            event.preventDefault();
            addErrMessage("Password cannot be empty", messageDiv, passwordInput, "Please enter a password");
        } else {
            approve(passwordInput);
        }
        if (usernameInput.value === '') {
            event.preventDefault();
            addErrMessage("Username cannot be empty", messageDiv, usernameInput, 'Please enter a username');
        } else if (usernameInput.value.length > 15) {
            event.preventDefault();
            addErrMessage("Username is too long", messageDiv, usernameInput, "Username must be 15 characters or less");
        } else if (!usernameUnique) {
            event.preventDefault();
            addErrMessage("Username is taken, please enter a different username", messageDiv, usernameInput, 'Username is taken');
        } else if (!isAlphaNumeric(usernameInput.value)) {
            event.preventDefault();
            addErrMessage("Username can only contains alphabets (lower and upper case) and numbers", messageDiv, usernameInput, "Username cannot contain special characters")
        } else {
            approve(usernameInput);
        }
        if (nameInput.value === '') {
            event.preventDefault();
            addErrMessage("Name cannot be empty", messageDiv, nameInput, "Please enter a name");
        } else if (nameInput.value.length > 15) {
            event.preventDefault();
            addErrMessage("Name is too long", messageDiv, nameInput, "Name must be 15 characters or less");
        } else {
            approve(nameInput);
        }
    });

    usernameInput.addEventListener('blur', () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        fetch(`/check_unique_username_async?username=${usernameInput.value}`)
            .then(response => {
                setIsLoading(false);
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.text().then(response => {
                        if (response !== 'username is unique') {
                            usernameUnique = false;
                            addErrMessage("Username is already taken", messageDiv, usernameInput, "Username taken, please enter a different username");
                        } else {
                            usernameUnique = true;
                            if (messageDiv.innerText === "Username is already taken") {
                                messageDiv.style.display = "none";
                            }
                            approve(usernameInput);
                        }
                    });
                }
            });
    })
});