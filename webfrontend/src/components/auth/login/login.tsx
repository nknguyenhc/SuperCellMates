import { useCallback, useState, FormEvent, useEffect } from "react";
import { postRequestContent } from "../../../utils/request";
import { triggerErrorMessage } from "../../../utils/locals";
import { useNavigate } from "react-router-dom";
import { getURLParams } from "../../../utils/url";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/auth-slice";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";


export const Login = (): JSX.Element => {
    const [isUsernameError, setIsUsernameError] = useState<boolean>(false);
    const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (auth.isVerified && auth.isLoggedIn) {
            const { next } = getURLParams();
            navigate(next ? next : '/');
        }
    }, [auth, navigate]);

    const handleSubmit = useCallback<(e: FormEvent<HTMLFormElement>) 
            => void>((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let isError = false;
        if (username === '') {
            setIsUsernameError(true);
            setErrorMessage('Username cannot be empty!');
            isError = true;
        }
        if (password === '') {
            setIsPasswordError(true);
            setErrorMessage('Password cannot be empty!');
            isError = true;
        }
        if (isError) {
            return;
        }
        setErrorMessage('');

        fetch('/login_async', postRequestContent({
            username: username,
            password: password,
        }))
            .then(res => {
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.text().then(res => {
                    if (res !== 'logged in') {
                        setErrorMessage('Wrong username or password');
                    } else {
                        dispatch(login({
                            username: username,
                        }));
                    }
                });
            })
    }, [username, password, dispatch]);

    return <div className="authentication-form-container">
        <form 
            autoComplete="off"
            method="POST"
            id="login-form"
            className="authentication-form needs-validation"
            noValidate
            onSubmit={handleSubmit}
        >
            <div className="m-2">
                <label className="form-label">Username</label>
                <input 
                    type="text" 
                    className={"form-control" + (isUsernameError ? " is-invalid" : "")}
                    autoFocus 
                    required 
                    onChange={e => {
                        setUsername(e.target.value);
                        setIsUsernameError(false);
                    }}
                />
                <div className="invalid-feedback">Please enter a username</div>
            </div>
            <div className="m-2">
                <label className="form-label">Password</label>
                <input 
                    type="password" 
                    className={"form-control" + (isPasswordError ? " is-invalid" : "")}
                    required 
                    onChange={e => {
                        setPassword(e.target.value);
                        setIsPasswordError(false);
                    }}
                />
                <div className="invalid-feedback">Please enter a password</div>
            </div>
            <div className="m-2">
                <input type="submit" className="btn btn-primary" value="Login" />
            </div>
            <div className="m-2">Don't have an account yet? Register <a href="/register">here</a>.</div>
            {errorMessage !== '' && <div className="authentication-error">
                <div className="alert alert-danger m-2" id="login-message">{errorMessage}</div>
            </div>}
        </form>
    </div>;
}