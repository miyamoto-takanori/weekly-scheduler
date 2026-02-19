import React, { useRef } from 'react';
import { START_HOUR } from '../constants';

export default function ScheduleItem({ event, onLongPress, rowHeight }) {
  const timerRef = useRef(null);

  // スマホ用長押しロジック
  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      onLongPress(event);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
  };

  // rowHeight(1時間あたりのpx) を基準に計算
  const top = (getMinutes(event.startTime) / 60) * rowHeight;
  const duration = ((getMinutes(event.endTime) - getMinutes(event.startTime)) / 60) * rowHeight;

  return (
    <div 
      className="event-card-mobile" 
      style={{ top: `${top}px`, height: `${duration}px` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="event-card-inner">
        <div className="event-category-sidebar" style={{ backgroundColor: event.color }}>
          <span className="vertical-cat-text">{event.category}</span>
        </div>
        <div className="event-info">
          <div className="event-main-title">{event.mainTitle}</div>
          <div className="event-sub-title">{event.subTitle}</div>
          <div className="event-time-badge">
            {event.startTime} 〜 {event.endTime}
          </div>
        </div>
      </div>
    </div>
  );
}