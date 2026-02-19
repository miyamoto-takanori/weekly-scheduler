import React, { useMemo } from 'react';
import './App.css';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

// カテゴリごとの配色設定（PDFのイメージに合わせて）
const CATEGORY_SETTINGS = {
  'バイト': { color: '#FFE599' },
  '勉強': { color: '#D0E2F3' },
  '筋トレ': { color: '#EAD1DC' },
  'その他': { color: '#E2E2E2' }
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

  // 時間軸（6:00〜24:00まで1時間ごと）
  const timeLabels = Array.from({ length: 19 }, (_, i) => i + 6);

  // 時刻文字列（"08:00"）を分（6:00起点）に変換する関数
  const getMinutesFromStart = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h - 6) * 60 + m;
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>週間予定シート</h1>
      </header>
      
      <div className="schedule-board">
        {/* 左側の時間軸列 */}
        <div className="time-column">
          <div className="header-cell">時間</div>
          {timeLabels.map(hour => (
            <div key={hour} className="time-label">{hour}:00</div>
          ))}
        </div>

        {/* 月〜日の各列 */}
        {weekDates.map((date, i) => {
          // YYYY-MM-DD形式に変換
          const dateString = date.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateString);

          return (
            <div key={i} className="day-column">
              <div className="header-cell">
                {date.getMonth() + 1}/{date.getDate()}
                ({['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})
              </div>
              <div className="grid-body">
                {dayEvents.map(event => {
                  const top = getMinutesFromStart(event.startTime);
                  const duration = getMinutesFromStart(event.endTime) - top;
                  const bgColor = CATEGORY_SETTINGS[event.category]?.color || '#fff';

                  return (
                    <div 
                      key={event.id} 
                      className="event-item"
                      style={{
                        top: `${top}px`,
                        height: `${duration}px`,
                        backgroundColor: bgColor
                      }}
                    >
                      <span className="event-category">{event.category}</span>
                      <span className="event-main">{event.mainTitle}</span>
                      <span className="event-sub">{event.subTitle}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 簡易入力テスト用ボタン */}
      <button className="fab" onClick={() => {
        const testTitle = prompt("メインタイトルを入力してください", "ソフトウェア工学");
        if(testTitle) {
          db.events.add({
            date: new Date().toISOString().split('T')[0], // 今日
            category: '勉強',
            mainTitle: testTitle,
            subTitle: '第01講',
            startTime: '09:00',
            endTime: '10:30'
          });
        }
      }}>+</button>
    </div>
  );
}

export default App;