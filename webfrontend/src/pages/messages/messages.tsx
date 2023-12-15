import { MessageContextProvider } from "../../components/messages/context";
import ChatList from "../../components/messages/list";
import ChatLog from "../../components/messages/log";


export default function Messages(): JSX.Element {
    return <MessageContextProvider>
        <div className="chat-page">
            <div className="chat-window">
                <ChatList />
                <ChatLog />
            </div>
        </div>
    </MessageContextProvider>;
}
