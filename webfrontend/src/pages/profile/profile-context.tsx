import { Context, PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type ProfileStateInput = {
    username: string,
    isMyProfile: boolean,
}

type ProfileState = ProfileStateInput & {
    tagChosen: string,
    setTagChosen: (tag: string) => void,
}

const useProfileState = ({ username, isMyProfile }: {
    username: string,
    isMyProfile: boolean,
}): ProfileState => {
    const [tagChosen, setTagChosen] = useState<string>('');
    const location = useLocation();
    const actualUsername = useMemo((): string => {
        return location.pathname.startsWith('/profile')
            ? username
            : location.pathname.split('/')[3];
    }, [location, username]);

    return {
        username: actualUsername,
        isMyProfile,
        tagChosen,
        setTagChosen,
    };
};

const ProfileContext = createContext<ProfileState | null>(null);

export const ProfileContextProvider = ({ children, username, isMyProfile }: PropsWithChildren<ProfileStateInput>): JSX.Element => (
    <ProfileContext.Provider value={useProfileState({ username, isMyProfile })}>{children}</ProfileContext.Provider>
);

export const useProfileContext = () => useContext<ProfileState>(ProfileContext as Context<ProfileState>);
