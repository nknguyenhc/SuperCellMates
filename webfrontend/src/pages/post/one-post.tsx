import { useEffect, useState } from "react";
import Post, { OnePost } from "../../components/posts/one-post";
import { useSearchParams } from "react-router-dom";

export default function OnePostPage(): JSX.Element {
    const [post, setPost] = useState<OnePost | undefined | null>(undefined);
    const [params, ] = useSearchParams();

    useEffect(() => {
        const postId = params.get("id");
        if (!postId) {
            setPost(null);
            return;
        }

        fetch('/post/post/' + postId)
            .then((res: Response) => {
                if (res.status !== 200) {
                    setPost(null);
                    return;
                }
                res.json().then(post => {
                    post.time_posted *= 1000;
                    setPost(post);
                }).catch(() => setPost(null));
            });
    }, [params]);

    return <div className="one-post-page">
        {post
        ? <Post post={post} />
        : post === undefined
        ? <span className="spinner-border text-info" role="status" />
        : <div>An error has occurred.</div>}
    </div>;
}
