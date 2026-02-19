import React, { useState, useMemo } from 'react';
import './App.css';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_SETTINGS, WEEKDAYS, START_HOUR } from './constants';

// 分割したコンポーネントのインポート
import ScheduleItem from './components/ScheduleItem';
import AddModal from './components/AddModal';
import EditModal from './components/EditModal';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  
  // モーダル管理State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // 1時間あたりの高さ(px)をここで一括管理（短い予定を見やすくするために80pxに設定）
  const ROW_HEIGHT = 80;

  // データ取得
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

  const getMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
  };

  const totalText = useMemo(() => {
    const mins = events
      .filter(e => CATEGORY_SETTINGS[e.category]?.hasTotal)
      .reduce((acc, e) => acc + (getMinutes(e.endTime) - getMinutes(e.startTime)), 0);
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  }, [events]);

  return (
    // --row-height という名前で CSS変数を流し込む
    <div className="app-layout" style={{ '--row-height': `${ROW_HEIGHT}px` }}>
      {/* ヘッダーエリア */}
      <header className="page-header">
        <div className="header-badge">Weekly Schedule</div>
        <div className="header-top-row">
          <button className="nav-btn" onClick={() => changeDate(-1)}>◀</button>
          <div className="header-center">
            <h1 className="header-title">
              {selectedDate.getMonth() + 1}/{selectedDate.getDate()} 
              <span className="day-label"> ({WEEKDAYS[selectedDate.getDay()]})</span>
            </h1>
            <div className="header-total">Total: {totalText}</div>
          </div>
          <button className="nav-btn" onClick={() => changeDate(1)}>▶</button>
        </div>
      </header>

      {/* スワイプ・コンテンツエリア */}
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
            // ↓ ここを追加：指を80px以上横に動かさない限りドラッグを開始しない
            dragDirectionLock
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x > 100) changeDate(-1);
              else if (offset.x < -100) changeDate(1);
            }}
            className="single-day-board"
          >
            {/* 時間軸ラベル列 */}
            <div className="time-column">
              {Array.from({ length: 19 }, (_, i) => (
                <div key={i} className="time-cell">
                  <span className="time-number">{i + START_HOUR}</span>
                </div>
              ))}
            </div>

            {/* 予定描画エリア：背景のグリッドサイズも ROW_HEIGHT に合わせる */}
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
                  rowHeight={ROW_HEIGHT} // コンポーネントに高さを渡す
                  onLongPress={(ev) => setEditingEvent(ev)} 
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 浮遊ボタン (FAB) */}
      <button className="fab-button" onClick={() => setIsAddModalOpen(true)}>+</button>

      {/* 各種モーダル */}
      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        dateString={dateString}
        existingEvents={events}
      />

      {/* ここがポイント： key を付けることで、別の予定を選択するたびに
        EditModal が新しく作り直され、useEffectなしでもStateが正しく初期化されます。
      */}
      <EditModal 
        key={editingEvent?.id || 'empty'}
        event={editingEvent} 
        onClose={() => setEditingEvent(null)} 
      />
    </div>
  );
}

export default App;