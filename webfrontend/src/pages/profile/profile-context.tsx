import { Context, PropsWithChildren, createContext, useContext, useState } from "react";

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

    return {
        username,
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
