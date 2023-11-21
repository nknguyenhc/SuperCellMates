import { useCallback, useRef, useState } from "react";
import { postRequestContent } from "../../utils/request";
import { triggerErrorMessage } from "../../utils/locals";

const AddTags = () => {
  const addTagAdminButton = useRef<HTMLButtonElement>(null);
    const [tagName, setTagName] = useState<string>('');
    const [emptyErrorMessageTriggered, setEmptyErrorMessageTriggered] = useState(false);
    const [adminMessage, setAdminMessage] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imgFile, setImgFile] = useState(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const addTag = useCallback(() => {
        if (tagName === '') {
            setEmptyErrorMessageTriggered(true);
            return;
        }

        const requestBody:{[k: string]: any} = {
            tag: tagName
        }
        if (imgFile !== null) {
            requestBody.img = imgFile;
        }
        if (!isLoading) {
            setIsLoading(true);
            fetch('/new_tag_admin', postRequestContent(requestBody))
                .then(response => {
                    setIsLoading(false);
                    if (response.status === 200) {
                        response.text().then(text => setAdminMessage(text));
                        addTagAdminButton.current?.click();
                        setTagName('');
                        setImgFile(null);
                        setImagePreview('');
                        fileInput.current!.files = null;
                        setEmptyErrorMessageTriggered(false);
                    } else {
                        triggerErrorMessage();
                    }
                });
        }
    }, [imgFile, isLoading, tagName]);

    const iconUpload = useCallback((event: React.ChangeEvent<any>) => {
        setImagePreview(URL.createObjectURL(event.target.files[0]));
        setImgFile(event.target!.files[0]);
    }, []);

    return (
       <>
            <form onSubmit={event => event.preventDefault()}>
                <div className="m-3">
                    <label htmlFor="tag-input" className="form-label">Tag</label>
                    <input type="text" className="form-control" id="tag-input-admin" autoComplete="off" value={tagName} onChange={event => setTagName(event.target.value.slice(0, 25))} />
                </div>
                <div className="m-3 mb-0" id="new-tag-admin-icon">
                    <div>Icon:</div>
                    {imagePreview && <img src={imagePreview} style={{height: '25px'}} alt="request-tag-icon-preview" />}
                </div>
                <div className="ms-3">
                    <input ref={fileInput} id="tag-icon-file" type="file" accept="image/*" className="form-control m-3 img-input" onChange={iconUpload} />
                    <button onClick={() => fileInput.current!.click()} className="add-image-label">
                        <img src="/static/media/add-image-icon.png" alt="add-img-icon" />
                    </button>
                </div>
                <div className="m-3">
                    <input type="submit" className="btn btn-primary" value="Add Tag" onClick={addTag} />
                </div>
                <div className="m-3 alert alert-danger" role="alert" style={{display: emptyErrorMessageTriggered ? "block" : "none"}}>Tag cannot be empty!</div>
            </form>
            <button ref={addTagAdminButton} style={{display: 'none'}} id="add-tag-admin-message-button" type="button" data-bs-toggle="modal" data-bs-target="#add-tag-admin-message"></button>
            <div className="modal fade" id="add-tag-admin-message"  aria-labelledby="add-tag-admin-label" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="add-tag-admin-label">Message</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">{adminMessage}</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddTags
