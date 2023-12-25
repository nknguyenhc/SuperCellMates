import { useCallback, useEffect, useRef, useState } from "react";
import { triggerErrorMessage } from "../../utils/locals";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover';
import { Link } from "react-router-dom";

interface userProperties {
  name: string,
  profile_pic_url: string,
  username: string,
  profile_link: string
}
const SearchUserBox = () => {
  const searchForm = useRef<HTMLFormElement>(null);
  const searchField = useRef<HTMLInputElement>(null);
  const searchResultBox = useRef<HTMLDivElement>(null);
  const [username, setUserName] = useState<string>('');
  const [results, setResults] = useState<Array<userProperties>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [clickOutside, setIsClickOutside] = useState<boolean>(false); 

  const searchUser = useCallback(() => {
    setIsClickOutside(false);
    if (username !== '' && !isSearching) {
        setIsSearching(true);
        if (username === '@') {
            fetch('/user/search_username?username=' + username.slice(1))
                .then(response => {
                    setIsSearching(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        response.json().then(response => setResults(response.users))
                    }
                });
        } else {
            fetch('/user/search?username=' + username)
                .then(response => {
                    setIsSearching(false);
                    if (response.status !== 200) {
                        triggerErrorMessage();
                    } else {
                        
                        response.json().then(response => {
                          setResults(response.users) 
                        })
                    }
                });
        }
    }
  }, [isSearching, username]);

  const submitSearchField = useCallback((event: React.SyntheticEvent<EventTarget>) => {
    event.preventDefault();
    searchUser();
  }, [searchUser])

  const handleChange = useCallback((value: string) => {
    setUserName(value);
    setIsSearching(false);
    searchUser();
  }, [searchUser])
 
  useEffect(() => {
    window.onclick = (event: MouseEvent) => {
      if (searchForm.current && searchForm.current!.contains(event.target as Node)) {
        setIsClickOutside(false);
      } else {
        setIsClickOutside(true);
      }
    }
 
  }, [clickOutside]);

  const popover = (
    <Popover id={`popover-positioned-bottom`}>
    <Popover.Body>
     {username !== '' ? results.length !== 0 ?
        <div ref = {searchResultBox} id="search-result-box" style={{display: 'flex'}}>
          <div className="result-lists">
            {results.map((result: userProperties, id) => {
              return (
              <Link key={id}  to={`${result.profile_link}`} style={{textDecoration: 'none'}}>
                <div className="result-item"> 
                  <img style={{height: '25px'}} src={result.profile_pic_url} alt="" />
                  <div className="user-info">
                    <p className="user-name"> {result.name}</p>
                    <p className="user-username">{result.username}</p>
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
        </div>: 
          <div ref = {searchResultBox} id="search-result-box" style={{display: 'flex'}}>
            <div id="search-box-no-result" className="text-body-tertiary">No user match your search</div>
          </div> : 
           <div id="search-box-placeholder" className='text-body-tertiary'>
            <p> <strong>Type and search for user ...</strong></p>
            <p> <strong>Tip: add '@' in front to search by username</strong></p>
          </div>
      }   
    </Popover.Body>
  </Popover>
  );

return (
    <div  className="position-relative">
      <OverlayTrigger show = {!clickOutside} placement="bottom" overlay={popover}>
      <form ref = {searchForm} onSubmit={(e) => submitSearchField(e)} autoComplete='off' id='search-form' className="d-flex" role="search">
          <input ref = {searchField} id='search-input' className="form-control me-2" type="search" name="username" placeholder="Find user" aria-label="Search" value={username} onChange={(e) => handleChange(e.target.value)}/>
          <button className="btn btn-outline-primary" type="submit">Search</button>
      </form>
      </OverlayTrigger>
    </div>
  )
}

export default SearchUserBox
