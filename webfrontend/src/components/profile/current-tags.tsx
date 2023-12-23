import { useEffect, useState } from "react";
import { triggerErrorMessage } from "../../utils/locals";
import { Tag } from "../posts/one-post";

const CurrentTags: React.FC = () => {
  const [tags, setTags] = useState<Array<Tag>>([]);

  useEffect(() => {
    fetch("/profile/obtain_tags").then((response) => {
      if (response.status !== 200) {
        triggerErrorMessage();
      } else {
        response.json().then((response) => {
          setTags(response.tags);
        });
      }
    });
  }, [tags]);

  return (
    <div className="current-tag-container">
      <div className="tag-title">Your Current Tags</div>
      <div className="tag-list">
        {tags.map((tag, index) => (
          <div key={index} className="tag-button btn btn-outline-info">
            <img src={tag.icon} alt="tag-icon" />
            <div>{tag.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentTags;
