import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function Loader(): JSX.Element {
    const isLoading = useSelector((state: RootState) => state.loading.isLoading);

    if (!isLoading) {
        return <></>;
    }

    return <div className={"loader" + (isLoading ? " loader-load" : "")}>
        <span className="spinner-border spinner-border-xl loading-icon" role="status" />
    </div>;
}
