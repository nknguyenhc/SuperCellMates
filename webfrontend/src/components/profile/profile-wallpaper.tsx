import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import { AiFillCamera } from "react-icons/ai";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";

const ProfileWallpaper = () => {
  const name = useSelector((state: RootState) => state.auth);
  const [isEditProfileImg, setIsEditProfileImg] = useState<boolean>(false);
  const [profileImgUrl, setProfileImgUrl] = useState<File>();

  return (
    <div className="profile-wallpaper">
      <Link to={"/profile/setup"}>
        <Button className="edit-profile-btn" variant="warning">
          <strong>Edit Profile</strong>
        </Button>
      </Link>
      <div className="profile-info">
        <div className="thumbnail">
          <div className="profile-image-container">
            {profileImgUrl ? (
              <img
                className="thumbnail-picture"
                src={URL.createObjectURL(profileImgUrl)}
                alt=""
              />
            ) : (
              <img
                className="thumbnail-picture"
                src={`/profile/img/${name.username}`}
                alt=""
              />
            )}
          </div>

          <div className="profileImg-edit">
            <Button
              className="rounded-circle change-thumbnail-btn"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditProfileImg(true)}
            >
              <AiFillCamera />
            </Button>
          </div>
        </div>
        <p className="profile-name">{name.username}</p>
        <span id="boot-icon" className="bi bi-camera"></span>
      </div>
      <div></div>

      {isEditProfileImg ? (
        <Avatar
          currentProfileImg={
            profileImgUrl ? profileImgUrl : `/profile/img.${name.username}`
          }
          setIsEditProfileImg={setIsEditProfileImg}
          setProfileImgUrl={setProfileImgUrl}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default ProfileWallpaper;
