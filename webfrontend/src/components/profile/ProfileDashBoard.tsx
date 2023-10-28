import React, { useCallback, useEffect, useState } from 'react'
import {FcInvite} from 'react-icons/fc'
import {BsFillPeopleFill} from 'react-icons/bs'
import { triggerErrorMessage } from '../../utils/locals'
import { Button } from 'react-bootstrap'
export type FriendType = {
  name:string,
  username: string,
  link: string,
  img: string,
}
const ProfileDashBoard = () => {
  const [currentFriends, setCurrentFriends] = useState<Array<FriendType>>([]);
  const [buttonClick, setButtonClick] = useState<number>(1);
  const [currClass, setCurrClass] = useState<string>("first");
  const handleMenuClick = useCallback((id: number, name: string)=> {
    console.log(currClass);
    const prev = document.getElementById(`${currClass}`);

    prev?.classList.remove('clicked-button');
    console.log(prev);
    const cur = document.getElementById(`${name}`);
    cur?.classList.add('clicked-button');
    console.log(cur);
    setButtonClick(id);
    setCurrClass(name);

  },[buttonClick,currClass]);
  const getCurrentFriends = useCallback(() =>{
    fetch('/user/friends_async')
      .then(res => {
        if (res.status !== 200) {
          triggerErrorMessage();
          return;
        }
        res.json().then(res => {
          setCurrentFriends(res.users.map((user:any) =>({
            name: user.name,
            username: user.username,
            link: user.profile_link,
            img: user.profile_img_url,
            role : user.role,
          })));
          console.log(currentFriends);
        })
      })
  },[])
  useEffect(() => {
    getCurrentFriends();
  },[getCurrentFriends]); 
  return (
    <div className='profile-dash-board'>
      <div className="dashboard-container">
        <div className="left-section">
          <div 
            id='first'
            className="option clicked-button"
            onClick = {() => handleMenuClick(1,'first')}
            >
              <FcInvite className='option-icon'/> 
              <p className='option-title'>Friend Requests</p>
            </div>

          <div 
            id ='second'
            className="option"
            onClick={() => handleMenuClick(2,'second')}
          >
            <BsFillPeopleFill className='option-icon'/> 
            <p className='option-title'>Friends</p>
          </div>
        </div>
        <div className="right-section">
          {buttonClick === 2 && 
          <ul className='friend-list'>
          {/*} {currentFriends.map((friends) => (
              <li>{friends?.name}</li>
          ))} */}
          <li className='friend-info'>
            <img src="/Jiale.jpg" className='friend-thumbnail' />
            <p className='friend-name'> Jiale</p>  
          </li> 
          <li className='friend-info'>
            <img src="/Jiale.jpg" className='friend-thumbnail' />
            <span className='friend-name'> Jiale</span>
          </li> 
          </ul>}
          {
            buttonClick == 1 &&
            <ul className='friend-list'>
            {/*} {currentFriends.map((friends) => (
                <li>{friends?.name}</li>
            ))} */}
            <li className='friend-info'>
              <img src="/Jiale.jpg" className='friend-thumbnail' />
              <p className='friend-name'> Jiale</p>  
              <Button className='approve-btn' variant='success'> Aprrove</Button>
              <Button className='reject-btn' variant='danger'> Reject</Button>
            </li> 
            <li className='friend-info'>
              <img src="/Jiale.jpg" className='friend-thumbnail' />
              <span className='friend-name'> Jiale</span>
              <Button className='approve-btn' variant='success'> Aprrove</Button>
              <Button className='reject-btn' variant='danger'> Reject</Button>
            </li> 
            </ul>

          }
        </div>
      </div>
    </div>
  )
}

export default ProfileDashBoard
