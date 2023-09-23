import { useDispatch } from "react-redux";
import { useHomeContext } from "../../pages/home/home-context";
import { turnon } from "../../redux/filter-slice";
import { useCallback } from "react";


export const HomeFilter = (): JSX.Element => {
    const {
        isFriendFilter,
        setIsFriendFilter,
        isTagFilter,
        setIsTagFilter,
        cleanPosts,
    } = useHomeContext();
    const dispatch = useDispatch();

    const handleFriendFilterClick = useCallback<() => void>(() => {
        setIsFriendFilter(state => !state);
        cleanPosts();
        localStorage.setItem('isFriendFilter', (!isFriendFilter).toString());
        dispatch(turnon());
    }, [setIsFriendFilter, dispatch, cleanPosts, isFriendFilter]);

    const handleTagFilterClick = useCallback<() => void>(() => {
        setIsTagFilter(state => !state);
        cleanPosts();
        localStorage.setItem('isTagFilter', (!isTagFilter).toString());
        dispatch(turnon());
    }, [setIsTagFilter, dispatch, cleanPosts, isTagFilter]);

    return <div className="home-feed-filters">
        <div className="form-check form-switch">
            <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                id="friend-filter" 
                checked={isFriendFilter} 
                onChange={handleFriendFilterClick} 
            />
            <label className="form-check-label" htmlFor="friend-filter">My friends only</label>
        </div>
        <div className="form-check form-switch">
            <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                id="tag-filter" 
                checked={isTagFilter} 
                onChange={handleTagFilterClick} 
            />
            <label className="form-check-label" htmlFor="tag-filter">My tags only</label>
        </div>
    </div>
}

export const HomeSort = (): JSX.Element => {
    const {
        sortMethod,
        setSortMethod,
        cleanPosts,
    } = useHomeContext();
    const dispatch = useDispatch();

    const handleTimeSortClick = useCallback<() => void>(() => {
        setSortMethod('time');
        cleanPosts()
        localStorage.setItem('sortMethod', 'time');
        dispatch(turnon());
    }, [setSortMethod, cleanPosts, dispatch]);

    const handleRecSortClick = useCallback<() => void>(() => {
        setSortMethod('recommendation');
        cleanPosts();
        localStorage.setItem('sortMethod', 'recommendation');
        dispatch(turnon());
    }, [setSortMethod, cleanPosts, dispatch]);

    return <div className="sort-method">
        <div className="form-check">
            <input 
                className="form-check-input" 
                type="radio" 
                id="sort-by-time" 
                checked={sortMethod === 'time'} 
                onChange={handleTimeSortClick} 
            />
            <label className="form-check-label" htmlFor="sort-by-time">Latest posts</label>
        </div>
        <div className="form-check">
            <input 
                className="form-check-input" 
                type="radio" 
                id="sort-by-recommendation" 
                checked={sortMethod === 'recommendation'} 
                onChange={handleRecSortClick}
            />
            <label className="form-check-label" htmlFor="sort-by-recommendation">Recommended posts</label>
        </div>
    </div>;
}