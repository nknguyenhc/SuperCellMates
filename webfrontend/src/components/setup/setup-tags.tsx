import { useCallback, useEffect, useRef, useState } from "react";
import { triggerErrorMessage } from "../../utils/locals";
import { Tag } from "../posts/one-post";
import { postRequestContent } from "../../utils/request";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";


const SetupTags = () => {
  const [tags, setTags] = useState<Array<Tag>>([]);
  const [searchParam, setSearchParam] = useState("");
  const [searchResults, setSearchResults] = useState<Array<Tag>>([]);
  const [toBeSubmitted, setToBeSubmitted] = useState<Array<Tag>>([]);
  const [tagCountLimit, setTagCountLimit] = useState(0);
  const searchTagForm = useRef<HTMLFormElement>(null);
  const [showTagResult, setShowTagResult] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [canRemoveTag, setCanRemoveTag] = useState(false);
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [tagToBeRemoved, setTagToBeRemoved] = useState<Tag>();
  const [isAddTagMessageButton, setIsAddTagMessageButton] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false)
    

  useEffect(() => {
    fetch("/profile/obtain_tags").then((response) => {
      if (response.status !== 200) {
        triggerErrorMessage();
      } else {
        response.json().then((response) => {
          setTags(response.tags);
          setTagCountLimit(response.tag_count_limit);
        });
      }
    });

    fetch("/profile/can_remove_tag").then((response) => {
      if (response.status !== 200) {
        triggerErrorMessage();
        return;
      }
      response.text().then((text) => {
        setCanRemoveTag(text === "true");
      });
    });
  }, []);
   

  useEffect(() => {
    document.addEventListener("click", (event: any) => {
      if (searchTagForm.current?.contains(event.target)) {
        setShowTagResult(true);
      } else {
        setShowTagResult(false);
      }
    });
  }, []);

  const submitTags = useCallback(
    (event: React.SyntheticEvent<EventTarget>) => {
      event.preventDefault();
      if (!isSearching) {
        setIsSearching(true);
        fetch(
          "/profile/add_tags",
          postRequestContent({
            count: toBeSubmitted.length,
            tags: toBeSubmitted.map((tag) => tag.name),
          })
        ).then((response) => {
          setIsSearching(false);
          if (response.status !== 200) {
            triggerErrorMessage();
          } else {
            setTags([...tags].concat(toBeSubmitted));
            setToBeSubmitted([]);
            setShowAlert(false);
            setIsAddTagMessageButton(true);
            setMessage("Tags updated successfully!");
          }
        });
      }
    },
    [isSearching, tags, toBeSubmitted]
  );

  const searchTag = useCallback(
    (event: React.SyntheticEvent<EventTarget>) => {
      event.preventDefault();
      if (!isLoading) {
        setIsLoading(true);
        fetch("/profile/search_tags?tag=" + searchParam).then((response) => {
          setIsLoading(false);
          if (response.status !== 200) {
            triggerErrorMessage();
          } else {
            response.json().then((response) => {
              setSearchResults(
                response.tags.filter(
                  (tag: Tag) =>
                    toBeSubmitted.find(
                      (addedTag) => addedTag.name === tag.name
                    ) === undefined
                )
              );
              setSearchDone(true);
            });
          }
        });
      }
    },
    [searchParam, toBeSubmitted, isLoading]
  );

  const addNewTag = useCallback(
    (index: number) => {
      if (tags.length + toBeSubmitted.length < tagCountLimit) {
        setSearchResults(searchResults.filter((_, i) => i !== index));
        setToBeSubmitted([...toBeSubmitted, searchResults[index]]);
      } else {
        setIsAddTagMessageButton(true);
        setMessage("You have reached your maximum tag count limit.");
      }
    },
    [searchResults, tagCountLimit, tags.length, toBeSubmitted]
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      let currTimeout:any = null;
      setSearchParam(event.target.value);
      clearTimeout(currTimeout);
      currTimeout = setTimeout(() => {
        setIsSearching(false)
        searchTag(event)
      }, 800);

     
    },
    [searchTag]
  );

  const removeNewTag = useCallback(
    (index: number) => {
      setToBeSubmitted(toBeSubmitted.filter((_, i) => i !== index));
    },
    [toBeSubmitted]
  );

  const removeTag = useCallback(() => {
    if (!isLoading) {
      setIsLoading(true);
      fetch(
        "/profile/remove_tag",
        postRequestContent({
          tag: tagToBeRemoved?.name,
        })
      ).then((response) => {
        setIsLoading(false);
        if (response.status !== 200) {
          triggerErrorMessage();
          return;
        }
        setTags(tags.filter((tag) => tag !== tagToBeRemoved));
        setShowRemoveAlert(false);
        setCanRemoveTag(false);
      });
    }
  }, [tagToBeRemoved, tags, isLoading]);

  const canRemoveTagClicked = useCallback((tag: Tag) => {
    setTagToBeRemoved(tag);
    setShowRemoveAlert(true);
    setShowAlert(false);
  }, []);

  const updateTagsClicked = useCallback(() => {
    setShowAlert(true);
    setShowRemoveAlert(false);
  }, []);

  return (
    <div className="setup-tags">
      <div className="setup-tags-content">
        <div className="setup-tags-section p-3">
          <div className="setup-tags-section-title py-3">Your current tags</div>
          <div className="setup-tags-section-body pt-3">
            {tags.map((tag: Tag, index: number) => (
              <div key={index} className="old-tag-div">
                <div className="tag-button btn btn-outline-info">
                  <img src={tag.icon} alt="tag-icon" />
                  <div>{tag.name}</div>
                </div>
                {canRemoveTag && (
                  <button
                    type="button"
                    className="btn-close can-remove-tag-btn"
                    aria-label="Close"
                    onClick={() => {
                      canRemoveTagClicked(tag);
                    }}
                  ></button>
                )}
              </div>
            ))}
          </div>
          <div className="ps-4 pt-3">
            <button
              className="btn btn-success"
              value="Add Tags"
              onClick={updateTagsClicked}
            >
              Update Tags
            </button>
          </div>
        </div>
        <div className="setup-tags-section p-3">
          <div className="setup-tags-section-title py-3">New Tags</div>
          <div className="setup-tags-section-body">
            {toBeSubmitted.map((tag, index) => (
              <div key={index} className="new-tag-div">
                <div className="tag-button btn btn-outline-info">
                  <img src={tag.icon} alt="tag-icon" />
                  <div>{tag.name}</div>
                </div>
                <button
                  type="button"
                  className="btn-close remove-new-tag-btn"
                  aria-label="Close"
                  onClick={() => removeNewTag(index)}
                />
              </div>
            ))}
          </div>
          <div className="setup-tags-section-body pt-3">
            <form
              id="search-tag-form"
              onSubmit={searchTag}
              ref={searchTagForm}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Search Tag ..."
                onChange={handleChange}
              />
              <input
                type="submit"
                className="btn btn-outline-primary"
                value="Search"
              ></input>
            </form>
            <div id="search-tag-result">
              <div
                id="search-tag-result-window"
                className="p-2"
                style={{ display: showTagResult ? "" : "none" }}
              >
                {searchResults.length === 0 ? (
                  <div className="text-body-tertiary">
                    {searchDone
                      ? "No result matches your query"
                      : "Type something and hit enter"}
                  </div>
                ) : (
                  searchResults.map((tag, index) => (
                    <div
                      key={index}
                      className="tag-button btn btn-outline-info"
                      onClick={() => addNewTag(index)}
                    >
                      <img src={tag.icon} alt="tag-icon" />
                      <div>{tag.name}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="ms-4 action-alert alert alert-info mt-3" role="alert">
          <div>
            Your account can only have 4 tags, and you will not be able to
            change tags for 1 week if you delete one of your tags. Are you sure
            to proceed?
          </div>
          <div className="setup-tags-confirmation-buttons mt-3">
            <button className="btn btn-primary" onClick={submitTags}>
              Yes
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowAlert(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
      {showRemoveAlert && (
        <div className="ms-4 action-alert alert alert-danger mt-3" role="alert">
          <div>
            You are attempting to delete tag: {tagToBeRemoved?.name}. You will
            not be able to delete another tag within the next one week upon
            deleting a tag. Are you sure to proceed?
          </div>
          <div className="setup-tags-confirmation-buttons mt-3">
            <button className="btn btn-primary" onClick={removeTag}>
              Yes
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowRemoveAlert(false)}
            >
              No
            </button>
          </div>
        </div>
      )}

      <Modal
        show={isAddTagMessageButton}
        onHide={() => setIsAddTagMessageButton(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsAddTagMessageButton(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SetupTags;
