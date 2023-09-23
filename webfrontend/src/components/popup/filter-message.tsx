import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useDispatch } from "react-redux";
import { turnoff } from "../../redux/filter-slice";

export default function FilterMessage(): JSX.Element {
    const isNewFilter = useSelector((state: RootState) => state.filter.isNewFilter);
    const dispatch = useDispatch();
    const [isNew, setIsNew] = useState<boolean>(true);

    useEffect(() => {
        if (isNewFilter) {
            dispatch(turnoff());
            setIsNew(false);
            setTimeout(() => setIsNew(true), 10);
        }
    }, [isNewFilter, dispatch]);

    return <div 
        id="filter-message" 
        className={
            "alert alert-info" 
            + (isNew 
                ? " filter-message-transition filter-message-position filter-message-fading" 
                : ""
            )
        }
        role="alert"
    >
        Filter applied! Page reloaded!
    </div>;
}