import { useCallback, useEffect, useState } from "react";
import { triggerErrorMessage } from "../../utils/locals";
import { useProfileContext } from "../../pages/profile/profile-context";
import { postRequestContent } from "../../utils/request";

export default function Readme(): JSX.Element {
    const { username, isMyProfile } = useProfileContext();
    const [readme, setReadme] = useState<string>('');
    const [readmeEdit, setReadmeEdit] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const handleStartEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancel = useCallback(() => {
        setReadmeEdit(readme);
        setIsEditing(false);
    }, [readme]);

    const handleSave = useCallback(() => {
        fetch('/profile/edit_readme', postRequestContent({
            content: readmeEdit,
        })).then(res => {
            if (res.status !== 200) {
                triggerErrorMessage();
                return;
            }
            setIsEditing(false);
            setReadme(readmeEdit);
        })
    }, [readmeEdit]);

    useEffect(() => {
        if (!username) {
            return;
        }
        fetch(`/profile/readme/${username}`).then(res => {
            if (res.status !== 200) {
                triggerErrorMessage();
                return;
            }
            res.json().then(res => {
                setReadme(res.readme);
                setReadmeEdit(res.readme);
            });
        });
    }, [username]);

    return <div className="profile-readme">
        {!isEditing && isMyProfile && <div className="btn btn-secondary btn-sm" onClick={handleStartEdit}>Edit</div>}
        {isEditing 
        ? <textarea rows={6} className="form-control" value={readmeEdit} onChange={e => setReadmeEdit(e.target.value)} />
        : readme
        ? <div>{readme}</div>
        : <div className="fst-italic">No description</div>}
        {isEditing && <div className="profile-readme-buttons">
            <div className="btn btn-primary" onClick={handleSave}>Save</div>
            <div className="btn btn-danger" onClick={handleCancel}>Cancel</div>
        </div>}
    </div>;
}
