import { useSelector } from "react-redux";
import { MemberType, Role } from "./manage-group";
import { RootState } from "../../redux/store";
import { useCallback, useState } from "react";

export default function UserTable({
    users, 
    variant,
    removeAction,
    addAction,
    removeBtnText,
    addBtnText,
    removeCaption,
    addCaption,
    myRole,
}: {
    users: Array<MemberType>,
    variant: "members" | "admins"
    removeAction: (user: MemberType) => void,
    addAction: (user: MemberType, confirmation?: string) => void,
    removeBtnText: string,
    addBtnText: string,
    removeCaption: string,
    addCaption: string,
    myRole: Role,
}) {
    return <div className="add-people-table-table">
        <table className="table border-primary">
            <thead>
                <tr>
                    <th scope="col" style={{ width: "50%" }}>Username</th>
                    <th scope="col" style={{ width: "50%" }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.map(member => (
                    <TableRow 
                        user={member}
                        showRemove={
                            variant === 'members'
                            ? (member.role === 'member' && myRole !== 'member') || (member.role === 'admin' && myRole === 'creator')
                            : myRole === 'creator'
                        }
                        showAdd={
                            variant === 'members'
                            ? member.role === 'member' && myRole !== 'member'
                            : myRole === 'creator'
                        }
                        removeAction={removeAction}
                        addAction={addAction}
                        removeBtnText={removeBtnText}
                        addBtnText={addBtnText}
                        removeCaption={removeCaption}
                        addCaption={addCaption}
                        variant={variant}
                        key={member.username}
                    />
                ))}
            </tbody>
        </table>
    </div>;
}


const TableRow = ({
    user,
    showRemove,
    showAdd,
    removeAction,
    addAction,
    removeBtnText,
    addBtnText,
    removeCaption,
    addCaption,
    variant,
}: {
    user: MemberType,
    showRemove: boolean,
    showAdd: boolean,
    removeAction: (user: MemberType) => void,
    addAction: (user: MemberType, confirmation?: string) => void,
    removeBtnText: string,
    addBtnText: string,
    removeCaption: string,
    addCaption: string,
    variant: "members" | "admins"

}): JSX.Element => {
    const [showRemoveMessage, setShowRemoveMessage] = useState<boolean>(false);
    const [showAddMessage, setShowAddMessage] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const username = useSelector((state: RootState) => state.auth.username);

    const handleAdd = useCallback(() => {
        if (variant === 'members') {
            addAction(user);
        } else {
            addAction(user, password);
        }
        setShowAddMessage(false);
    }, [addAction, user, password, variant]);

    const handleRemove = useCallback(() => {
        removeAction(user);
        setShowRemoveMessage(false);
    }, [removeAction, user]);

    return <tr>
        <td className="table-element">
            <a href={user.link}>{user.username}</a>
        </td>
        <td className="table-element">
            {user.username !== username && <>
                <div className="add-people-actions">
                    {showRemove && <button className="btn btn-danger" onClick={() => {
                        setShowRemoveMessage(true);
                        setShowAddMessage(false);
                    }}>{removeBtnText}</button>}
                    {showAdd && <button className="btn btn-primary" onClick={() => {
                        setShowAddMessage(true);
                        setShowRemoveMessage(false);
                    }}>{addBtnText}</button>}
                </div>
                {showRemoveMessage && <div className="add-people-action">
                    <div>{removeCaption}</div>
                    <div className="add-people-actions">
                        <button className="btn btn-primary" onClick={handleRemove}>Confirm</button>
                        <button className="btn btn-secondary" onClick={() => setShowRemoveMessage(false)}>Cancel</button>
                    </div>
                </div>}
                {showAddMessage && <div className="add-people-action">
                    <div>{addCaption}</div>
                    {variant === 'admins' &&
                    <div className="user-action-confirmation">
                        <div className="user-action-confirmation-label">Type your password to confirm:</div>
                        <input type="password" className="form-control" onChange={event => setPassword(event.target.value)} />
                    </div>}
                    <div className="add-people-actions">
                        <button className="btn btn-primary" onClick={handleAdd}>Confirm</button>
                        <button className="btn btn-secondary" onClick={() => setShowAddMessage(false)}>Cancel</button>
                    </div>
                </div>}
            </>}
        </td>
    </tr>;
}
