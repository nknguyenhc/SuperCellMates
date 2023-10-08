import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerErrorMessage } from '../../utils/locals';
import { Tooltip } from 'bootstrap';
import { formatNumber } from '../../utils/primitives';
import { useDispatch } from 'react-redux';
import { setMessage } from '../../redux/message-slice';
import { Link, useNavigate } from 'react-router-dom';
import { reply } from '../../redux/post-slice';

export type OnePost = {
    id: string,
    title: string,
    content: string,
    tag: Tag,
    public_visible: boolean,
    friend_visible: boolean,
    tag_visible: boolean,
    creator: {
        name: string,
        username: string,
        profile_pic_url: string,
        profile_link: string,
    },
    time_posted: number,
    images: Array<string>,
    can_reply: boolean,
}

export type Tag = {
    name: string,
    icon: string,
}

export type Visibility = "Public" | "People with same tag" | "Friends" | "Friends with same tag";

export default function Post({ post, myProfile}: {
    post: OnePost,
    myProfile: boolean,
}): JSX.Element {
    const [isShowMore, setIsShowMore] = useState<boolean>(false);
    const shortLimit = 500;
    const [iconName, setIconName] = useState<string>('');
    const [visibility, setVisibility] = useState<Visibility>('Public');
    const visTooltip = useRef<HTMLDivElement>(null);
    const replyTooltip = useRef<HTMLDivElement>(null);
    const linkTooltip = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (post.public_visible) {
            setIconName('public-icon.png');
            setVisibility('Public');
        } else if (post.friend_visible) {
            if (post.tag_visible) {
                setIconName('friend-tag-icon.png');
                setVisibility('Friends with same tag');
            } else {
                setIconName('friend-icon.png');
                setVisibility('Friends');
            }
        } else {
            setIconName('tag-icon.png');
            setVisibility('People with same tag');
        }
    }, [post]);

    useEffect(() => {
        const tooltips: Array<Tooltip> = [];
        tooltips.push(new Tooltip(visTooltip.current!, {
            title: visibility,
            placement: 'top',
            trigger: 'hover',
        }));
        if (post.can_reply) {
            tooltips.push(new Tooltip(replyTooltip.current!, {
                title: 'Reply in chat',
                placement: 'top',
                trigger: 'hover',
            }));
        }
        tooltips.push(new Tooltip(linkTooltip.current!, {
            title: 'Copy link',
            placement: 'top',
            trigger: 'hover',
        }));
        return () => {
            tooltips.forEach(t => t.dispose());
        };
    }, [visibility, post]);

    const toReplyPostChat = useCallback(() => {
        fetch('/messages/get_chat_id?username=' + post.creator.username)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                response.text().then(text => {
                    if (text === 'no chat found') {
                        triggerErrorMessage();
                        return;
                    }
                    dispatch(reply({
                        id: post.id,
                        creator: {
                            link: post.creator.profile_link,
                            img: post.creator.profile_pic_url,
                        },
                        title: post.title,
                        content: post.content,
                    }));
                    navigate('/messages/?chatid=' + text);
                });
            });
    }, [post, navigate, dispatch]);

    return (
        <>
            <div className="post-header">
                <div className="post-creator-info mb-2">
                    <div className="post-creator-profile-pic">
                        <img src={post.creator.profile_pic_url} alt="creator" />
                    </div>
                    <div className="post-creator-text-info">
                        <strong className="post-creator-name">{post.creator.name}</strong>
                        <Link className="post-creator-username" to={post.creator.profile_link}>{post.creator.username}</Link>
                    </div>
                    {
                        myProfile
                        ? <div>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                // popEditView(post.id);
                            }}>Edit</button>
                        </div>
                        : ''
                    }
                </div>
                <div className="post-more">
                    <div ref={visTooltip} className="post-link">
                        {iconName && visibility && <img src={"/static/media/" + iconName} alt="copy link" />}
                    </div>
                    <div className="post-date">
                        {`${
                            formatNumber(new Date(post.time_posted).getDate(), 2)
                        }/${
                            formatNumber(new Date(post.time_posted).getMonth() + 1, 2)
                        }/${
                            formatNumber(new Date(post.time_posted).getFullYear(), 4)
                        } ${
                            formatNumber(new Date(post.time_posted).getHours(), 2)
                        }:${
                            formatNumber(new Date(post.time_posted).getMinutes(), 2)
                        }`}
                    </div>
                    {post.can_reply
                    ? <div ref={replyTooltip} className="post-link" onClick={() => toReplyPostChat()}>
                        <img src="/static/media/reply-icon.png" alt="reply" />
                    </div>
                    : ''}
                    <div ref={linkTooltip} className="post-link" onClick={() => {
                        navigator.clipboard.writeText(window.location.host + "/post/display?id=" + post.id);
                        dispatch(setMessage('Link copied to clipboard!'));
                    }}>
                        <img src="/static/media/hyperlink-icon.png" alt="copy link" />
                    </div>
                </div>
            </div>
            <h4 className='mb-2 post-title'>{post.title}</h4>
            <div className="post-tag mb-2">
                <div className="tag-button btn btn-outline-info">
                    <img src={post.tag.icon} alt="tag" />
                    <div>{post.tag.name}</div>
                </div>
            </div>
            <div className="post-content mb-2">
                {
                    post.content.length > shortLimit
                    ? isShowMore
                        ? <div>
                            {post.content + '\n'}
                            <div className="clickable text-primary" onClick={() => setIsShowMore(false)}>See Less</div>
                        </div>
                        : <div>
                            {post.content.slice(0, shortLimit) + ' ... '}
                            <div className="clickable text-primary" onClick={() => setIsShowMore(true)}>See More</div>
                        </div>
                    : post.content
                }
            </div>
            <div className="post-images mb-2">
                {
                    post.images.length === 0
                    ? ''
                    : <PostImages
                        id={post.id}
                        images={post.images}
                    />
                }
            </div>
        </>
    );
}

function PostImages({ id, images }: {
    id: string,
    images: Array<string>,
}) {
    return (
        <div className="carousel slide" id={"post-images-carousel-" + id} data-bs-theme="dark">
            <div className="carousel-indicators">
                {images.map((_, i) => (
                    <button 
                        type="button" 
                        data-bs-target={"#post-images-carousel-" + id} 
                        data-bs-slide-to={i.toString()} 
                        className={i === 0 ? "active" : ""} 
                        aria-current={i === 0} 
                        key={i}
                    />
                ))}
            </div>
            <div className="carousel-inner">
                {images.map((image, i) => (
                    <div className={i === 0 ? "carousel-item active" : "carousel-item"} key={i}>
                        <img src={image} className="d-block" alt="" />
                    </div>
                ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target={"#post-images-carousel-" + id} data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target={"#post-images-carousel-" + id} data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    )
}