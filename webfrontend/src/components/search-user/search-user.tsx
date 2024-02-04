import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { triggerErrorMessage } from "../../utils/locals";

type ProfileDataType = {
    name: string,
    username: string,
    profile_link: string,
    profile_pic_url: string,
};

export default function SearchUser(): JSX.Element {
    const [searchParameter, setSearchParameter] = useState<string>('');
    const [isSearchResultShown, setIsSearchResultShown] = useState<boolean>(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [timeoutId, setTimeoutId] = useState<number>(-1);
    const [users, setUsers] = useState<Array<ProfileDataType>>([]);
    const timeDelay = useMemo<number>(() => 500, []);

    const fetchUsers = useCallback((searchParameter: string) => {
        fetch(searchParameter[0] === '@' ? '/user/search_username?username=' + searchParameter.slice(1) : '/user/search?username=' + searchParameter)
            .then(res => {
                setIsSearching(false);
                if (res.status !== 200) {
                    triggerErrorMessage();
                    return;
                }
                res.json().then(res => {
                    setUsers(res.users);
                });
            });
    }, []);

    const isValidParameter = useCallback((searchParam: string) => {
        return searchParam !== '' && (searchParam.length > 1 || searchParam[0] !== "@");
    }, []);

    const handleChange = useCallback((e: ChangeEvent) => {
        const newParameter = (e.target as HTMLInputElement).value;
        setSearchParameter(newParameter);
        clearTimeout(timeoutId);
        setIsSearching(true);
        if (isValidParameter(newParameter)) {
            setTimeoutId(window.setTimeout(() => {
                fetchUsers(newParameter);
            }, timeDelay));
        } else {
            setTimeoutId(window.setTimeout(() => {
                setUsers([]);
            }, timeDelay));
        }
    }, [timeoutId, fetchUsers, timeDelay, isValidParameter]);

    const handleSearch = useCallback(() => {
        clearTimeout(timeoutId);
        setIsSearching(true);
        if (isValidParameter(searchParameter)) {
            fetchUsers(searchParameter);
        }
    }, [timeoutId, searchParameter, fetchUsers, isValidParameter]);

    const handleMouseDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    useEffect(() => {
        const callback = (e: MouseEvent) => {
            if (rootRef.current!.contains(e.target as HTMLElement)) {
                setIsSearchResultShown(true);
            } else {
                setIsSearchResultShown(false);
            }
        }
        document.addEventListener('click', callback);
        return () => document.removeEventListener('click', callback);
    }, []);

    return <div className="position-relative" ref={rootRef}>
        <div className="d-flex">
            <input
                className="form-control me-2"
                type="search"
                name="username"
                placeholder="Find user"
                autoComplete="off"
                aria-label="Search"
                onChange={handleChange}
                onKeyDown={handleMouseDown}
            />
            <button className="btn btn-outline-primary" onClick={handleSearch}>Search</button>
        </div>
        <div className="search-user-result-box" style={{
            display: isSearchResultShown ? "flex" : "none",
        }}>
            {!isValidParameter(searchParameter)
            ? <div className='search-user-result-box-placeholder text-body-tertiary'>
                <p>Type and search for user ...</p>
                <p>Tip: add '@' in front to search by username</p>
            </div>
            : isSearching
            ? <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            : users.length !== 0
            ? users.map(user => <ResultListing user={user} key={user.username} />)
            : <div className="text-body-tertiary">No user match your search</div>}
        </div>
    </div>;
}

const ResultListing = ({ user }: {
    user: ProfileDataType,
}): JSX.Element => (
    <div className="search-user-result-box-listing">
        <div className="search-user-result-box-listing-left-side">
            <div className="search-user-result-box-listing-profile-pic">
                <img src={user.profile_pic_url} alt="" />
            </div>
            <div className="search-user-result-box-listing-name">{user.name}</div>
        </div>
        <div className="search-user-result-box-listing-right-side">
            <div className="search-user-result-box-listing-username">
                <a href={user.profile_link}>{user.username}</a>
            </div>
        </div>
    </div>
);
