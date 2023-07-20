function Entry() {
    const [showKey, setShowKey] = React.useState(false);
    const [key, setKey] = React.useState(null);
    const [pass, setPass] = React.useState('');
    const [inp, setInp] = React.useState('');

    React.useEffect(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const first = chars[31] + chars[30];
        let string = '';
        const second = chars[45] + chars[28] + chars[33];
        for (let i = 0; i < 20; i++) {
            string += chars[Math.floor(Math.random() * 20)];
        }
        const text = eval(first + second);
        setPass(string);
        const myT = chars[45];
        const third = myT + 'es' + myT;
        const fourth = myT + 'ex' + myT;
        text(`/${third}/${fourth}/${chars[54]}`).then(response => response.text()).then(text => setKey(text));
    }, []);

    const checkPass = () => {
        if (inp !== pass) {
            setErr(true);
            setTimeout(() => setErr(false), 6000);
        } else {
            setShowKey(true);
        }
    }

    return (
        <div id="text-body-inner">
            <div className="mb-3">Enter the correct passphrase, and I will give you the key</div>
            <input type="text" className="form-control mb-3" onChange={event => setInp(event.target.value)} />
            <div className="btn btn-primary mb-3" onClick={checkPass}>Submit</div>
            <div className="alert alert-danger mb-3" role="alert"></div>
            {showKey && <div>{key}</div>}
        </div>
    )
}


ReactDOM.render(<Entry />, document.querySelector("#text-body"))