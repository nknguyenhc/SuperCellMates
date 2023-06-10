function ChangeUsername() {
    const [newUsername, setNewUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    function submitForm(event) {
        event.preventDefault();
        if (newUsername === '') {
            setErrorMessage('New username cannot be empty');
            return;
        } else if (password === '') {
            setErrorMessage('Password cannot be empty');
            return;
        }

        fetch('/change_username', postRequestContent({
            new_username: newUsername,
            password: password
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                } else {
                    response.text().then(text => {
                        if (text !== "Username changed"){
                            setErrorMessage(text);
                        } else {
                            document.querySelector("#change-username-page").style.display = 'none';
                            popChangeAuthMessage("Username changed");
                        }
                    })
                }
            })
    }

    return (
        <React.Fragment>
            <form onSubmit={submitForm}>
                <div className="mb-3">
                    <label htmlFor="new-username" className="form-label">New Username</label>
                    <input type="text" id="new-username" class="form-control" autocomplete="off" onChange={event => {
                        setNewUsername(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Confirm Password</label>
                    <input type="password" id="password" class="form-control" onChange={event => {
                        setPassword(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3">
                    <input type="submit" value="Change Username" className="btn btn-primary" />
                </div>
            </form>
            {
                errorMessage === ''
                ? ''
                : <div>
                    <div className="alert alert-danger" role="alert">{errorMessage}</div>
                </div>
            }
        </React.Fragment>
    );
}


function ChangePassword() {
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    function submitForm(event) {
        event.preventDefault();
        if (oldPassword === '') {
            setErrorMessage("Old password cannot be empty!");
            return;
        } else if (newPassword === '') {
            setErrorMessage("New password cannot be empty!");
            return;
        } else if (newPassword !== confirmNewPassword) {
            setErrorMessage("Password and confirm password do not match!");
            return;
        }

        fetch('/change_password', postRequestContent({
            old_password: oldPassword,
            new_password: newPassword
        }))
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    response.text().then(text => console.log(text));
                } else {
                    response.text().then(text => {
                        if (text !== "Password changed") {
                            setErrorMessage(text);
                        } else {
                            document.querySelector("#change-password-page").style.display = 'none';
                            popChangeAuthMessage("Password changed");
                        }
                    })
                }
            })
    }

    return (
        <React.Fragment>
            <form onSubmit={submitForm}>
                <div className="mb-3">
                    <label htmlFor="old-password" className="form-label">Old Password</label>
                    <input type="password" id="old-password" class="form-control" onChange={event => setOldPassword(event.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="new-password" className="form-label">New Password</label>
                    <input type="password" id="new-password" class="form-control" onChange={event => {
                        setNewPassword(event.target.value);
                        setErrorMessage('')
                    }} />
                </div>
                <div className="mb-3">
                    <label htmlFor="confirm-new-password" className="form-label">Confirm New Password</label>
                    <input type="password" id="confirm-new-password" class="form-control" onChange={event => {
                        setConfirmNewPassword(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3">
                    <input type="submit" value="Update Password" className="btn btn-primary" />
                </div>
            </form>
            {
                errorMessage === ''
                ? ''
                : <div>
                    <div className="alert alert-danger" role="alert">{errorMessage}</div>
                </div>
            }
        </React.Fragment>
    );
}


function popChangeUsernameWindow() {
    const changeUsernamePage = document.querySelector("#change-username-page");
    Array.from(changeUsernamePage.children).forEach(child => changeUsernamePage.removeChild(child));
    const newWindow = document.createElement("div");
    newWindow.className = "edit-window p-3";
    ReactDOM.render(<ChangeUsername />, newWindow);
    changeUsernamePage.appendChild(newWindow);
    changeUsernamePage.style.display = 'block';
}


function popChangePasswordWindow() {
    const changePasswordPage = document.querySelector("#change-password-page");
    Array.from(changePasswordPage.children).forEach(child => changePasswordPage.removeChild(child));
    const newWindow = document.createElement("div");
    newWindow.className = "edit-window p-3";
    ReactDOM.render(<ChangePassword />, newWindow);
    changePasswordPage.appendChild(newWindow);
    changePasswordPage.style.display = 'block';
}


function popChangeAuthMessage(message) {
    document.querySelector("#change-authentication-message-body").innerHTML = message;
    document.querySelector("#change-authentication-button").click();
}