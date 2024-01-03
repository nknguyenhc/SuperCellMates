import { triggerErrorMessage } from "../../utils/locals";
import { useEffect, useCallback, useRef } from "react";
import Post, { OnePost } from "../posts/one-post";
import { useHomeContext } from "../../pages/home/home-context";

export default function HomeFeed(): JSX.Element {
    const {
        sortMethod,
        isFriendFilter,
        isTagFilter,
        isLoading,
        setIsLoading,
        posts,
        setPosts,
        isAllPostsLoaded,
        setIsAllPostsLoaded,
        startNumber,
        setStartNumber,
        initialTimestamp,
        setInitialTimestamp,
    } = useHomeContext();
    
    const postsPerLoad = 10;
    const homeFeedContent = useRef<HTMLDivElement>(null);

    const loadMorePosts = useCallback<() => Promise<number>>(async () => {
        return fetch(`/post/?friend_filter=${
            isFriendFilter ? 1 : 0
        }&tag_filter=${
            isTagFilter ? 1 : 0
        }&sort=${sortMethod}&${
            sortMethod === 'time' ? 'start_timestamp' : 'start_index'
        }=${startNumber}${
            sortMethod === 'recommendation' ? `&initial_timestamp=${initialTimestamp}` : ''
        }&limit=${postsPerLoad}`)
            .then(response => {
                if (response.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                return response.json().then(response => {
                    response.posts.forEach((post: OnePost) => {
                        post.time_posted *= 1000;
                    })
                    setPosts(curr => [
                        ...curr,
                        ...response.posts as Array<OnePost>,
                    ]);
                    sortMethod === 'recommendation' && setInitialTimestamp(response.initial_timestamp);
                    return sortMethod === 'time' ? response.stop_timestamp : response.stop_index;
                });
            });
    }, [isFriendFilter, isTagFilter, startNumber, sortMethod, initialTimestamp, setPosts, setInitialTimestamp]);

    const scrollCallback = useCallback<() => void>(() => {
        if (!isLoading && !isAllPostsLoaded && document.body.offsetHeight - window.innerHeight - window.scrollY < 100) {
            setIsLoading(true);
            loadMorePosts().then(newTimestamp => {
                if (newTimestamp !== 0) {
                    setStartNumber(newTimestamp);
                } else {
                    setIsAllPostsLoaded(true);
                }
                setIsLoading(false);
            });
        }
    }, [isAllPostsLoaded, loadMorePosts, isLoading, setIsLoading, setIsAllPostsLoaded, setStartNumber]);

    const deletePostCallback = useCallback((postId: string) => () => {
        setPosts(posts => posts.filter(post => post.id !== postId));
    }, [setPosts]);

    const editPostCallback = useCallback((newPost: OnePost) => {
        setPosts(posts => posts.map(post => post.id === newPost.id ? newPost : post));
    }, [setPosts]);

    useEffect(() => {
        window.addEventListener('scroll', scrollCallback);
        return () => window.removeEventListener('scroll', scrollCallback);
    }, [scrollCallback]);

    return (
        <>
            <div className="home-feed-content" ref={homeFeedContent}>
                {posts.map(post => (
                    <div className="post-card" key={post.id}>
                        <Post
                            post={post}
                            onEdit={editPostCallback}
                            onDelete={deletePostCallback(post.id)}
                        />
                    </div>
                ))}
            </div>
            <span 
                className="spinner-border text-info" 
                id="post-loader" 
                role="status" 
                style={{
                    display: isLoading ? "" : "none"
                }}
            />
        </>
    )
}