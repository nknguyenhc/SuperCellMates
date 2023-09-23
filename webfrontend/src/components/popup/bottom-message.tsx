import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect, useRef, useState } from "react";

export default function BottomMessage(): JSX.Element {
    const message = useSelector((state: RootState) => state.bottom.message);
    const timeout = useRef<number | undefined>(undefined);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    useEffect(() => {
        if (message !== '') {
            setIsTransitioning(false);
            clearTimeout(timeout.current);
            setTimeout(() => {
                setIsTransitioning(true);
                timeout.current = window.setTimeout(() => {
                    setIsTransitioning(false);
                }, 5000);
            }, 50);
        }
    }, [message]);

    return <div 
        className={"alert alert-info" + (isTransitioning ? " bottom-popup-transition bottom-popup-in" : "")}
        id="bottom-popup"
    >
        {message}
    </div>;
}