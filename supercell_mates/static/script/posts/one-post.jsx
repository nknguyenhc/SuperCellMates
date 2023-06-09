function Post(props) {
    const post = props.post;

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

    return (
        <React.Fragment>
            <div className="post-header">
                <div className="post-creator-info mb-2">
                    <div className="post-creator-profile-pic">
                        <img src={post.creator.profile_pic_url} />
                    </div>
                    <div className="post-creator-text-info">
                        <div className="post-creator-name">{post.creator.name}</div>
                        <a className="post-creator-username" href={post.creator.profile_link}>@{post.creator.username}</a>
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
                <div className="post-date">{`${formatNumber(new Date(post.time_posted).getDate(), 2)}/${formatNumber(new Date(post.time_posted).getMonth() + 1, 2)}/${formatNumber(new Date(post.time_posted).getFullYear(), 4)} ${formatNumber(new Date(post.time_posted).getHours(), 2)}:${formatNumber(new Date(post.time_posted).getMinutes(), 2)}`}</div>
            </div>
            <h4 className='mb-2'>{post.title}</h4>
            <div className="post-tag mb-2">
                <div className="tag-button btn btn-outline-info">
                    <img src={post.tag.icon} />
                    <div>{post.tag.name}</div>
                </div>
            </div>
            <div className="post-content mb-2">{post.content}</div>
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