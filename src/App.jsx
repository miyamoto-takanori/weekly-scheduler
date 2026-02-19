import React, { useMemo } from 'react';
import './App.css';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

// カテゴリ設定（色と集計対象の有無）
const CATEGORY_SETTINGS = {
  'バイト': { color: '#D1B9FF', hasTotal: true }, // 写真に近い薄紫
  '授業': { color: '#33CFFF', hasTotal: true },   // 写真に近い水色
  '筋トレ': { color: '#FFADAD', hasTotal: false },
  'キラ勉': { color: '#B9FBC0', hasTotal: true },
  'その他': { color: '#E2E2E2', hasTotal: false }
};

function App() {
  // 1. 今週の月曜日〜日曜日の日付を算出
  const weekDates = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now.setDate(now.getDate() + diffToMon));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  }, []);

  // 2. データベースから予定を取得
  const events = useLiveQuery(() => db.events.toArray()) || [];

  // 時刻文字列（"08:00"）を分（6:00起点）に変換
  const getMinutesFromStart = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h - 6) * 60 + m;
  };

  // 特定の日の合計時間を計算する関数
  const calculateDailyTotal = (dayEvents) => {
    const totalMinutes = dayEvents
      .filter(e => CATEGORY_SETTINGS[e.category]?.hasTotal)
      .reduce((acc, e) => {
        const duration = getMinutesFromStart(e.endTime) - getMinutesFromStart(e.startTime);
        return acc + (duration > 0 ? duration : 0);
      }, 0);
    
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0 && m === 0) return "0min";
    return m === 0 ? `${h}h` : `${h}h ${m}min`;
  };

  const timeLabels = Array.from({ length: 19 }, (_, i) => i + 6);

  return (
    <div className="app-container">
      <header className="header">
        <h1>週間予定シート</h1>
      </header>
      
      <div className="schedule-board">
        <div className="time-column">
          <div className="header-cell">時間</div>
          {timeLabels.map(hour => (
            <div key={hour} className="time-label">{hour}:00</div>
          ))}
        </div>

        {weekDates.map((date, i) => {
          const dateString = date.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateString);

          return (
            <div key={i} className="day-column">
              <div className="header-cell">
                <div className="date-info">
                  <span className="date-text">
                    {date.getMonth() + 1}/{date.getDate()} ({['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})
                  </span>
                  <span className="total-time">{calculateDailyTotal(dayEvents)}</span>
                </div>
              </div>
              <div className="grid-body">
                {dayEvents.map(event => {
                  const top = getMinutesFromStart(event.startTime);
                  const duration = getMinutesFromStart(event.endTime) - top;
                  const themeColor = CATEGORY_SETTINGS[event.category]?.color || '#E2E2E2';

                  return (
                    <div 
                      key={event.id} 
                      className="event-item"
                      style={{
                        top: `${top}px`,
                        height: `${duration}px`,
                      }}
                    >
                      {/* 左側のカテゴリ垂直ラベル */}
                      <div className="event-category-bar" style={{ backgroundColor: themeColor }}>
                        <span className="category-text">{event.category}</span>
                      </div>
                      {/* 右側の詳細情報 */}
                      <div className="event-details">
                        <span className="event-main" style={{ color: themeColor === '#33CFFF' ? '#007bb0' : 'inherit' }}>
                          {event.mainTitle}
                        </span>
                        <span className="event-sub-info">
                          {event.subTitle}
                          <div className="event-time-range">{event.startTime}-{event.endTime}</div>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <button className="fab" onClick={() => {
        const cat = prompt("カテゴリ (授業, バイト, 筋トレ, キラ勉, その他)", "授業");
        const main = prompt("メインタイトル", "計算機科学実験及演習4");
        if(main) {
          db.events.add({
            date: new Date().toISOString().split('T')[0],
            category: cat || 'その他',
            mainTitle: main,
            subTitle: '第07講',
            startTime: '13:00',
            endTime: '16:00'
          });
        }
      }}>+</button>
    </div>
  );
}

export default App;