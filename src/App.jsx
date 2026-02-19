import React, { useState, useMemo } from 'react';
import './App.css';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_SETTINGS, WEEKDAYS, START_HOUR } from './constants';

import ScheduleItem from './components/ScheduleItem';
import AddModal from './components/AddModal';
import EditModal from './components/EditModal';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const ROW_HEIGHT = 80;

  const dateString = selectedDate.toISOString().split('T')[0];
  const events = useLiveQuery(() => 
    db.events.where('date').equals(dateString).toArray(), 
    [dateString]
  ) || [];

  const changeDate = (offset) => {
    setDirection(offset);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(nextDate);
  };

  // 時刻文字列を「開始時間(START_HOUR)からの経過分」に変換する関数
  const getMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
  };

  // カテゴリ別の集計ロジック (getMinutesを使用するように修正)
  const categoryTotals = useMemo(() => {
    const totals = {};
    events.forEach(e => {
      if (CATEGORY_SETTINGS[e.category]?.hasTotal) {
        // getMinutesを使うことでロジックを統一
        const duration = getMinutes(e.endTime) - getMinutes(e.startTime);
        totals[e.category] = (totals[e.category] || 0) + duration;
      }
    });
    return totals;
  }, [events]);

  const formatMins = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="app-layout" style={{ '--row-height': `${ROW_HEIGHT}px` }}>
      <header className="page-header">
        <div className="header-badge">Weekly Schedule</div>
        <div className="header-top-row">
          <button className="nav-btn" onClick={() => changeDate(-1)}>◀</button>
          <div className="header-center">
            <h1 className="header-title">
              {selectedDate.getMonth() + 1}/{selectedDate.getDate()} 
              <span className="day-label"> ({WEEKDAYS[selectedDate.getDay()]})</span>
            </h1>
            <div className="header-totals-container">
              {Object.entries(categoryTotals).map(([cat, mins]) => (
                <div key={cat} className="header-total-pill">
                  <span className="pill-dot" style={{ backgroundColor: CATEGORY_SETTINGS[cat]?.color }}></span>
                  <span className="pill-text">{cat}: {formatMins(mins)}</span>
                </div>
              ))}
            </div>
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
            dragElastic={0.2}
            dragDirectionLock
            onDragEnd={(e, { offset }) => {
              if (offset.x > 100) changeDate(-1);
              else if (offset.x < -100) changeDate(1);
            }}
            className="single-day-board"
          >
            <div className="time-column">
              {Array.from({ length: 19 }, (_, i) => (
                <div key={i} className="time-cell">
                  <span className="time-number">{i + START_HOUR}</span>
                </div>
              ))}
            </div>

            <div 
              className="grid-body" 
              style={{ 
                backgroundSize: `100% ${ROW_HEIGHT}px`,
                minHeight: `${ROW_HEIGHT * 19}px` 
              }}
            >
              {events.map(event => (
                <ScheduleItem 
                  key={event.id} 
                  event={event} 
                  rowHeight={ROW_HEIGHT}
                  onLongPress={(ev) => setEditingEvent(ev)} 
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <button className="fab-button" onClick={() => setIsAddModalOpen(true)}>+</button>

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        dateString={dateString}
        existingEvents={events}
      />

      <EditModal 
        key={editingEvent?.id || 'empty'}
        event={editingEvent} 
        onClose={() => setEditingEvent(null)} 
        existingEvents={events}
      />
    </div>
  );
}

export default App;