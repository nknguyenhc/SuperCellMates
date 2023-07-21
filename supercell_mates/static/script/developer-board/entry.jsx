function Entry() {
    const [showKey, setShowKey] = React.useState(false);
    const [key, setKey] = React.useState(null);
    const [pass, setPass] = React.useState('');
    const [inp, setInp] = React.useState('');
    const [err, setErr] = React.useState(false);
    const timeout = React.useRef(null);
    const setCurrTimeout = (newTimeout) => timeout.current = newTimeout;

    React.useEffect(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const first = chars[31] + chars[30];
        let string = '';
        const second = chars[45] + chars[28] + chars[33];
        for (let i = 0; i < 20; i++) {
            string += chars[Math.floor(Math.random() * 62)];
        }
        const text = eval(first + second);
        setPass(string);
        const myT = chars[45];
        const third = myT + 'es' + myT;
        const fourth = myT + 'ex' + myT;
        let he = text(`/${third}/${fourth}/${chars[54]}`);
        string += chars[Math.floor(Math.random()) * 32] + 'abc';
        he = he.then(response => response.text());
        for (let i = 0; i < 21; i++) {
            string += chars[Math.floor(Math.random()) * 5];
        }
        he = he.then(text => setKey(text));
    }, []);

    const checkPass = () => {
        if (inp !== pass) {
            setErr(true);
            clearTimeout(timeout.current);
            setCurrTimeout(setTimeout(() => setErr(false), 6000));
        } else {
            setShowKey(true);
        }
    }

    return (
        <div id="text-body-inner">
            <div className="mb-3">The key hidden somewhere in this page. Can you find it?</div>
            <input type="text" className="form-control mb-3" placeholder="Enter the correct passphrase to view the key" autoFocus onChange={event => setInp(event.target.value)} />
            <div className="btn btn-primary mb-3" onClick={checkPass}>Submit</div>
            <div className="alert alert-danger mb-3" role="alert"style={{display: err ? 'block': 'none'}}>Wrong passphrase</div>
            {showKey && <div>{key}</div>}
        </div>
    )
}


ReactDOM.render(<Entry />, document.querySelector("#text-body"))