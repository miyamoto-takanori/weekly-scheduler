import React, { useState } from 'react';
import { db } from '../db';
import { CATEGORY_SETTINGS } from '../constants';

export default function AddModal({ isOpen, onClose, dateString, existingEvents }) {
  const [formData, setFormData] = useState({
    category: '授業', mainTitle: '', subTitle: '', startTime: '09:00', endTime: '10:00'
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.mainTitle) return;

    const newStart = formData.startTime;
    const newEnd = formData.endTime;
    const isOverlapping = existingEvents.some(e => (newStart < e.endTime && newEnd > e.startTime));

    if (isOverlapping) {
      alert("その時間帯には既に予定が入っています。");
      return;
    }

    await db.events.add({ ...formData, date: dateString });
    onClose();
    setFormData({ ...formData, mainTitle: '', subTitle: '', startTime: '09:00', endTime: '10:00' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>予定の追加</h3></div>
        <div className="edit-form">
          <div className="form-section">
            <label className="form-label">Category</label>
            <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {Object.keys(CATEGORY_SETTINGS).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-section">
            <label className="form-label">Main Title</label>
            <input className="input-field" type="text" value={formData.mainTitle} onChange={e => setFormData({...formData, mainTitle: e.target.value})} placeholder="例: 数学" />
          </div>
          <div className="form-section">
            <label className="form-label">Sub Title</label>
            <input className="input-field" type="text" value={formData.subTitle} onChange={e => setFormData({...formData, subTitle: e.target.value})} placeholder="例: 第05講" />
          </div>
          <div className="form-section">
            <label className="form-label">Start Time</label>
            <input type="time" className="input-field" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
          </div>
          <div className="form-section">
            <label className="form-label">End Time</label>
            <input type="time" className="input-field" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>キャンセル</button>
          <button className="save-btn" onClick={handleSave}>保存する</button>
        </div>
      </div>
    </div>
  );
}