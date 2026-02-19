import React from 'react';
import { CATEGORY_SETTINGS } from '../constants';

export default function ScheduleItem({ event, onLongPress }) {
  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - 6) * 60 + m;
  };

  const top = getMinutes(event.startTime);
  const duration = getMinutes(event.endTime) - top;
  const color = CATEGORY_SETTINGS[event.category]?.color;
  
  // ② 短い（60分未満）時の判定
  const isShort = duration < 60;

  return (
    <div 
      className={`event-card-mobile ${isShort ? 'is-short' : ''}`} 
      style={{ top: `${top}px`, height: `${duration}px` }}
      onContextMenu={(e) => { e.preventDefault(); onLongPress(event); }} // PC/スマホ長押し
    >
      <div className="event-card-inner" style={{ borderLeftColor: color }}>
        <div className="event-category-sidebar" style={{ backgroundColor: color }}>
          <span className="vertical-cat-text">{event.category}</span>
        </div>
        <div className="event-info">
          <div className="event-main-title">{event.mainTitle}</div>
          {!isShort && <div className="event-sub-title">{event.subTitle}</div>}
          <div className="event-time-badge">{event.startTime}</div>
        </div>
      </div>
    </div>
  );
}