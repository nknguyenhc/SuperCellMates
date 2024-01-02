import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { Tag, Visibility } from "./one-post";
import { useDispatch } from "react-redux";
import { setLoading, setNotLoading } from "../../redux/loading-slice";
import { triggerErrorMessage } from "../../utils/locals";
import { postRequestContent } from "../../utils/request";

export default function EditPost({ postId, isShow, onHide }: {
    postId: string,
    isShow: boolean,
    onHide: () => void,
}): JSX.Element {
    const [title, setTitle] = useState<string>('');
    const [isTitleError, setIsTitleError] = useState<boolean | undefined>(undefined);
    const [content, setContent] = useState<string>('');
    const [isContentError, setIsContentError] = useState<boolean | undefined>(undefined);
    const [visibility, setVisibility] = useState<Visibility | 'Visibility'>('Visibility');
    const [tag, setTag] = useState<Tag | undefined>(undefined);
    const [imgs, setImgs] = useState<Array<File>>([]);
    const imagesInput = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [isDeleteMessageShown, setIsDeleteMessageShown] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isMessageShown, setIsMessageShown] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const getFeedbackClass = useCallback((isError: boolean | undefined): string => (
        isError
        ? " is-invalid"
        : isError === false
        ? " is-valid"
        : ""
    ), []);

    const handleAddImage = useCallback((e: ChangeEvent) => {
        const files = Array.from((e.target as HTMLInputElement).files as FileList);
        if (imgs.length + files.length > 9) {
            alert("9 images only please!");
        } else if (files.map(file => file.size / 1024 / 1024).every(size => size < 5)) {
            setImgs(imgs.concat(files));
        } else {
            alert("One of your images exceeds 5MB, please ensure all images are below 5MB.");
        }
        (e.target as HTMLInputElement).value = '';
    }, [imgs]);

    const removeImage = useCallback((index: number) => () => {
        setImgs(imgs => imgs.filter((_, i) => i !== index));
    }, []);

    const submitPost = useCallback(() => {
        let isError = false;
        if (content === '') {
            setErrorMessage("Content cannot be empty!");
            setIsContentError(true);
            isError = true;
        } else {
            setIsContentError(false);
        }
        if (title === '') {
            setErrorMessage("Title cannot be empty!");
            setIsTitleError(true);
            isError = true;
        } else {
            setIsTitleError(false);
        }
        if (isError) {
            return;
        }

        let visList: Array<string> = [];
        switch (visibility) {
            case "Public":
                visList = ["public"];
                break;
            case "People with same tag":
                visList = ["tag"];
                break;
            case "Friends":
                visList = ["friends"];
                break;
            case "Friends with same tag":
                visList = ["friends", "tag"];
                break;
        }

        if (isEditLoading || isDeleteLoading) {
            return;
        }
        setIsEditLoading(true);
        fetch('/post/post/edit/' + postId, postRequestContent({
            title: title,
            content: content,
            visibility: visList,
            imgs: imgs,
        })).then(res => {
            setIsEditLoading(false);
            if (res.status !== 200) {
                triggerErrorMessage();
                return;
            }
            setIsMessageShown(true);
            setMessage('Post edited!');
        });
    }, [title, content, visibility, imgs, postId, isEditLoading, isDeleteLoading]);

    const popDeleteMessage = useCallback(() => {
        setIsDeleteMessageShown(true);
        setTimeout(() => {
            // scroll modal
        }, 200);
    }, []);

    const deletePost = useCallback(() => {
        if (isEditLoading || isDeleteLoading) {
            return;
        }
        setIsDeleteLoading(true);
        fetch('/post/delete', postRequestContent({
            post_id: postId,
        })).then(res => {
            setIsDeleteLoading(false);
            if (res.status !== 200) {
                triggerErrorMessage();
                return;
            }
            setIsMessageShown(true);
            setMessage("Post deleted!");
        });
    }, [isEditLoading, isDeleteLoading, postId]);

    useEffect(() => {
        if (!isShow) {
            return;
        }
        dispatch(setLoading());
        fetch('/post/post/' + postId).then(res => {
            dispatch(setNotLoading());
            if (res.status !== 200) {
                triggerErrorMessage();
                return;
            }
            res.json().then(res => {
                setTitle(res.title);
                setContent(res.content);
                setTag(res.tag);
                if (res.public_visible) {
                    setVisibility("Public");
                } else {
                    if (res.friend_visible) {
                        if (res.tag_visible) {
                            setVisibility("Friends with same tag");
                        } else {
                            setVisibility("Friends");
                        }
                    } else {
                        setVisibility("People with same tag");
                    }
                }
                Promise.all((res.images as Array<string>).map(async (imgLink): Promise<File> => {
                    return fetch(imgLink).then(async (res): Promise<File> => {
                        if (res.status !== 200) {
                            throw new Error();
                        }
                        return res.blob().then(blob => {
                            const arr = imgLink.split('/');
                            const file = new File([blob], `${arr[arr.length - 1]}.${blob.type.split('/')[1]}`, {
                                type: blob.type,
                            });
                            return file;
                        });
                    });
                })).then(files => {
                    setImgs(files);
                }).catch(() => {
                    triggerErrorMessage();
                });
            });
        });
    }, [dispatch, isShow, postId]);

    return <Modal dialogClassName="edit-post-dialog" show={isShow} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Edit post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3">
                <label htmlFor="edit-post-title" className="form-label">Title <strong className="asterisk">*</strong></label>
                <input
                    type="text"
                    id="edit-post-title"
                    className={"form-control" + getFeedbackClass(isTitleError)}
                    value={title}
                    autoComplete="off"
                    onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                />
                <div className="invalid-feedback">Please enter a title</div>
            </div>
            <div className="mb-3">
                <label htmlFor="edit-post-content" className="form-label">Content <strong className="asterisk">*</strong></label>
                <textarea
                    id="edit-post-content"
                    rows={6}
                    className={"form-control" + getFeedbackClass(isContentError)}
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 1950))}
                />
                <div className="invalid-feedback">Please enter some content</div>
            </div>
            <div className="mb-3 visibility-section">
                <div className="visibility-indicator">
                    <img src="/static/media/eye-icon.png" alt="visibility" />
                    <strong className="asterisk">*</strong>
                </div>
                <div className="btn-group">
                    <button type="button" className="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        {visibility}
                    </button>
                    <ul className="dropdown-menu">
                        <li><div className="dropdown-item" onClick={() => setVisibility("Public")}>Public</div></li>
                        <li><div className="dropdown-item" onClick={() => setVisibility("People with same tag")}>People with same tag</div></li>
                        <li><div className="dropdown-item" onClick={() => setVisibility("Friends")}>Friends</div></li>
                        <li><div className="dropdown-item" onClick={() => setVisibility("Friends with same tag")}>Friends with same tag</div></li>
                    </ul>
                </div>
            </div>
            <div className="mt-3">
                {tag && <div className="tag-button btn btn-outline-info">
                    <img src={tag.icon} alt="" />
                    <div>{tag.name}</div>
                </div>}
            </div>
            <div className="mt-3">
                <div className="form-label">Images &#40;max file size: 5MB, limit: 9&#41;</div>
                <button className="post-choose-img-label add-image-label" onClick={() => imagesInput.current!.click()}>
                    <img src="/static/media/add-image-icon.png" alt="add media" />
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={imagesInput}
                    className="form-control"
                    multiple
                    onChange={handleAddImage}
                />
            </div>
            {imgs.length > 0 && <div className="mt-4">
                {imgs.map((imgFile, i) => (
                    <div className="post-image-preview-div">
                        <img src={URL.createObjectURL(imgFile)} alt={i.toString()} />
                        <div className="post-image-preview-close">
                            <button type="button" className="btn-close" aria-label="Close" onClick={removeImage(i)} />
                        </div>
                    </div>
                ))}
            </div>}
            <div className="mt-3">
                {imgs.length > 0 && <div className="btn btn-secondary" onClick={() => setImgs([])}>
                    Clear All Photos
                </div>}
            </div>
            <div className="post-edit-buttons mt-3">
                <div className="post-edit-submit">
                    <button className="btn btn-danger btn-sm" disabled={isDeleteLoading} onClick={popDeleteMessage}>Delete Post</button>
                    {isDeleteLoading && <span className="spinner-border text-warning" role="status" />}
                </div>
                <div className="post-edit-submit">
                    {isEditLoading && <span className="spinner-border text-warning" role="status" />}
                    <button className="btn btn-primary" onClick={submitPost} disabled={isEditLoading}>Edit Post</button>
                </div>
            </div>
            {isDeleteMessageShown && <div>
                <div className="mt-3 alert alert-danger" role="alert">Are you sure to delete this post? This action is irreversible.</div>
                <div className="post-edit-delete-buttons">
                    <button className="btn btn-success" onClick={deletePost}>Yes</button>
                    <button className="btn btn-danger" onClick={() => setIsDeleteMessageShown(false)}>No</button>
                </div>
            </div>}
            {errorMessage && <div className="mt-3 alert alert-danger" role="alert">{errorMessage}</div>}
            <Modal show={isMessageShown} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message}
                </Modal.Body>
            </Modal>
        </Modal.Body>
    </Modal>;
}
