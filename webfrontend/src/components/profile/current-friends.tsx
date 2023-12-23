import { useCallback, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { postRequestContent } from "../../utils/request";
import { triggerErrorMessage } from "../../utils/locals";
import { Link } from "react-router-dom";
export type FriendType = {
  name: string;
  username: string;
  link: string;
  img: string;
};
interface Props {
  name: string;
  link: string;
  setCurrentFriends: React.Dispatch<React.SetStateAction<FriendType[]>>;
}

const CurrentFriends: React.FC<Props> = ({ name, link, setCurrentFriends }) => {
  const [chatId, setChatId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getChatId = useCallback(() => {
    if (!isLoading) {
      setIsLoading(true);
      fetch(`/messages/get_chat_id?username=${name}`).then((res) => {
        setIsLoading(false);
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        res.text().then((res) => {
          setChatId(res);
        });
      });
    }
  }, [name, isLoading]);
  useEffect(() => {
    getChatId();
  }, [getChatId]);
  const deleteFriend = useCallback(
    (name: string) => {
      if (!isLoading) {
        setIsLoading(true);
        fetch(
          "/user/delete_friend",
          postRequestContent({
            username: name,
          })
        ).then((res) => {
          setIsLoading(false);
          if (res.status !== 200) {
            triggerErrorMessage();
            return;
          }
          setCurrentFriends((prev) => {
            return prev.filter((person) => person.name !== name);
          });
        });
      }
    },
    [setCurrentFriends, isLoading]
  );
  return (
    <div className="current-friend-info">
      <Link to={link} style={{ textDecoration: "none", color: "black" }}>
        <div className="thumbnail-current-friend">
          <img
            src="/default_profile_pic.jpg"
            className="thumbnail-current-friend-picture"
            alt="default_profile_picture"
          />
          <p className="friend-name"> {name}</p>
        </div>
      </Link>
      <Button
        className="delete-btn"
        variant="danger"
        onClick={() => deleteFriend(name)}
      >
        {" "}
        Unfriend
      </Button>
      <Link to={`/messages/?chatid=${chatId}`}>
        <Button
          className="message-btn"
          variant="primary"
          onClick={() => getChatId()}
        >
          Message
        </Button>
      </Link>
    </div>
  );
};

export default CurrentFriends;
