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
    <div className="app-container">
      <header className="mobile-header">
        <div className="header-top">
          <button className="nav-btn" onClick={() => changeDate(-1)}>◀</button>
          <div className="header-center">
            <div className="date-display">
              {selectedDate.getMonth() + 1}/{selectedDate.getDate()} ({['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]})
            </div>
            <div className="total-display">Total: {totalText}</div>
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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset }) => {
              if (offset.x > 100) changeDate(-1);
              else if (offset.x < -100) changeDate(1);
            }}
            className="single-day-board"
          >
            <div className="time-column-mini">
              {Array.from({ length: 19 }, (_, i) => (
                <div key={i} className="time-label-mini"><span>{i + 6}</span></div>
              ))}
            </div>
            <div className="grid-body-main">
              {events.map(event => {
                const top = getMinutes(event.startTime);
                const height = getMinutes(event.endTime) - top;
                const color = CATEGORY_SETTINGS[event.category]?.color;
                return (
                  <div key={event.id} className="event-item-mobile" style={{ top: `${top}px`, height: `${height}px`, borderLeft: `6px solid ${color}` }}>
                    <div className="event-cat-vertical" style={{ backgroundColor: color }}>{event.category}</div>
                    <div className="event-content">
                      <div className="event-main-text">{event.mainTitle}</div>
                      <div className="event-sub-text">{event.subTitle}</div>
                      <div className="event-time-text">{event.startTime}-{event.endTime}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <button className="fab" onClick={() => setIsModalOpen(true)}>+</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>予定を追加</h3>
            <label>カテゴリ</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {Object.keys(CATEGORY_SETTINGS).map(c => <option key={c}>{c}</option>)}
            </select>
            <label>メインタイトル</label>
            <input type="text" placeholder="例: ソフトウェア工学" value={formData.mainTitle} onChange={e => setFormData({...formData, mainTitle: e.target.value})} />
            <label>サブタイトル</label>
            <input type="text" placeholder="例: 第03講" value={formData.subTitle} onChange={e => setFormData({...formData, subTitle: e.target.value})} />
            <div className="row">
              <div style={{flex:1}}>
                <label>開始</label>
                <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <span>〜</span>
              <div style={{flex:1}}>
                <label>終了</label>
                <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>
            <div className="modal-btns">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>キャンセル</button>
              <button className="save-btn" onClick={async () => {
                await db.events.add({ ...formData, date: dateString });
                setIsModalOpen(false);
                setFormData({ ...formData, mainTitle: '', subTitle: '' }); // フォームリセット
              }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;