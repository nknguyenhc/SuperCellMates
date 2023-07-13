function DisplayOnePost() {
    const [post, setPost] = React.useState(undefined);
    const [isWindowSearchInvalid, setIsWindowSearchInvalid] = React.useState(false);
    const [isPostIdInvalid, setIsPostIdInvalid] = React.useState(false);

    React.useEffect(() => {
        const windowSearches = window.location.search
            .slice(1)
            .split('&')
            .map(q => q.split('='))
            .filter(q => q[0] === 'id');
        
        if (windowSearches.length === 0 || windowSearches[0].length === 1) {
            setIsWindowSearchInvalid(true);
            return;
        }
        const postId = windowSearches[0][1];

        fetch('/post/post/' + postId)
            .then(response => {
                if (response.status !== 200) {
                    setIsPostIdInvalid(true);
                    return;
                }
                response.json().then(post => {
                    post.time_posted *= 1000;
                    setPost(post);
                })
            });
    }, []);

    return post 
        ? <Post post={post} myProfile={false} /> 
        : isWindowSearchInvalid
        ? <div>Invalid search parameter(s) provided</div>
        : isPostIdInvalid
        ? <div>Either an error has occurred, or post id provided is invalid</div>
        : <div></div>;
}

ReactDOM.render(<DisplayOnePost />, document.querySelector("#display-post"));