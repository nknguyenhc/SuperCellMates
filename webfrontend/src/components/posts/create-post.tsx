import { useState, useRef, useEffect, FormEvent, useCallback, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { triggerErrorMessage } from '../../utils/locals';
import { Visibility, Tag } from './one-post';
import { postRequestContent } from '../../utils/request';
import { Link } from 'react-router-dom';

export default function CreatePost(): JSX.Element {
    const [title, setTitle] = useState<string>('');
    const [isTitleError, setIsTitleError] = useState<boolean | null>(null);
    const [content, setContent] = useState<string>('');
    const [isContentError, setIsContentError] = useState<boolean | null>(null);
    const [tagSelected, setTagSelected] = useState<Tag | null>(null);
    const [visibility, setVisibility] = useState<Visibility | 'Visibility'>('Visibility');
    const [isVisibilityError, setIsVisibilityError] = useState<boolean | null>(null);
    const [userTags, setUserTags] = useState<Array<Tag>>([]);
    const [isTagSelectError, setIsTagSelectError] = useState<boolean>(false);
    const postCreateButton = useRef<HTMLButtonElement>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const imagesInput = useRef<HTMLInputElement>(null);
    const [imgs, setImgs] = useState<Array<File>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const postCreateModal = useRef<HTMLDivElement>(null);
    const username = useSelector((state: RootState) => state.auth.username);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (!postCreateModal.current!.classList.contains('show')) {
                window.location.reload();
            }
        });
        observer.observe(postCreateModal.current!, { attributes: true });
    }, []);

    useEffect(() => {
        if (username !== '') {
            fetch('/profile/user_tags/' + username)
                .then(response => {
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        response.json().then(response => setUserTags(response.tags as Array<Tag>));
                    }
                });
        }
    }, [username]);

    const removeImage = useCallback<(index: number) => void>((index: number) => {
        setImgs(imgs => imgs.filter((_, i) => i !== index));
    }, []);

    const clearInput = useCallback(() => {
        setTitle('');
        setContent('');
        setVisibility('Visibility');
        setTagSelected(null);
        setImgs([]);
        imagesInput.current!.files = null;
    }, []);

    const submitPost = useCallback<(event: FormEvent) => void>((event: FormEvent): void => {
        event.preventDefault();

        let hasError: boolean = false;
        if (visibility === "Visibility") {
            setErrorMessage("Please choose a visibility setting");
            setIsVisibilityError(true);
            hasError = true;
        } else {
            setIsVisibilityError(false);
        }
        if (tagSelected === null) {
            setErrorMessage("You must choose a tag to associate with this post");
            setIsTagSelectError(true);
            hasError = true;
        } else {
            setIsTagSelectError(false);
        }
        if (content === '') {
            setErrorMessage("Content cannot be empty");
            setIsContentError(true);
            hasError = true;
        } else {
            setIsContentError(false);
        }
        if (title === '') {
            setErrorMessage("Title cannot be empty");
            setIsTitleError(true);
            hasError = true;
        } else {
            setIsTitleError(false);
        }
        
        if (hasError) {
            return;
        }
        setErrorMessage('');

        let visList;
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

        if (!isLoading) {
            setIsLoading(true);
            fetch('/post/create_post', postRequestContent({
                title: title,
                content: content,
                tag: tagSelected!.name,
                visibility: visList,
                imgs: imgs
            }))
                .then(response => {
                    setIsLoading(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                        return;
                    }
                    postCreateButton.current!.click();
                    setErrorMessage('');
                    clearInput();
                    setIsTitleError(null);
                    setIsContentError(null);
                    setIsVisibilityError(null);
                    setIsTagSelectError(false);
                });
        }
    }, [title, content, tagSelected, visibility, imgs, isLoading, clearInput]);

    return (
        <form onSubmit={event => event.preventDefault()} className="needs-validation" noValidate>
            <div className="mb-3">
                <label htmlFor="post-title" className="form-label">Title <strong className="asterisk">*</strong></label>
                <input 
                    type="text" 
                    id="post-title" 
                    className={"form-control" + (
                        isTitleError 
                        ? " is-invalid" 
                        : isTitleError === false
                        ? " is-valid"
                        : ""
                    )}
                    value={title} 
                    autoComplete="off" 
                    onChange={event => {
                        setTitle(event.target.value.slice(0, 100));
                    }} 
                />
                <div className="invalid-feedback">Please enter a title</div>
            </div>
            <div className="mb-3">
                <label htmlFor="post-content" className="form-label">Content <strong className="asterisk">*</strong></label>
                <textarea 
                    id="post-content"
                    rows={8}
                    className={"form-control" + (
                        isContentError
                        ? " is-invalid"
                        : isContentError === false
                        ? " is-valid"
                        : ""
                    )}
                    value={content}
                    onChange={event => {
                        setContent(event.target.value.slice(0, 1950));
                    }}
                />
                <div className="invalid-feedback">Please enter some content</div>
            </div>
            <div className="mb-3 visibility-section">
                <div className="visibility-indicator">
                    <img src="/static/media/eye-icon.png" alt="visibility" />
                    <strong className="asterisk">*</strong>
                </div>
                <div 
                    className={"btn-group" + (
                        isVisibilityError
                        ? " is-invalid"
                        : isVisibilityError === false
                        ? " is-valid"
                        : ""
                    )}
                >
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
                <div className="invalid-feedback">Please select visibility</div>
            </div>
            <div className="mt-3">
                <div id="post-choose-tag" className={isTagSelectError ? "is-invalid" : ""}>
                    <div>Tag <strong className="asterisk">*</strong></div>
                    {
                        userTags.length === 0
                        ? <div className="text-danger">
                            <p>Your profile needs at least one tag to post! Setup your tags <Link to="/profile/setup">here</Link></p>
                            <p>More about our tag system <Link to="/about">here</Link></p>
                        </div>
                        : userTags.map((tag, tagIndex) => (
                            <Fragment key={tagIndex}>
                                <input 
                                    type="radio" 
                                    className="btn-check" 
                                    name="options" 
                                    id={"post-tag-" + tag.name} 
                                    checked={tag === tagSelected} 
                                    autoComplete="off" 
                                />
                                <label 
                                    className="tag-button btn btn-outline-info" 
                                    htmlFor={"post-tag-" + tag.name} 
                                    onClick={() => {
                                        setTagSelected(tag);
                                    }}
                                >
                                    <img src={tag.icon} alt={tag.name} />
                                    <div>{tag.name}</div>
                                </label>
                            </Fragment>
                        ))
                    }
                </div>
                <div className="invalid-feedback">Please choose a tag to post</div>
            </div>
            <div className="mt-3">
                <div>Images &#40;max file size: 5MB, limit: 9&#41;</div>
                <button className="post-choose-img-label add-image-label" onClick={() => imagesInput.current!.click()}>
                    <img src="/static/media/add-image-icon.png" alt={"add media"} />
                </button>
                <div>
                    <input ref={imagesInput} className="form-control img-input" accept="image/*" type="file" multiple onChange={() => {
                        const files: Array<File> = Array.from(imagesInput.current!.files as FileList);
                        if (imgs.length + files.length > 9) {
                            alert("9 images only please!");
                        } else if (files.map(file => file.size / 1024 / 1024).reduce((prev, curr) => prev && curr < 5, true)) {
                            setImgs(imgs.concat(files));
                        } else {
                            alert("One of your images exceeds 5MB, please ensure all images are below 5MB.");
                        }
                    }} />
                </div>
            </div>
            <div className="mt-4 post-images-preview">
                {
                    imgs.map((imgFile, i) => ((
                        <div className="post-image-preview-div" key={i}>
                            <img src={URL.createObjectURL(imgFile)} alt={i.toString()} />
                            <div className="post-image-preview-close">
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => removeImage(i)} />
                            </div>
                        </div>
                    )))
                }
            </div>
            <div className="mt-3" id="post-delete-all">
                {
                    imgs.length === 0
                    ? ''
                    : <div id="post-delete-all-button" className="btn btn-secondary" onClick={() => setImgs([])}>Clear All Photos</div>
                }
            </div>
            <div className="mt-3" id="post-submit-button">
                <span className="spinner-border text-warning" role="status" style={{display: isLoading ? 'block' : 'none'}} />
                <button type="button" className="btn btn-primary" onClick={submitPost} disabled={isLoading}>Post</button>
            </div>
            {errorMessage !== '' && <div className="mt-3 alert alert-danger" role="alert">{errorMessage}</div>}
            <button id="post-create-button" style={{display: 'none'}} ref={postCreateButton} type="button" data-bs-toggle="modal" data-bs-target="#post-create-message"></button>
            <div ref={postCreateModal} className="modal fade" id="post-create-message" tabIndex={-1} aria-labelledby="post-create-label" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="post-create-label">Message</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">Post created!</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}