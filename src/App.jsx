import React, { useState, useMemo } from 'react';
import './App.css';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

const CATEGORY_SETTINGS = {
  'バイト': { color: '#D1B9FF', hasTotal: true },
  '授業': { color: '#33CFFF', hasTotal: true },
  '筋トレ': { color: '#FFADAD', hasTotal: false },
  'キラ勉': { color: '#B9FBC0', hasTotal: true },
  'その他': { color: '#E2E2E2', hasTotal: false }
};

function App() {
  // 表示中の日付を管理（初期値は今日）
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '授業', mainTitle: '', subTitle: '', startTime: '09:00', endTime: '10:00'
  });

  const dateString = selectedDate.toISOString().split('T')[0];
  const events = useLiveQuery(() => db.events.where('date').equals(dateString).toArray(), [dateString]) || [];

  const changeDate = (offset) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(nextDate);
  };

  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - 6) * 60 + m;
  };

  const totalText = useMemo(() => {
    const mins = events.filter(e => CATEGORY_SETTINGS[e.category]?.hasTotal)
      .reduce((acc, e) => acc + (getMinutes(e.endTime) - getMinutes(e.startTime)), 0);
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  }, [events]);

  return (
    <div className="app-container">
      <header className="mobile-header">
        <button onClick={() => changeDate(-1)}>◀</button>
        <div className="header-center">
          <div className="date-display">
            {selectedDate.getMonth() + 1}/{selectedDate.getDate()} ({['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]})
          </div>
          <div className="total-display">Total: {totalText}</div>
        </div>
        <button onClick={() => changeDate(1)}>▶</button>
      </header>

      <div className="single-day-board">
        <div className="time-column-mini">
          {Array.from({ length: 19 }, (_, i) => (
            <div key={i} className="time-label-mini">{i + 6}</div>
          ))}
        </div>
        <div className="grid-body-main">
          {events.map(event => {
            const top = getMinutes(event.startTime);
            const height = getMinutes(event.endTime) - top;
            const color = CATEGORY_SETTINGS[event.category]?.color;
            return (
              <div key={event.id} className="event-item-mobile" style={{ top, height, borderLeft: `5px solid ${color}` }}>
                <div className="event-cat-vertical" style={{ backgroundColor: color }}>{event.category}</div>
                <div className="event-content">
                  <div className="event-main-text">{event.mainTitle}</div>
                  <div className="event-sub-text">{event.subTitle} ({event.startTime}-{event.endTime})</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="fab" onClick={() => setIsModalOpen(true)}>+</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>予定を追加</h3>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {Object.keys(CATEGORY_SETTINGS).map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="メインタイトル" onChange={e => setFormData({...formData, mainTitle: e.target.value})} />
            <input type="text" placeholder="サブタイトル" onChange={e => setFormData({...formData, subTitle: e.target.value})} />
            <div className="row">
              <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
              <span>〜</span>
              <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
            </div>
            <div className="modal-btns">
              <button onClick={() => setIsModalOpen(false)}>キャンセル</button>
              <button className="save-btn" onClick={async () => {
                await db.events.add({ ...formData, date: dateString });
                setIsModalOpen(false);
              }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;