import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { hide, show } from "../../redux/message-slice";

export default function BottomMessage(): JSX.Element {
    const message = useSelector((state: RootState) => state.bottom.message);
    const isNewMessage = useSelector((state: RootState) => state.bottom.isNewMessage);
    const dispatch = useDispatch();
    const [isNew, setIsNew] = useState<boolean>(false);

    useEffect(() => {
        if (isNewMessage) {
            dispatch(hide());
            setIsNew(false);
            setTimeout(() => setIsNew(true), 10);
        }
    }, [isNewMessage, dispatch]);

    return <div 
        className={"alert alert-info" + (isNew ? " bottom-popup-transition bottom-popup-in" : "")}
        id="bottom-popup"
    >
        {message}
    </div>;
}