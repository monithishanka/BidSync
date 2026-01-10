import { IoWarning, IoCheckmark, IoClose } from 'react-icons/io5';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Yes',
  cancelText = 'No',
  type = 'danger' // danger, warning, info
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon ${type}`}>
          <IoWarning size={32} />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            <IoClose size={18} />
            {cancelText}
          </button>
          <button className={`btn btn-${type === 'danger' ? 'danger' : 'primary'}`} onClick={handleConfirm}>
            <IoCheckmark size={18} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
