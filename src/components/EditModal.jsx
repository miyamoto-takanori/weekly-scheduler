import React, { useState } from 'react';
import { db } from '../db';
import { CATEGORY_SETTINGS } from '../constants';

export default function EditModal({ event, onClose }) {
  // useEffectを使わず、useStateの初期値として直接渡す
  // eventがnullのときはnull、あるときはそのコピーを初期値にする
  const [formData, setFormData] = useState(() => event ? { ...event } : null);

  // もしeventが渡されていない（モーダルが閉じてる）なら何も表示しない
  if (!event || !formData) return null;

  const handleUpdate = async () => {
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