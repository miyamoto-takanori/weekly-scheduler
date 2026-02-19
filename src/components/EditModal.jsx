import React, { useState } from 'react';
import { db } from '../db';
import { CATEGORY_SETTINGS } from '../constants';

export default function EditModal({ event, onClose, existingEvents }) {
  const [formData, setFormData] = useState(() => event ? { ...event } : null);

  if (!event || !formData) return null;

  const getMinutesTotal = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const handleUpdate = async () => {
    if (!formData.mainTitle) return;

    const startMins = getMinutesTotal(formData.startTime);
    const endMins = getMinutesTotal(formData.endTime);

    if (startMins >= endMins) {
      alert("終了時刻は開始時刻より後の時間に設定してください（日付を跨ぐ登録はできません）。");
      return;
    }
    if (endMins - startMins < 30) {
      alert("予定は最低30分以上で登録してください。");
      return;
    }

    // 重複チェック（自分自身は除く）
    const isOverlapping = existingEvents.some(e => {
      if (e.id === event.id) return false;
      const eStart = getMinutesTotal(e.startTime);
      const eEnd = getMinutesTotal(e.endTime);
      return (startMins < eEnd && endMins > eStart);
    });

    if (isOverlapping) {
      alert("その時間帯には既に予定が入っています。");
      return;
    }

    await db.events.update(event.id, formData);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm("この予定を削除しますか？")) {
      await db.events.delete(event.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>予定の編集</h3></div>
        <div className="edit-form">
          <div className="form-section">
            <label className="form-label">Category</label>
            <select 
              className="input-field" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              {Object.keys(CATEGORY_SETTINGS).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-section">
            <label className="form-label">Main Title</label>
            <input 
              className="input-field" 
              type="text" 
              value={formData.mainTitle} 
              onChange={e => setFormData({...formData, mainTitle: e.target.value})} 
            />
          </div>
          <div className="form-section">
            <label className="form-label">Sub Title</label>
            <input 
              className="input-field" 
              type="text" 
              value={formData.subTitle} 
              onChange={e => setFormData({...formData, subTitle: e.target.value})} 
            />
          </div>
          <div className="form-section">
            <label className="form-label">Start Time</label>
            <input 
              type="time" 
              className="input-field" 
              value={formData.startTime} 
              onChange={e => setFormData({...formData, startTime: e.target.value})} 
            />
          </div>
          <div className="form-section">
            <label className="form-label">End Time</label>
            <input 
              type="time" 
              className="input-field" 
              value={formData.endTime} 
              onChange={e => setFormData({...formData, endTime: e.target.value})} 
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="save-btn" onClick={handleUpdate}>変更を保存する</button>
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button className="cancel-btn" onClick={onClose}>閉じる</button>
            <button className="delete-exec-btn" style={{ flex: 1 }} onClick={handleDelete}>削除</button>
          </div>
        </div>
      </div>
    </div>
  );
}