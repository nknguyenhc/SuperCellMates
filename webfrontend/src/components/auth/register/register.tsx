import { useCallback, useState, FormEvent, useEffect, ChangeEvent } from "react";
import { postRequestContent } from "../../../utils/request";
import { triggerErrorMessage } from "../../../utils/locals";
import { isAlphaNumeric } from "../../../utils/primitives";
import { getURLParams } from "../../../utils/url";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../redux/auth-slice";
import { RootState } from "../../../redux/store";


export const Register = (): JSX.Element => {
    const [name, setName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isUniqueUsername, setIsUniqueUsername] = useState<boolean>(false);

    const [nameWarning, setNameWarning] = useState<string | undefined>();
    const [usernameWarning, setUsernameWarning] = useState<string | undefined>();
    const [passwordWarning, setPasswordWarning] = useState<string | undefined>();
    const [password2Warning, setPassword2Warning] = useState<string | undefined>();
    const [checkboxWarning, setCheckboxWarning] = useState<string | undefined>();

    const [bottomErrorMessage, setBottomErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [timeoutID, setTimeoutID] = useState<number>();

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (auth.isVerified && auth.isLoggedIn) {
            const { next } = getURLParams();
            navigate(next ? next : '/');
        }
    }, [auth, navigate]);

    const checkUsernameUniqueness = useCallback((username : string) => {
        if (username === '') {
            setUsernameWarning('Please enter a username');
            setIsLoading(false);
            return;
        } else if (username.length > 15) {
            setUsernameWarning('Username must be 15 characters or less');
            setIsLoading(false);
            return;
        } else if (!isAlphaNumeric(username)) {
            setUsernameWarning('Username cannot contain special characters');
            setIsLoading(false);
            return;
        } else {
            setUsernameWarning('');
        }
        fetch('/check_unique_username_async?username=' + username, {
            method: "GET",
        })
            .then(res => {
                setIsLoading(false);
                if (res.status !== 200) {
                    triggerErrorMessage();
                    setIsUniqueUsername(false);
                    return;
                }
                res.text().then(res => {
                    if (res === 'username is already taken') {
                        setUsernameWarning('Username is taken, please enter a different username');
                        setBottomErrorMessage('Username is taken');
                        setIsUniqueUsername(false);
                        return;
                    }
                })
            })
        setIsUniqueUsername(true);
        setUsernameWarning('None');
        return;
    }, []);

    // check username uniqueness 1 second after user stops typing
    const handleUsernameChange = useCallback((e: ChangeEvent) => {
        const newUsername = (e.target as HTMLInputElement).value;
        setUsername(newUsername);
        setIsLoading(true);
        clearTimeout(timeoutID);
        const newTimeoutID = window.setTimeout(() => {
            checkUsernameUniqueness(newUsername);
        }, 1000);
        setTimeoutID(newTimeoutID);
    }, [timeoutID, checkUsernameUniqueness]);

    const handleSubmit = useCallback<(e: FormEvent<HTMLFormElement>) 
            => void>((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let error = 0;

        // Checks are done from bottom element to top, so that bottom error message displays topmost error

        if (!isChecked) {
            setCheckboxWarning('You must agree to proceed');
            setBottomErrorMessage('You must agree to our privacy agreement to proceed');
            error += 1;
        } else {
            setCheckboxWarning('None');
        }

        if (password !== password2) {
            setPassword2Warning('Password and confirm password does not match');
            setBottomErrorMessage('Password and confirm password are different');
            error += 1;
        } else {
            setPassword2Warning('None');
        }

        if (password === '') {
            setPasswordWarning('Please enter a password');
            setBottomErrorMessage('Password cannot be empty');
            error += 1;
        } else {
            setPasswordWarning('None');
        }

        checkUsernameUniqueness(username);

        if (username === '') {
            setUsernameWarning('Please enter a username');
            setBottomErrorMessage('Username cannot be empty');
            error += 1;
        } else if (username.length > 15) {
            setUsernameWarning('Username must be 15 characters or less');
            setBottomErrorMessage('Username is too long');
            error += 1;
        } else if (!isAlphaNumeric(username)) {
            setUsernameWarning('Username cannot contain special characters');
            setBottomErrorMessage('Username can only contains alphabets (lower and upper case) and numbers');
            error += 1;
        } else if (!isUniqueUsername) {
            error += 1;
        } else{
            setUsernameWarning('None');
        }

        if (name === '') {
            setNameWarning('Please enter a name');
            setBottomErrorMessage('Name cannot be empty');
            error += 1;
        } else if (name.length > 15) {
            setNameWarning('Name must be 15 characters or less');
            setBottomErrorMessage('Name is too long');
            error += 1;
        } else {
            setNameWarning('None');
        }

        if (error > 0) {
            return;
        }
        setBottomErrorMessage('');

        setIsLoading(true);
        fetch('/register_async', postRequestContent({
            username: username,
            password: password,
            name: name,
        }))
            .then(res => {
                setIsLoading(false);
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.text().then(res => {
                    dispatch(login({
                        username: username,
                    }));
                });
            })
    }, [name, username, password, password2, isChecked, isUniqueUsername, checkUsernameUniqueness, dispatch]);

    return (
    <div className="authentication-form-container">
        <form
            autoComplete="off"
            action="{% url 'register_async' %}"
            method="POST"
            id="register-form"
            className="authentication-form needs-validation"
            noValidate
            onSubmit={handleSubmit}
        >
            <div className="m-2">
                <label htmlFor="name" className="form-label">Name <strong className="asterisk">*</strong>
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    className={"form-control" + (nameWarning ? (nameWarning === 'None' ? " is-valid" : " is-invalid") : "")}
                    autoFocus={true}
                    value={name}
                    spellCheck="false"
                    required
                    onChange={e => {
                        setName(e.target.value);
                    }}
                />
                <div className="invalid-feedback d-block">{nameWarning === 'None' ? "" : nameWarning}</div>
            </div>
            <div className="m-2">
            <label htmlFor="username" className="form-label">Username <strong className="asterisk">*</strong>
            </label>
            <input
                type="text"
                name="username"
                id="username"
                className={"form-control" + (usernameWarning ? (usernameWarning === 'None' ? " is-valid" : " is-invalid") : "")}
                value={username}
                spellCheck="false"
                onChange={handleUsernameChange}
            />
            <div className="invalid-feedback d-block">{usernameWarning === 'None' ? "" : usernameWarning}</div>
            </div>
            <div className="m-2">
            <label htmlFor="password" className="form-label">Password <strong className="asterisk">*</strong>
            </label>
            <input
                type="password"
                name="password"
                id="password"
                className={"form-control" + (passwordWarning ? (passwordWarning === 'None' ? " is-valid" : " is-invalid") : "")}
                value={password}
                onChange={e => {
                    setPassword(e.target.value);
                }}
            />
            <div className="invalid-feedback d-block">{passwordWarning === 'None' ? "" : passwordWarning}</div>
            </div>
            <div className="m-2">
            <label htmlFor="confirm-password" className="form-label">Confirm password <strong className="asterisk">*</strong>
            </label>
            <input
                type="password"
                id="confirm-password"
                className={"form-control" + (password2Warning ? (password === password2 ? " is-valid" : " is-invalid") : "")}
                value={password2}
                onChange={e => {
                    setPassword2(e.target.value);
                }}
                aria-describedby="not-matching-passwords"
            />
            <div className="invalid-feedback d-block">{password2Warning === 'None' ? "" : password2Warning}</div>
            </div>
            <div className="form-check m-2">
            <input
                type="checkbox"
                className={"form-check-input" + (checkboxWarning ? (isChecked ? " is-valid" : " is-invalid") : "")}
                id="privacy-agreement-checkbox"
                checked={isChecked}
                onChange={e => {
                    setIsChecked(!isChecked);
                }}
            />
            <label htmlFor="privacy-agreement-checkbox" className="form-check-label">
                I agree to Match Miner's{" "}
                <a href="/static/files/privacy_agreement.pdf" target="_blank">
                privacy agreement
                </a>
                .
            </label>
            <div className="invalid-feedback d-block">{checkboxWarning === 'None' ? "" : checkboxWarning}</div>
            </div>
            <div className="m-2 authentication-submit">
            <input
                type="submit"
                defaultValue="Create Account"
                className="btn btn-primary"
            />
            <div className="md-6 spinner-border text-warning loading-icon" hidden={!isLoading} role="status"/>
            </div>
            
            {bottomErrorMessage !== '' && <div className="alert alert-danger m-2" id="register-message">{bottomErrorMessage}</div>}
        </form>
    </div>
    );
}