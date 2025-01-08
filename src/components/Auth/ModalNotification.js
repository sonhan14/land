import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './ModalNotification.scss';
import { useNavigate } from 'react-router-dom';
const ModalLogin = (props) => {
    const { handleClose, show } = props;
    const navigate = useNavigate();
    const handleClickLogin = () => {
        handleClose();
        navigate('/login');
    };
    const handleClickRegister = () => {
        handleClose();
        navigate('/register');
    };
    return (
        <Modal
            className="modal-auth "
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={show}
            onHide={handleClose}
        >
            <div className="modal-auth-container">
                <Modal.Header closeButton>
                    <Modal.Title className="modal-auth-title">Thông Báo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Hãy đăng kí hoặc đăng nhập nếu bạn đã có tài
                khoản!  */}
                    Bạn phải là thành viên mới có thể thêm hoặc xem quy hoạch. Mỗi khi đăng ký thì 1 tài khoản được thưởng 20
                    coin để xem quy hoạch.
                </Modal.Body>
                <Modal.Footer className="btn-auth">
                    <Button className="btn-register" variant="secondary" onClick={handleClickRegister}>
                        Đăng ký
                    </Button>
                    <Button className="btn-login" variant="primary" onClick={handleClickLogin}>
                        Đăng nhập
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default ModalLogin;
