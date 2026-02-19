import React, { useRef } from 'react';
import { CATEGORY_SETTINGS, START_HOUR } from '../constants';

export default function ScheduleItem({ event, onLongPress }) {
  const timerRef = useRef(null);

  const handleTouchStart = () => {
    // スマホでの長押し判定 (500ms)
    timerRef.current = setTimeout(() => {
      onLongPress(event);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const getMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
  };

  const top = getMinutes(event.startTime);
  const duration = getMinutes(event.endTime) - top;
  const color = CATEGORY_SETTINGS[event.category]?.color;
  
  // 45分未満を「短い予定」と定義してスタイルを切り替え
  const isShort = duration < 45;

  return (
    <div 
      className={`event-card-mobile ${isShort ? 'is-short' : ''}`} 
      style={{ top: `${top}px`, height: `${duration}px` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart} // PCデバッグ用
      onMouseUp={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()} // 標準メニュー禁止
    >
      <div className="event-card-inner">
        <div className="event-category-sidebar" style={{ backgroundColor: color }}>
          <span className="vertical-cat-text">{event.category}</span>
        </div>
        <div className="event-info">
          <div className="event-main-title">{event.mainTitle}</div>
          {/* 短い予定のときはサブタイトルを非表示にして重なりを防ぐ */}
          {!isShort && <div className="event-sub-title">{event.subTitle}</div>}
          <div className="event-time-badge">
            {event.startTime} 〜 {event.endTime}
          </div>
        </div>
      </div>
    </div>
  );
}