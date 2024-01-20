import { useCallback, useEffect, useRef, useState } from "react";
import { postRequestContent } from "../../utils/request";
import { triggerErrorMessage } from "../../utils/locals";

interface tagProperties {
  name: string;
  icon: string;
}

const ChangeTagIcon = () => {
  const [tags, setTags] = useState<Array<tagProperties>>([]);
  const [selected, setSelected] = useState<number>(-1);
  const fileInput = useRef<HTMLInputElement>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const changeIconAdminButton = useRef<HTMLButtonElement>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isBg, setIsBg] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  const refreshTags = useCallback(() => {
    fetch("/obtain_tags")
      .then((response) => response.json())
      .then((response) => {
        setTags(response.tags);
      });
  }, []);

  useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  const updateIcon = useCallback(() => {
    if (!imgFile) {
      setIsError(true);
      return;
    }
    setIsError(false);
    fetch(
      "/change_tag_icon",
      postRequestContent({
        name: tags[selected].name,
        icon: imgFile,
      })
    ).then((response) => {
      if (response.status !== 200) {
        triggerErrorMessage();
        return;
      } else {
        changeIconAdminButton.current!.click();
        refreshTags();
        setSelected(-1);
      }
    });
  }, [imgFile, refreshTags, selected, tags]);

  return (
    <div className="change-tag-icon-container">
      <div id="change-tag-icon-window">
        {tags.map((tag, i) => (
          <div
            className={
              "tag-button btn " +
              (i === selected ? "btn-info" : "btn-outline-info")
            }
            onClick={() => {
              setSelected(i);
              setImgFile(null);
              setScrollY(window.scrollY);
            }}
          >
            {tag.name}
          </div>
        ))}
      </div>
      {selected !== -1 && (
        <div
          id="icon-display-window"
          className={"border border-info" + (isBg ? " bg-info" : "")}
          style={{ marginTop: `${scrollY}px` }}
        >
          <img src={tags[selected].icon} alt="tag-icon" />
          <div className="form-check">
            <input
              type="checkbox"
              id="check-bg"
              className="form-check-input"
              onChange={(event) => setIsBg(event.target.checked)}
            />
            <label htmlFor="check-bg" className="form-check-label">
              Test background
            </label>
          </div>
          <div>
            New Icon:
            <input
              ref={fileInput}
              type="file"
              className="img-input"
              accept="image/*"
              onChange={(event: React.ChangeEvent<any>) => {
                setImgFile(event.target!.files[0]);
              }}
            />
            <button
              onClick={() => fileInput.current?.click()}
              className="add-image-label"
            >
              <img src="/static/media/add-image-icon.png" alt="add-img-icon" />
            </button>
          </div>
          {imgFile && (
            <img
              src={URL.createObjectURL(imgFile)}
              style={{ height: "50px", width: "50px" }}
              alt="tag-icon"
            />
          )}
          <button className="btn btn-success" onClick={updateIcon}>
            Update Icon
          </button>
          {isError && (
            <div className="alert alert-danger" role="alert">
              You have not set the new icon
            </div>
          )}
          <button
            ref={changeIconAdminButton}
            style={{ display: "none" }}
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#change-icon-admin-message"
          ></button>
          <div
            className="modal fade"
            id="change-icon-admin-message"
            aria-labelledby="change-icon-admin-label"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="change-icon-admin-label">
                    Message
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">Icon changed.</div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeTagIcon;
