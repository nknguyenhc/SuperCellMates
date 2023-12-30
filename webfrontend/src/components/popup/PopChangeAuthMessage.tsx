import { Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";

interface Props {
  message: string;
  isMessageModal: boolean;
  setIsMessageModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const PopChangeAuthMessage: React.FC<Props> = ({
  message,
  isMessageModal,
  setIsMessageModal,
}) => {
  const handleClose = () => {
    setIsMessageModal(prev => !prev);
  };
  return (
    <Modal show={isMessageModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Message</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PopChangeAuthMessage;
