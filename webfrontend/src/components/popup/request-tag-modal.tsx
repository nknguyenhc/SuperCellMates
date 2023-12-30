import { SyntheticEvent, useCallback, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { triggerErrorMessage } from "../../utils/locals";
import { postRequestContent } from "../../utils/request";


const RequestTagModal: React.FC = () => {
  const [tag, setTag] = useState<string>("");
  const tagInput = useRef<HTMLInputElement>(null);
  const [errMessage, setErrMessage] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageToBeSubmitted, setImageToBeSubmitted] = useState<File>();
  const imageInput = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState<string>("");
  const [attach, setAttach] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tagRequestMessageContent, setTagRequestMessageContent] =
    useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);

  const handleAddImage = useCallback((event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    setImagePreview(URL.createObjectURL(file));
    setImageToBeSubmitted(file);
  }, []);

  const handleClose = useCallback(() => {
    document.querySelector<HTMLElement>("#request-tag")!.style.display = "none";
    setErrMessage("");
  }, []);


  const submitForm = useCallback(
    (event: React.SyntheticEvent<EventTarget>) => {
      event.preventDefault();
      if (tag === "") {
        setErrMessage("Tag cannot be empty");
        tagInput.current?.classList.add("is-invalid");
        return;
      } else {
        tagInput.current?.classList.remove("is-invalid");
      }
      setErrMessage("");
      const requestBody: { [k: string]: any } = {
        tag: tag,
        description: description,
        attach: attach,
      };
      if (imageToBeSubmitted !== undefined) {
        requestBody.img = imageToBeSubmitted;
      }
      if (!isLoading) {
        setIsLoading(true);
        fetch("/add_tag_request", postRequestContent(requestBody)).then(
          async (response) => {
            setIsLoading(false);
            if (response.status !== 200) {
              triggerErrorMessage();
            } else {
              setTag("");
              setDescription("");
              setAttach(false);
              setImagePreview("");
              setImageToBeSubmitted(undefined);
              const text = await response.text();
              if (text === "tag already present/requested") {
                setTagRequestMessageContent("Tag is already present/requested");
              } else {
                setTagRequestMessageContent(
                  "Your request is sent, our admin will review your request."
                );
              }
              setShowMessage(true);
            }
          }
        );
      }
    },
    [attach, description, imageToBeSubmitted, isLoading, tag]
  );

  const handleCloseMessage = useCallback(() => {
    setShowMessage(false)
    setTagRequestMessageContent("");
    if (
      tagRequestMessageContent ===
      "Your request is sent, our admin will review your request."
    ) {
      handleClose();
    }
  }, [handleClose, tagRequestMessageContent, setTagRequestMessageContent]);

  return (
    <>
      <div
        className="request-tag-modal modal show"
        id="request-tag"
        style={{ display: "none" }}
      >
        <Modal.Dialog>
          <Modal.Header closeButton onHide={handleClose}>
            <Modal.Title>Request Tag</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={submitForm} className="request-tag-form">
              <div>
                <label className="form-label">
                  Tag name <strong className="asterisk">*</strong>
                </label>
                <input
                  ref={tagInput}
                  type="text"
                  className="form-control"
                  value={tag}
                  onChange={(event) => {
                    setTag(event.target.value.slice(0, 25));
                  }}
                />
              </div>

              <div id="tag-request-icon-preview" className="mt-3">
                <div>Icon:</div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="request-tag-icon"
                    style={{ height: "25px" }}
                  />
                )}
              </div>
              <div className="mt-3">
                <button
                  className="add-image-label"
                  onClick={(e) => {
                    e.preventDefault();
                    imageInput.current!.click();
                  }}
                >
                  <img src="/static/media/add-image-icon.png" alt="add-icon" />
                </button>
                <input
                  ref={imageInput}
                  type="file"
                  className="form-control img-input"
                  accept="image/*"
                  onChange={handleAddImage}
                />
              </div>
              <div className="mt-3">
                <label htmlFor="tag-request-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="tag-request-description"
                  className="form-control"
                  placeholder="Description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value.slice(0, 200));
                  }}
                />
              </div>
              <div className="form-check mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={attach}
                  id="attach-tag-option"
                  onChange={(event) => setAttach(event.target.checked)}
                />
                <label className="form-check-label" htmlFor="attach-tag-option">
                  Attach this tag to me once approved
                </label>
              </div>
              <div className="mt-3" id="tag-request-submit-div">
                <button
                  type="submit"
                  className="btn btn-primary me-3"
                  disabled={isLoading}
                >
                  Request
                </button>
                <span
                  className="spinner-border text-warning"
                  style={{ display: isLoading ? "" : "none" }}
                />
              </div>
              <div
                className="alert alert-danger mt-3"
                role="alert"
                style={{
                  display: errMessage === "" ? "none" : "block",
                }}
              >
                {errMessage}
              </div>
            </Form>

            <Modal
              show={showMessage}
              onHide={handleCloseMessage}
              backdrop="static"
              keyboard={false}
            >
              <Modal.Header closeButton>
                <Modal.Title>Tag request status</Modal.Title>
              </Modal.Header>
              <Modal.Body>{tagRequestMessageContent}</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseMessage}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </Modal.Body>
        </Modal.Dialog>
      </div>
    </>
  );
};

export default RequestTagModal;
