import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content confirm-modal">
                <div className="confirm-icon-wrap">
                    <div className={`confirm-icon ${type}`}>
                        {type === 'danger' ? '!' : '?'}
                    </div>
                </div>

                <h2>{title}</h2>
                <p>{message}</p>

                <div className="confirm-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        Annuler
                    </button>
                    <button
                        className={`btn-confirm ${type}`}
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
