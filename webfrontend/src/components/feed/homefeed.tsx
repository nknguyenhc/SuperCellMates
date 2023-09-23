import { getStringFrom, getJSONItemFrom, triggerErrorMessage } from "../../utils/locals";
import { useState, useEffect, useCallback, useRef, useReducer, Reducer } from "react";
import FilterMessage from "../popup/filter-message";
import Post, { OnePost } from "../posts/one-post";

export default function HomeFeed(): JSX.Element {
    const [sortMethod, setSortMethod] = useState<'time' | 'recommendation'>('time');
    const [isFriendFilter, setIsFriendFilter] = useState<boolean>(false);
    const [isTagFilter, setIsTagFilter] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAllPostsLoaded, setIsAllPostsLoaded] = useState<boolean>(false);
    const [startNumber, setStartNumber] = useState<number>(sortMethod === 'time' ? 0 : 5);
    const [initialTimestamp, setInitialTimestamp] = useState<number>(0);
    const postsPerLoad = 10;
    const homeFeedContent = useRef<HTMLDivElement>(null);
    // const [isFriendFilterClicked, setIsFriendFilterClicked] = useState<boolean>(false);
    // const [isTagFilterClicked, setIsTagFilterClicked] = useState<boolean>(false);
    // const [isSortMethodClicked, setIsSortMethodClicked] = useState<boolean>(false);
    const [count, dispatchCount] = useReducer<Reducer<number, any>>((state: number) => state + 1, 0);
    const [posts, setPosts] = useState<Array<OnePost>>([]);

    useEffect(() => {
        const currentSortMethod = getStringFrom('sortMethod', 'time', localStorage);
        if (currentSortMethod === 'time' || currentSortMethod === 'recommendation') {
            setSortMethod(currentSortMethod);
        }
        const currentIsFriendFilter = getJSONItemFrom('isFriendFilter', false, localStorage);
        if (typeof currentIsFriendFilter === 'boolean') {
            setIsFriendFilter(currentIsFriendFilter);
        }
        const currentIsTagFilter = getJSONItemFrom('isTagFilter', false, localStorage);
        if (typeof currentIsTagFilter === 'boolean') {
            setIsTagFilter(currentIsTagFilter);
        }
    }, []);

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
    }, [isFriendFilter, isTagFilter, startNumber, sortMethod, initialTimestamp]);

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
    }, [isAllPostsLoaded, loadMorePosts, isLoading]);

    useEffect(() => {
        window.addEventListener('scroll', scrollCallback);
        return () => window.removeEventListener('scroll', scrollCallback);
    }, [scrollCallback]);

    return (
        <>
            <div id="home-feed-content" ref={homeFeedContent}>
                {posts.map(post => (
                    <div className="post-card" key={post.id}>
                        <Post post={post} myProfile={false} />
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
            {/* <div id="home-feed-filters">
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="friend-filter" checked={isFriendFilter} onChange={event => {
                        if (!isFriendFilterClicked) {
                            setIsFriendFilterClicked(true);
                            setIsFriendFilter(event.target.checked);
                            dispatchCount(undefined);
                            localStorage.setItem('isFriendFilter', (!isFriendFilter).toString());
                        }
                    }} />
                    <label className="form-check-label" htmlFor="friend-filter">My friends only</label>
                </div>
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="tag-filter" checked={isTagFilter} onChange={event => {
                        if (!isTagFilterClicked) {
                            setIsTagFilterClicked(true);
                            setIsTagFilter(event.target.checked);
                            dispatchCount(undefined);
                            localStorage.setItem('isTagFilter', (!isTagFilter).toString());
                        }
                    }} />
                    <label className="form-check-label" htmlFor="tag-filter">My tags only</label>
                </div>
            </div>
            <div id="sort-method">
            <div className="form-check">
                <input className="form-check-input" type="radio" name="flexRadioDefault" id="sort-by-time" checked={sortMethod === 'time'} onChange={() => {
                    if (!isSortMethodClicked) {
                        setIsSortMethodClicked(true);
                        setSortMethod('time');
                        dispatchCount();
                        localStorage.setItem('sortMethod', 'time');
                    }
                }} />
                <label className="form-check-label" htmlFor="sort-by-time">Latest posts</label>
            </div>
            <div className="form-check">
                <input className="form-check-input" type="radio" name="flexRadioDefault" id="sort-by-recommendation" checked={sortMethod === 'recommendation'} onChange={() => {
                    if (!isSortMethodClicked) {
                        setIsSortMethodClicked(true);
                        setSortMethod('recommendation');
                        dispatchCount();
                        localStorage.setItem('sortMethod', 'recommendation');
                    }
                }} />
                <label className="form-check-label" htmlFor="sort-by-recommendation">Recommended posts</label>
                </div>
            </div> */}
            <FilterMessage count={count} />
        </>
    )
}