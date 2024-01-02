import { useCallback, useEffect, useMemo, useState } from "react";
import { useProfileContext } from "../../pages/profile/profile-context";
import { triggerErrorMessage } from "../../utils/locals";
import Post, { OnePost } from "../posts/one-post";

export default function ProfileContent(): JSX.Element {
    const { username, tagChosen } = useProfileContext();
    const [tagname, setTagname] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentTimestamp, setCurrentTimestamp] = useState<number | undefined>(undefined);
    const oneDayTime = useMemo(() => 24 * 3600, []);
    const [isAllPostsLoaded, setIsAllPostsLoaded] = useState<boolean>(false);
    const [posts, setPosts] = useState<Array<OnePost>>([]);

    const loadMorePosts = useCallback(() => {
        if (isLoading || isAllPostsLoaded || !username) {
            return;
        }
        setIsLoading(true);
        const timestampQuery: string = currentTimestamp !== undefined ? `start=${currentTimestamp - oneDayTime}&end=${currentTimestamp}` : '';
        const tagQuery: string = tagname ? `&tag=${tagname}` : '';
        fetch(`/post/posts/${username}?${timestampQuery}${tagQuery}`)
            .then(res => {
                setIsLoading(false);
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                return res.json().then(res => {
                    if (res.next !== 0) {
                        setCurrentTimestamp(res.next);
                        setIsAllPostsLoaded(false);
                    } else {
                        setIsAllPostsLoaded(true);
                    }
                    setPosts(posts => [
                        ...posts,
                        ...res.posts.map((post: OnePost) => ({
                            ...post,
                            time_posted: post.time_posted * 1000,
                        })),
                    ]);
                });
            });
    }, [isLoading, isAllPostsLoaded, username, currentTimestamp, oneDayTime, tagname]);

    const loadPostsInInterval = useCallback(() => {
        if (document.body.offsetHeight - window.innerHeight - window.scrollY < 200) {
            loadMorePosts();
        }
    }, [loadMorePosts]);

    useEffect(() => {
        setTagname(tagChosen);
        setIsAllPostsLoaded(false);
        setCurrentTimestamp(undefined);
        setPosts([]);
    }, [tagChosen]);

    useEffect(() => {
        const interval = setInterval(loadPostsInInterval, 500);
        return () => clearInterval(interval);
    }, [loadPostsInInterval]);

    return <div className="profile-posts py-4">
        {posts.map(post => (
            <div className="profile-post" key={post.id}>
                <Post post={post} />
            </div>
        ))}
        <span className="spinner-border text-info" id="post-loader" role="status" style={{display: isLoading ? '' : 'none'}} />
    </div>;
}
