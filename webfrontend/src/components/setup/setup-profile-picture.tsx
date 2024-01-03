import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useCallback, useEffect, useState } from "react";
import Avatar from "./avatar";
import { triggerErrorMessage } from "../../utils/locals";

const SetupProfilePicture = () => {
  const username = useSelector((state: RootState) => state.auth).username;
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [isEditProfileImg, setIsEditProfileImg] = useState<boolean>(false);
  const [profileImgUrl, setProfileImgUrl] = useState<string>("");

  const getProfileImg = useCallback(() => {
    if (!username) {
      return;
    }
    const url = "/profile/async";
    fetch(url).then((res) => {
      if (res.status !== 200) {
        triggerErrorMessage();
        return;
      }
      setIsProfileLoading(false);
      res.json().then((res) => {
        setProfileImgUrl(res.image_url);
      });
    });
  }, [username]);
  useEffect(() => {
    getProfileImg()
  }, [getProfileImg]);

  if (isProfileLoading) {
    return (
      <div className="setup-profile-picture m-3">
        <span className="spinner-grow" />
      </div>
    );
  }
  return (
    <div className="setup-profile-picture">
      <div className="m-3">
        <div>Add/Change Profile Image</div>
        <button className="setup-profile-picture-btn">
          <img
            src={process.env.PUBLIC_URL + "/add-image-icon.png"}
            onClick={() => setIsEditProfileImg(true)}
            alt=""
          />
        </button>
      </div>
      <div className="profile-img-container m-3">
        <img src={profileImgUrl} alt="" />
      
      </div>

      {isEditProfileImg ? (
        <Avatar
          setIsEditProfileImg={setIsEditProfileImg}
          isEditProfileImg={isEditProfileImg}
          setProfileImgUrl={setProfileImgUrl}
          currentProfileImg={profileImgUrl}
       
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default SetupProfilePicture;
