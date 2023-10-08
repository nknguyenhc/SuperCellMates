import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from "react";


type MessageContextType = {
    isPrivateSelected: boolean,
    setIsPrivateSelected: Dispatch<SetStateAction<boolean>>,
    currChatId: string | undefined,
    setCurrChatId: Dispatch<SetStateAction<string | undefined>>,
    isCurrChatPrivate: boolean,
    setIsCurrChatPrivate: Dispatch<SetStateAction<boolean>>,
    isCreatingNewGroup: boolean,
    setIsCreatingNewGroup: Dispatch<SetStateAction<boolean>>,
    isAddingPeople: boolean,
    setIsAddingPeople: Dispatch<SetStateAction<boolean>>,
};

const useMessageState = (): MessageContextType => {
    const [isPrivateSelected, setIsPrivateSelected] = useState<boolean>(true);
    const [currChatId, setCurrChatId] = useState<string | undefined>(undefined);
    const [isCurrChatPrivate, setIsCurrChatPrivate] = useState<boolean>(true);
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState<boolean>(false);
    const [isAddingPeople, setIsAddingPeople] = useState<boolean>(false);

    return {
        isPrivateSelected,
        setIsPrivateSelected,
        currChatId,
        setCurrChatId,
        isCurrChatPrivate,
        setIsCurrChatPrivate,
        isCreatingNewGroup,
        setIsCreatingNewGroup,
        isAddingPeople,
        setIsAddingPeople,
    };
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageContextProvider = ({ children }: PropsWithChildren): JSX.Element => (
    <MessageContext.Provider value={useMessageState()}>
        {children}
    </MessageContext.Provider>
)

export const useMessageContext = (): MessageContextType => useContext(MessageContext) as MessageContextType;
