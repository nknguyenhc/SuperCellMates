import { useCallback, useState, FormEvent, useEffect, useRef } from "react";
import { postRequestContent } from "../../../utils/request";
import { triggerErrorMessage } from "../../../utils/locals";
import { isAlphaNumeric } from "../../../utils/primitives";
import { getURLParams } from "../../../utils/url";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { login } from "../../../redux/auth-slice";
import { RootState } from "../../../redux/store";

export const Register = (): JSX.Element => {
    const [name, setName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const [nameWarning, setNameWarning] = useState<string>('');
    const [usernameWarning, setUsernameWarning] = useState<string>('');
    const [passwordWarning, setPasswordWarning] = useState<string>('');
    const [password2Warning, setPassword2Warning] = useState<string>('');
    const [checkboxWarning, setCheckboxWarning] = useState<string>('');

    const [bottomErrorMessage, setBottomErrorMessage] = useState<string>('');

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);

    // useRef is used to ensure states are synced before form submission,
    const passwordRef = useRef<string>();
    const password2Ref = useRef<string>();
    const checkboxRef = useRef<boolean>();

    passwordRef.current = password;
    password2Ref.current = password2;
    checkboxRef.current = isChecked;

    useEffect(() => {
        if (auth.isVerified && auth.isLoggedIn) {
            const { next } = getURLParams();
            navigate(next ? next : '/');
        }
    }, [auth, navigate]);

    function IsUniqueUsername() {
        fetch('/check_unique_username_async?username=' + username, {
            method: "GET",
        })
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return false;
                }
                res.text().then(res => {
                    if (res === 'username is already taken') {
                        setUsernameWarning('Username is taken, please enter a different username');
                        setBottomErrorMessage('Username is taken');
                        return false;
                    } 
                })
            })
        return true;
    }

    const handleSubmit = useCallback<(e: FormEvent<HTMLFormElement>) 
            => void>((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("log start\n");
        let error = 0;

        // Checks are done from bottom element to top, so that bottom error message displays topmost error

        if (!checkboxRef.current) {
            console.log("5\n");
            setCheckboxWarning('You must agree to proceed');
            setBottomErrorMessage('You must agree to our privacy agreement to proceed');
            error += 1;
        } else {
            setCheckboxWarning('');
        }

        if (passwordRef.current !== password2Ref.current) {
            console.log("4\n");
            console.log(password);
            console.log(password2);
            setPassword2Warning('Password and confirm password does not match');
            setBottomErrorMessage('Password and confirm password are different');
            error += 1;
        } else {
            setPassword2Warning('');
        }

        if (passwordRef.current === '') {
            console.log("3\n");
            setPasswordWarning('Please enter a password');
            setBottomErrorMessage('Password cannot be empty');
            error += 1;
        } else {
            setPasswordWarning('');
        }

        if (username === '') {
            console.log("2\n");
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
        } else if (!IsUniqueUsername()) {
            error += 1;
        } else {
            setUsernameWarning('');
        }

        if (name === '') {
            console.log("1\n");
            setNameWarning('Please enter a name');
            setBottomErrorMessage('Name cannot be empty');
            error += 1;
        } else if (name.length > 15) {
            setNameWarning('Name must be 15 characters or less');
            setBottomErrorMessage('Name is too long');
            error += 1;
        } else {
            setNameWarning('');
        }


        console.log("log end\n");

        if (error > 0) {
            return;
        }
        setBottomErrorMessage('');

        fetch('/register_async', postRequestContent({
            username: username,
            password: password,
            name: name,
        }))
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.text().then(res => {
                    if (res !== 'account created') {
                        setBottomErrorMessage("Account creation failed. Please Try again.")
                    } else {
                        dispatch(login({
                            username: username,
                        }));
                    }
                });
            })
    }, [username, password, password2, name, dispatch]);

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
                    className="form-control"
                    autoFocus={true}
                    value={name}
                    spellCheck="false"
                    onChange={e => {
                        setName(e.target.value);
                    }}
                />
                <div className="text-danger"><small>{nameWarning}</small></div>
            </div>
            <div className="m-2">
            <label htmlFor="username" className="form-label">Username <strong className="asterisk">*</strong>
            </label>
            <input
                type="text"
                name="username"
                id="username"
                className="form-control"
                value={username}
                spellCheck="false"
                onChange={e => {
                    setUsername(e.target.value);
                }}
            />
            <div className="text-danger"><small>{usernameWarning}</small></div>
            </div>
            <div className="m-2">
            <label htmlFor="password" className="form-label">Password <strong className="asterisk">*</strong>
            </label>
            <input
                type="password"
                name="password"
                id="password"
                className="form-control"
                value={password}
                onChange={e => {
                    setPassword(e.target.value);
                }}
            />
            <div className="text-danger"><small>{passwordWarning}</small></div>
            </div>
            <div className="m-2">
            <label htmlFor="confirm-password" className="form-label">Confirm password <strong className="asterisk">*</strong>
            </label>
            <input
                type="password"
                id="confirm-password"
                className="form-control"
                value={password2}
                onChange={e => {
                    setPassword2(e.target.value);
                }}
                aria-describedby="not-matching-passwords"
            />
            <div className="text-danger"><small>{password2Warning}</small></div>
            </div>
            <div className="form-check m-2">
            <input
                type="checkbox"
                className="form-check-input"
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
            <div className="text-danger"><small>{checkboxWarning}</small></div>
            </div>
            <div className="m-2 auth-submit">
            <input
                type="submit"
                defaultValue="Create Account"
                className="btn btn-primary"
            />
            </div>
            {bottomErrorMessage !== '' && <div className="alert alert-danger m-2" id="register-message">{bottomErrorMessage}</div>}
        </form>
    </div>
    );
}