import React from 'react';
import { db } from '../db';

export default function EditModal({ event, onClose }) {
  if (!event) return null;

  const handleDelete = async () => {
    if (window.confirm("この予定を削除しますか？")) {
      await db.events.delete(event.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>予定の操作</h3>
        </div>
        <div className="delete-confirm-view">
          <p><strong>{event.mainTitle}</strong><br/>{event.startTime} - {event.endTime}</p>
        </div>
        <div className="confirm-actions">
          <button className="cancel-btn" onClick={onClose}>閉じる</button>
          <button className="delete-exec-btn" onClick={handleDelete}>削除する</button>
        </div>
      </div>
    </div>
  );
}