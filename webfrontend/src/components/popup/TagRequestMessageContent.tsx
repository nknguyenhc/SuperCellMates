import { useCallback, useState } from "react";
import { Button, Modal } from "react-bootstrap";
interface Props {
  message: string,
  setTagRequestMessageContent: React.Dispatch<React.SetStateAction<string>>
  handleClose: () => void
}
const TagRequestMessageContent:React.FC<Props> = ({message, setTagRequestMessageContent, handleClose}) => {
  const [show, setShow] = useState(true);

  const handleCloseMessage = useCallback(() => {
    setShow(false);
    setTagRequestMessageContent('');
    handleClose();
  }, [handleClose, setTagRequestMessageContent]);
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMessage}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>

  )
}

export default TagRequestMessageContent
