import { useCallback, useEffect, useState } from "react";
import { FcInvite } from "react-icons/fc";
import { BsFillPeopleFill } from "react-icons/bs";
import { AiFillTags } from "react-icons/ai";
import { GiAchievement } from "react-icons/gi";
import { triggerErrorMessage } from "../../utils/locals";
import FriendRequests from "./friend-requests";
import CurrentFriends from "./current-friends";
import CurrentTags from "./current-tags";
import ProfileFeed from "./profile-feed";

export type FriendType = {
  name: string;
  username: string;
  link: string;
  img: string;
};

const ProfileDashBoard = () => {
  const [currentFriends, setCurrentFriends] = useState<Array<FriendType>>([]);
  const [friendRequests, setFriendRequests] = useState<Array<FriendType>>([]);
  const [buttonClick, setButtonClick] = useState<number>(0);
  const [currClass, setCurrClass] = useState<string>("zero");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleMenuClick = useCallback(
    (id: number, name: string) => {
      const prev = document.getElementById(`${currClass}`);
      prev?.classList.remove("clicked-button");
      const cur = document.getElementById(`${name}`);
      cur?.classList.add("clicked-button");
      setButtonClick(id);
      setCurrClass(name);
    },
    [currClass]
  );
  const getCurrentFriends = useCallback(() => {
    if (!isLoading) {
      setIsLoading(true);
      fetch("/user/friends_async").then((res) => {
        setIsLoading(false);
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        res.json().then((res) => {
          setCurrentFriends(
            res.map((user: any) => ({
              name: user.name,
              username: user.username,
              link: user.profile_link,
              img: user.profile_pic_url,
            }))
          );
        });
      });
    }
  }, [isLoading]);

  useEffect(() => {
    getCurrentFriends();
  }, [getCurrentFriends, currentFriends]);

  const getFriendRequest = useCallback(() => {
    if (!isLoading) {
      setIsLoading(true);
      fetch("/user/friend_requests_async").then((res) => {
        setIsLoading(false);
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        res.json().then((res) => {
          setFriendRequests(
            res?.map((user: any) => ({
              name: user.name,
              username: user.username,
              link: user.profile_link,
              img: user.profile_pic_url,
            }))
          );
        });
      });
    }
  }, [isLoading]);
  useEffect(() => {
    getFriendRequest();
  }, [getFriendRequest, friendRequests]);

  return (
    <div className="profile-dash-board">
      <div className="dashboard-container">
        <div className="left-section">
          <div
            id="zero"
            className="option clicked-button"
            onClick={() => handleMenuClick(0, "zero")}
          >
            <FcInvite className="option-icon" />
            <p className="option-title">Your Posts</p>
          </div>
          <div
            id="first"
            className="option"
            onClick={() => handleMenuClick(1, "first")}
          >
            <FcInvite className="option-icon" />
            <p className="option-title">Friend Requests</p>
          </div>

          <div
            id="second"
            className="option"
            onClick={() => handleMenuClick(2, "second")}
          >
            <BsFillPeopleFill className="option-icon" />
            <p className="option-title">Friends</p>
          </div>

          <div
            id="third"
            className="option"
            onClick={() => handleMenuClick(3, "third")}
          >
            <AiFillTags className="option-icon" />
            <p className="option-title">Tags</p>
          </div>
          <div
            id="fourth"
            className="option"
            onClick={() => handleMenuClick(4, "fourth")}
          >
            <GiAchievement className="option-icon" />
            <p className="option-title">Achievments</p>
          </div>
        </div>
        <div className="right-section">
          {buttonClick === 0 && <ProfileFeed />}
          {buttonClick === 1 && (
            <ul className="friend-list">
              {friendRequests?.map((friends, id) => (
                <FriendRequests
                  key={id}
                  name={friends.name}
                  link={friends.link}
                  setFriendRequests={setFriendRequests}
                />
              ))}
            </ul>
          )}

          {buttonClick === 2 && (
            <ul className="friend-list">
              {currentFriends?.map((friends, id) => (
                <CurrentFriends
                  key={id}
                  name={friends.name}
                  link={friends.link}
                  setCurrentFriends={setCurrentFriends}
                />
              ))}
            </ul>
          )}

          {buttonClick === 3 && <CurrentTags />}
        </div>
      </div>
    </div>
  );
};

export default ProfileDashBoard;
