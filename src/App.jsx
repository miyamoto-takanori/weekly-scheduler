import React, { useState, useMemo } from 'react';
import './App.css';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_SETTINGS = {
  'バイト': { color: '#D1B9FF', hasTotal: true },
  '授業': { color: '#33CFFF', hasTotal: true },
  '筋トレ': { color: '#FFADAD', hasTotal: false },
  'キラ勉': { color: '#B9FBC0', hasTotal: true },
  'その他': { color: '#E2E2E2', hasTotal: false }
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direction, setDirection] = useState(0); 
  const [formData, setFormData] = useState({
    category: '授業', mainTitle: '', subTitle: '', startTime: '09:00', endTime: '10:00'
  });

  const dateString = selectedDate.toISOString().split('T')[0];
  const events = useLiveQuery(() => db.events.where('date').equals(dateString).toArray(), [dateString]) || [];

  const changeDate = (offset) => {
    setDirection(offset);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(nextDate);
  };

  const getMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h - 6) * 60 + m;
  };

  const totalText = useMemo(() => {
    const mins = events.filter(e => CATEGORY_SETTINGS[e.category]?.hasTotal)
      .reduce((acc, e) => acc + (getMinutes(e.endTime) - getMinutes(e.startTime)), 0);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}min`;
  }, [events]);

  return (
    <div className="app-layout">
      {/* 過去コードの知見を活かしたヘッダー */}
      <header className="page-header">
        <div className="header-badge">Weekly Schedule</div>
        <div className="header-top-row">
          <button className="nav-btn" onClick={() => changeDate(-1)}>◀</button>
          <div className="header-center">
            <h1 className="header-title">
              {selectedDate.getMonth() + 1}/{selectedDate.getDate()} 
              <span className="day-label"> ({['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]})</span>
            </h1>
            <div className="header-total">Total: {totalText}</div>
          </div>
          <button className="nav-btn" onClick={() => changeDate(1)}>▶</button>
        </div>
      </header>

      <main className="swipe-container">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={dateString}
            custom={direction}
            variants={{
              enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset }) => {
              if (offset.x > 80) changeDate(-1);
              else if (offset.x < -80) changeDate(1);
            }}
            className="single-day-board"
          >
            <div className="time-column">
              {Array.from({ length: 19 }, (_, i) => (
                <div key={i} className="time-cell">
                  <span className="time-number">{i + 6}</span>
                </div>
              ))}
            </div>
            <div className="grid-body">
              {events.map(event => {
                const top = getMinutes(event.startTime);
                const height = getMinutes(event.endTime) - top;
                const color = CATEGORY_SETTINGS[event.category]?.color;
                return (
                  <div key={event.id} className="event-card-mobile" style={{ top: `${top}px`, height: `${height}px` }}>
                    <div className="event-card-inner" style={{ borderLeftColor: color }}>
                      <div className="event-category-sidebar" style={{ backgroundColor: color }}>
                        <span className="vertical-cat-text">{event.category}</span>
                      </div>
                      <div className="event-info">
                        <div className="event-main-title">{event.mainTitle}</div>
                        <div className="event-sub-title">{event.subTitle}</div>
                        <div className="event-time-badge">{event.startTime} - {event.endTime}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <button className="fab-button" onClick={() => setIsModalOpen(true)}>+</button>

      {/* モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="modal-header">
                <h3>予定の追加</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <div className="edit-form">
                <div className="form-section">
                  <span className="form-label">Category</span>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {Object.keys(CATEGORY_SETTINGS).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-section">
                  <span className="form-label">Main Title</span>
                  <input className="input-field" type="text" placeholder="例: 数学" value={formData.mainTitle} onChange={e => setFormData({...formData, mainTitle: e.target.value})} />
                </div>
                <div className="form-section">
                  <span className="form-label">Sub Title</span>
                  <input className="input-field" type="text" placeholder="例: 第05講" value={formData.subTitle} onChange={e => setFormData({...formData, subTitle: e.target.value})} />
                </div>
                <div className="form-section row">
                  <div style={{flex:1}}>
                    <span className="form-label">Start</span>
                    <input className="input-field" type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                  <div style={{flex:1}}>
                    <span className="form-label">End</span>
                    <input className="input-field" type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>キャンセル</button>
                <button className="save-btn" onClick={async () => {
                  if(!formData.mainTitle) return;
                  await db.events.add({ ...formData, date: dateString });
                  setIsModalOpen(false);
                  setFormData({ ...formData, mainTitle: '', subTitle: '' });
                }}>保存する</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;