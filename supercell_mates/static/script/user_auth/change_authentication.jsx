function ChangeUsername() {
    const [newUsername, setNewUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    function submitForm(event) {
        event.preventDefault();
        if (newUsername === '') {
            setErrorMessage('New username cannot be empty');
            return;
        } else if (newUsername.length > 15) {
            setErrorMessage('Username must be 15 characters or less');
            return;
        } else if (!isAlphaNumeric(newUsername)) {
            setErrorMessage('Username can only contain alphabets (lower and upper case) and numbers');
            return;
        } else if (password === '') {
            setErrorMessage('Password cannot be empty');
            return;
        }

        if (!isLoading) {
            setIsLoading(true);
            fetch('/change_username', postRequestContent({
                new_username: newUsername,
                password: password
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        response.text().then(text => {
                            if (text !== "Username changed") {
                                setErrorMessage(text);
                            } else {
                                document.querySelector("#change-username-page").style.display = 'none';
                                popChangeAuthMessage("Username changed");
                            }
                        })
                    }
                });
        }
    }

    return (
        <React.Fragment>
            <button type="button" class="change-details-close btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => document.querySelector("#change-username-page").style.display = 'none'} />
            <form className="change-details-form" onSubmit={submitForm}>
                <div className="mb-3">
                    <label htmlFor="new-username" className="form-label">New Username <strong className="asterisk">*</strong></label>
                    <input type="text" id="new-username" class="form-control" autocomplete="off" onChange={event => {
                        setNewUsername(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Confirm Password <strong className="asterisk">*</strong></label>
                    <input type="password" id="password" class="form-control" onChange={event => {
                        setPassword(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3 change-details-submit">
                    <input type="submit" value="Change Username" className="btn btn-primary" disabled={isLoading} />
                    <span className="spinner-border text-warning" style={{display: isLoading ? '' : 'none'}} />
                </div>
            </form>
            {
                errorMessage !== '' && 
                <div>
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
    const [isLoading, setIsLoading] = React.useState(false);

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

        if (!isLoading) {
            setIsLoading(true);
            fetch('/change_password', postRequestContent({
                old_password: oldPassword,
                new_password: newPassword
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
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
                });
        }
    }

    return (
        <React.Fragment>
            <button type="button" class="change-details-close btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => document.querySelector("#change-password-page").style.display = 'none'} />
            <form className="change-details-form" onSubmit={submitForm}>
                <div className="mb-3">
                    <label htmlFor="old-password" className="form-label">Old Password <strong className="asterisk">*</strong></label>
                    <input type="password" id="old-password" class="form-control" onChange={event => setOldPassword(event.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="new-password" className="form-label">New Password <strong className="asterisk">*</strong></label>
                    <input type="password" id="new-password" class="form-control" onChange={event => {
                        setNewPassword(event.target.value);
                        setErrorMessage('')
                    }} />
                </div>
                <div className="mb-3">
                    <label htmlFor="confirm-new-password" className="form-label">Confirm New Password <strong className="asterisk">*</strong></label>
                    <input type="password" id="confirm-new-password" class="form-control" onChange={event => {
                        setConfirmNewPassword(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3 change-details-submit">
                    <input type="submit" value="Update Password" className="btn btn-primary" disabled={isLoading} />
                    <span className="spinner-border text-warning" style={{display: isLoading ? '' : 'none'}} />
                </div>
            </form>
            {
                errorMessage !== '' &&
                <div>
                    <div className="alert alert-danger" role="alert">{errorMessage}</div>
                </div>
            }
        </React.Fragment>
    );
}


function ChangeName() {
    const [newName, setNewName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    function submitForm(event) {
        event.preventDefault();
        if (newName === '') {
            setErrorMessage('New name cannot be empty');
            return;
        } else if (newName.length > 15) {
            setErrorMessage('Name must be 15 characters or less');
            return;
        } else if (password === '') {
            setErrorMessage('Password cannot be empty');
            return;
        }

        if (!isLoading) {
            setIsLoading(false);
            fetch('/profile/change_name', postRequestContent({
                name: newName,
                password: password
            }))
                .then(response => {
                    setIsLoading(true);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        response.text().then(text => {
                            if (text !== "Name changed") {
                                setErrorMessage(text);
                            } else {
                                document.querySelector("#change-name-page").style.display = "none";
                                popChangeAuthMessage("Name changed");
                            }
                        })
                    }
                });
        }
    }

    return (
        <React.Fragment>
            <button type="button" class="change-details-close btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => document.querySelector("#change-name-page").style.display = 'none'} />
            <form className="change-details-form" onSubmit={submitForm}>
                <div className="mb-3">
                    <label htmlFor="new-name" className="form-label">New Name <strong className="asterisk">*</strong></label>
                    <input type="text" id="new-name" className="form-control" autoComplete="off" onChange={event => {
                        setNewName(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Confirm Password <strong className="asterisk">*</strong></label>
                    <input type="password" id="password" className="form-control" onChange={event => {
                        setPassword(event.target.value);
                        setErrorMessage('');
                    }} />
                </div>
                <div className="mb-3 change-details-submit">
                    <input type="submit" value="Change Name" className="btn btn-primary" disabled={isLoading} />
                    <span className="spinner-border text-warning" style={{display: isLoading ? '' : 'none'}} />
                </div>
            </form>
            {
                errorMessage !== '' &&
                <div>
                    <div className="alert alert-danger" role="alert">{errorMessage}</div>
                </div>
            }
        </React.Fragment>
    )
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


function popChangeNameWindow() {
    const changeNamePage = document.querySelector("#change-name-page");
    Array.from(changeNamePage.children).forEach(child => changeNamePage.removeChild(child));
    const newWindow = document.createElement("div");
    newWindow.className = "edit-window p-3";
    ReactDOM.render(<ChangeName />, newWindow);
    changeNamePage.appendChild(newWindow);
    changeNamePage.style.display = 'block';
}


function popChangeAuthMessage(message) {
    document.querySelector("#change-authentication-message-body").innerHTML = message;
    document.querySelector("#change-authentication-button").click();
}