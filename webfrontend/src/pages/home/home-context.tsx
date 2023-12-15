import { Context, createContext, useState, PropsWithChildren, Dispatch, SetStateAction, useContext, useEffect, useCallback } from "react";
import { getJSONItemFrom, getStringFrom } from "../../utils/locals";
import { OnePost } from "../../components/posts/one-post";

type HomeState = {
    sortMethod: 'time' | 'recommendation',
    setSortMethod: Dispatch<SetStateAction<'time' | 'recommendation'>>,
    isFriendFilter: boolean,
    setIsFriendFilter: Dispatch<SetStateAction<boolean>>,
    isTagFilter: boolean,
    setIsTagFilter: Dispatch<SetStateAction<boolean>>,
    isLoading: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    posts: Array<OnePost>,
    setPosts: Dispatch<SetStateAction<Array<OnePost>>>,
    isAllPostsLoaded: boolean,
    setIsAllPostsLoaded: Dispatch<SetStateAction<boolean>>,
    startNumber: number,
    setStartNumber: Dispatch<SetStateAction<number>>,
    initialTimestamp: number,
    setInitialTimestamp: Dispatch<SetStateAction<number>>,
    cleanPosts: () => void,
};

const useHomeState = (): HomeState => {
    const [sortMethod, setSortMethod] = useState<'time' | 'recommendation'>('time');
    const [isFriendFilter, setIsFriendFilter] = useState<boolean>(false);
    const [isTagFilter, setIsTagFilter] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<Array<OnePost>>([]);
    const [isAllPostsLoaded, setIsAllPostsLoaded] = useState<boolean>(false);
    const [startNumber, setStartNumber] = useState<number>(sortMethod === 'time' ? 0 : 5);
    const [initialTimestamp, setInitialTimestamp] = useState<number>(0);

    const cleanPosts = useCallback<() => void>(() => {
        window.scrollTo(0, 0);
        setPosts([]);
        setIsAllPostsLoaded(false);
        setStartNumber(sortMethod === 'time' ? 0 : 5);
        setInitialTimestamp(0);
    }, [sortMethod]);

    useEffect(() => {
        const currentSortMethod = getStringFrom('sortMethod', 'time', localStorage);
        if (currentSortMethod === 'time' || currentSortMethod === 'recommendation') {
            setSortMethod(currentSortMethod);
        }
        const currentIsFriendFilter = getJSONItemFrom('isFriendFilter', false, localStorage);
        if (typeof currentIsFriendFilter === 'boolean') {
            setIsFriendFilter(currentIsFriendFilter);
        }
        const currentIsTagFilter = getJSONItemFrom('isTagFilter', false, localStorage);
        if (typeof currentIsTagFilter === 'boolean') {
            setIsTagFilter(currentIsTagFilter);
        }
    }, []);

    return {
        sortMethod,
        setSortMethod,
        isFriendFilter,
        setIsFriendFilter,
        isTagFilter,
        setIsTagFilter,
        isLoading,
        setIsLoading,
        posts,
        setPosts,
        isAllPostsLoaded,
        setIsAllPostsLoaded,
        startNumber,
        setStartNumber,
        initialTimestamp,
        setInitialTimestamp,
        cleanPosts,
    };
}

const HomeContext = createContext<HomeState | null>(null);

export const HomeContextProvider = ({ children }: PropsWithChildren): JSX.Element => (
    <HomeContext.Provider value={useHomeState()}>
        {children}
    </HomeContext.Provider>
);

export const useHomeContext = () => useContext<HomeState>(HomeContext as Context<HomeState>);