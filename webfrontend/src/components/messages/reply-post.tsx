import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { clearReply } from "../../redux/post-slice";
import { Link } from "react-router-dom";

export default function ReplyPost(): JSX.Element {
    const targetPost = useSelector((state: RootState) => state.post.reply);
    const dispatch = useDispatch();

    const removePostReference = useCallback(() => {
        dispatch(clearReply());
    }, [dispatch]);

    if (!targetPost) {
        return <div></div>;
    }

    return <div className="chatlog-target-post">
        <Link to={targetPost.creator.link} className="chatlog-target-post-creator">
            <img src={targetPost.creator.img} alt="creator" />
        </Link>
        <Link to={'/post/display?id=' + targetPost.id} className="chatlog-target-post-text">
            <h6 className="chatlog-target-post-title">{targetPost.title.length > 50 ? targetPost.title.slice(0, 40) + ' ...' : targetPost.title}</h6>
            <div className="chatlog-target-post-content">{targetPost.content.length > 60 ? targetPost.content.slice(0, 50) + ' ...' : targetPost.content}</div>
        </Link>
        <div className="btn-close" onClick={removePostReference}></div>
    </div>;
}
