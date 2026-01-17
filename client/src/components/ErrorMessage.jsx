import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-message-container">
      <div className="error-message">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="close-btn" aria-label="Close">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
