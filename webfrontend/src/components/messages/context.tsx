import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from "react";


type MessageContextType = {
    isPrivateSelected: boolean,
    setIsPrivateSelected: Dispatch<SetStateAction<boolean>>,
    currChatId: string | undefined,
    setCurrChatId: Dispatch<SetStateAction<string | undefined>>,
};

const useMessageState = (): MessageContextType => {
    const [isPrivateSelected, setIsPrivateSelected] = useState<boolean>(true);
    const [currChatId, setCurrChatId] = useState<string | undefined>(undefined);

    return {
        isPrivateSelected,
        setIsPrivateSelected,
        currChatId,
        setCurrChatId,
    };
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageContextProvider = ({ children }: PropsWithChildren): JSX.Element => (
    <MessageContext.Provider value={useMessageState()}>
        {children}
    </MessageContext.Provider>
)

export const useMessageContext = (): MessageContextType => useContext(MessageContext) as MessageContextType;
