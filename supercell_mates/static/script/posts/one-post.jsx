function Post(props) {
    const post = props.post;
    const [isShowMore, setIsShowMore] = React.useState(false);
    const shortLimit = 500;
    const [iconName, setIconName] = React.useState(null);
    const [visibility, setVisibility] = React.useState(null);
    const visTooltip = React.useRef(null);
    const replyTooltip = React.useRef(null);
    const linkTooltip = React.useRef(null);

    function PostImages() {
        return (
            <div className="carousel slide" id={"post-images-carousel-" + post.id} data-bs-theme="dark">
                <div class="carousel-indicators">
                    {
                        post.images.map((_, i) => (
                            <button type="button" data-bs-target={"#post-images-carousel-" + post.id} data-bs-slide-to={i.toString()} class={i === 0 ? "active" : ""} aria-current={i === 0 ? "true" : ""}></button>
                        ))
                    }
                </div>
                <div class="carousel-inner">
                    {
                        post.images.map((image, i) => (
                            <div class={i === 0 ? "carousel-item active" : "carousel-item"}>
                                <img src={image} class="d-block" />
                            </div>
                        ))
                    }
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target={"#post-images-carousel-" + post.id} data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target={"#post-images-carousel-" + post.id} data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        )
    }

    React.useEffect(() => {
        if (post.public_visible) {
            setIconName('public-icon.png');
            setVisibility('public');
        } else if (post.friend_visible) {
            if (post.tag_visible) {
                setIconName('friend-tag-icon.png');
                setVisibility('friends with same tag');
            } else {
                setIconName('friend-icon.png');
                setVisibility('friends');
            }
        } else {
            setIconName('tag-icon.png');
            setVisibility('people with same tag');
        }
    }, []);

    React.useEffect(() => {
        const tooltips = [];
        if (visTooltip.current) {
            tooltips.push(new bootstrap.Tooltip(visTooltip.current));
        }
        if (replyTooltip.current) {
            tooltips.push(new bootstrap.Tooltip(replyTooltip.current));
        }
        if (linkTooltip.current) {
            tooltips.push(new bootstrap.Tooltip(linkTooltip.current));
        }
        return () => {
            tooltips.forEach(t => t.dispose());
        };
    }, [visTooltip.current, replyTooltip.current, linkTooltip.current]);

    function toReplyPostChat() {
        fetch('/messages/get_chat_id?username=' + post.creator.username)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.text().then(text => {
                    if (text === 'no chat found') {
                        triggerErrorMessage();
                    } else {
                        const postReplies = getJSONItemFrom('postReplies', {}, sessionStorage);
                        postReplies[post.creator.username] = post.id;
                        sessionStorage.setItem('postReplies', JSON.stringify(postReplies));
                        window.location.assign('/messages/?chatid=' + text);
                    }
                })
            })
    }

    return (
        <React.Fragment>
            <div className="post-header">
                <div className="post-creator-info mb-2">
                    <div className="post-creator-profile-pic">
                        <img src={post.creator.profile_pic_url} />
                    </div>
                    <div className="post-creator-text-info">
                        <strong className="post-creator-name">{post.creator.name}</strong>
                        <a className="post-creator-username" href={post.creator.profile_link}>{post.creator.username}</a>
                    </div>
                    {
                        props.myProfile
                        ? <div>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                popEditView(post.id);
                            }}>Edit</button>
                        </div>
                        : ''
                    }
                </div>
                <div className="post-more">
                    <div ref={visTooltip} className="post-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title={visibility}>
                        {iconName && visibility &&<img src={"/static/media/" + iconName} />}
                    </div>
                    <div className="post-date">{`${formatNumber(new Date(post.time_posted).getDate(), 2)}/${formatNumber(new Date(post.time_posted).getMonth() + 1, 2)}/${formatNumber(new Date(post.time_posted).getFullYear(), 4)} ${formatNumber(new Date(post.time_posted).getHours(), 2)}:${formatNumber(new Date(post.time_posted).getMinutes(), 2)}`}</div>
                    {
                        post.can_reply
                        ? <div ref={replyTooltip} className="post-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Reply in chat" onClick={() => toReplyPostChat()}>
                            <img src="/static/media/reply-icon.png" />
                        </div>
                        : ''
                    }
                    <div ref={linkTooltip} className="post-link" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Copy link" onClick={() => {
                        navigator.clipboard.writeText(window.location.host + "/post/display?id=" + post.id);
                        bottomMessageManager.popMessage('Link copied to clipboard!');
                    }}>
                        <img src="/static/media/hyperlink-icon.png" />
                    </div>
                </div>
            </div>
            <h4 className='mb-2'>{post.title}</h4>
            <div className="post-tag mb-2">
                <div className="tag-button btn btn-outline-info">
                    <img src={post.tag.icon} />
                    <div>{post.tag.name}</div>
                </div>
            </div>
            <div className="post-content mb-2">
                {
                    post.content.length > shortLimit
                    ? isShowMore
                        ? <div>
                            {post.content + '\n'}
                            <a href="javascript:void(0)" onClick={() => setIsShowMore(false)}>See Less</a>
                        </div>
                        : <div>
                            {post.content.slice(0, shortLimit) + ' ... '}
                            <a href="javascript:void(0)" onClick={() => setIsShowMore(true)}>See More</a>
                        </div>
                    : post.content
                }
            </div>
            <div className="post-images mb-2">
                {
                    post.images.length === 0
                    ? ''
                    : <PostImages />
                }
            </div>
        </React.Fragment>
    );
}


function FilterMessage({ count }) {
    const filterMessageDiv = React.useRef(null);
    const [timer, dispatchTimer] = React.useReducer((state, action) => {
        if (action === 'reset') {
            return 5;
        } else if (action === 'countdown') {
            return state - 1;
        }
    }, 5);
    const timeout = React.useRef(null);
    const interval = React.useRef(null);

    React.useEffect(() => {
        function addClasses() {
            filterMessageDiv.current.classList.add('filter-message-transition');
            filterMessageDiv.current.classList.add('filter-message-position');
            filterMessageDiv.current.classList.add('filter-message-fading');
        }
        function removeClasses() {
            filterMessageDiv.current.classList.remove('filter-message-transition');
            filterMessageDiv.current.classList.remove('filter-message-position');
            filterMessageDiv.current.classList.remove('filter-message-fading');
        }

        if (count !== 0) {
            clearTimeout(timeout.current);
            clearInterval(interval.current);
            removeClasses();
            setTimeout(addClasses, 10);
            timeout.current = setTimeout(() => {
                removeClasses();
                window.location.reload();
            }, 5000);
            dispatchTimer('reset');
            interval.current = setInterval(() => {
                dispatchTimer('countdown');
            }, 1000);
        }
    }, [count]);

    return <div id="filter-message" ref={filterMessageDiv} class="alert alert-info" role="alert">Filter applied! Reloading in {timer} seconds.</div>
}