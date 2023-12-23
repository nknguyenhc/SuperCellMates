import { useCallback, useEffect, useState } from "react";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { triggerErrorMessage } from "../../utils/locals";

import Post, { Tag } from "../posts/one-post";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

const ProfileFeed = () => {
  const user = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<any>();

  const [tags, setTags] = useState<Array<Tag>>([]);
  const [filterStatus, setFilterStatus] = useState<string>("Tags Filter");
  const [filteredPosts, setFilteredPosts] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      fetch("/profile/obtain_tags").then((response) => {
        setIsLoading(false);
        if (response.status !== 200) {
          triggerErrorMessage();
        } else {
          response.json().then((response) => {
            setTags(response.tags);
          });
        }
      });
    }
  }, [tags, isLoading]);

  const getUserPosts = useCallback(() => {
    if (user.username !== "") {
      if (!isLoading) {
        setIsLoading(true)
        fetch(`/post/posts/${user.username}`).then((res) => {
          setIsLoading(false)
          if (res.status !== 200) {
            triggerErrorMessage();
            return;
          }
          res.json().then((response) => {
            setPosts(response.posts);
          });
        });
      }
    }
  }, [user.username, isLoading]);

  useEffect(() => {
    getUserPosts();
  }, [getUserPosts]);

  const filterTags = useCallback(
    (option: string) => {
      setFilterStatus(option);
      if (option === "All Tags") {
        setFilteredPosts(posts);
      } else {
        setFilteredPosts(posts.filter((post: any) => post.tag.name === option));
      }
    },
    [posts]
  );

  return (
    <div className="profile-posts-container">
      <DropdownButton
        className="tags-filter-menu"
        title={filterStatus}
        variant="warning"
      >
        <Dropdown.Item
          onClick={() => filterTags("All Tags")}
          style={
            filterStatus === "All Tags"
              ? { backgroundColor: "#FFD700" }
              : { backgroundColor: "white" }
          }
        >
          All Tags
        </Dropdown.Item>
        {tags.map((tag: Tag, index: number) => (
          <Dropdown.Item
            key={index}
            onClick={() => filterTags(`${tag.name}`)}
            style={
              filterStatus === `${tag.name}`
                ? { backgroundColor: "#FFD700" }
                : { backgroundColor: "white" }
            }
          >
            <span>
              <img
                style={{ height: "30px", marginRight: "10px" }}
                src={tag.icon}
                alt="tag-icon"
              />
            </span>
            {tag.name}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      <div className="profile-posts-details">
        {filteredPosts?.map((post: any, index: number) => (
          <div key={index} className="profile-one-post">
            <Post post={post} myProfile={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileFeed;
