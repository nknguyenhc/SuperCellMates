import { useCallback, useState, FormEvent } from "react";
import { postRequestContent } from "../../../utils/request";
import { triggerErrorMessage } from "../../../utils/locals";


export const Login = (): JSX.Element => {
    const [isUsernameError, setIsUsernameError] = useState<boolean>(false);
    const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

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
                } else {
                    res.text().then(res => console.log(res));
                }
            })
    }, [username, password]);

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