import { useState, useRef, useReducer, useEffect, Reducer } from "react";

export default function FilterMessage({ count }: {
    count: number
}): JSX.Element {
    const [timer, dispatchTimer] = useReducer<Reducer<number, 'reset' | 'countdown'>>(
        (state: number, action: 'reset' | 'countdown') => {
            switch (action) {
                case 'reset':
                    return 5;
                case 'countdown':
                    return state - 1;
            }
        }, 
        5
    );
    const timeout = useRef<number | undefined>(undefined);
    const interval = useRef<number | undefined>(undefined);
    const [isNew, setIsNew] = useState<boolean>(true);

    useEffect(() => {
        if (count !== 0) {
            clearTimeout(timeout.current);
            clearInterval(interval.current);
            setIsNew(false)
            setTimeout(() => setIsNew(true), 10);
            timeout.current = window.setTimeout(() => {
                setIsNew(false);
                window.location.reload();
            }, 5000);
            dispatchTimer('reset');
            interval.current = window.setInterval(() => {
                dispatchTimer('countdown');
            }, 1000);
        }
    }, [count]);

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
        Filter applied! Reloading in {timer} seconds.
    </div>;
}