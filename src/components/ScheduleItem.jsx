import React, { useRef } from 'react';
import { CATEGORY_SETTINGS, START_HOUR } from '../constants';

export default function ScheduleItem({ event, onLongPress, rowHeight }) {
  const timerRef = useRef(null);

  const handleTouchStart = () => {
    // 500ms後に長押し判定。それまでに指が動いたり離れたらキャンセル
    timerRef.current = setTimeout(() => {
      onLongPress(event);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // 指が動いたら長押しをキャンセル（これで縦スクロールを邪魔しなくなる）
  const handleTouchMove = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
  };

  const top = (getMinutes(event.startTime) / 60) * rowHeight;
  const duration = ((getMinutes(event.endTime) - getMinutes(event.startTime)) / 60) * rowHeight;
  
  // カテゴリ設定から色を取得
  const catColor = CATEGORY_SETTINGS[event.category]?.color || '#ddd';

  return (
    <div 
      className="event-card-mobile" 
      style={{ top: `${top}px`, height: `${duration}px` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove} // 追加
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="event-card-inner">
        {/* ① カテゴリ色の反映 */}
        <div className="event-category-sidebar" style={{ backgroundColor: catColor }}>
          <span className="vertical-cat-text">{event.category}</span>
        </div>
        <div className="event-info">
          {/* ② タイトル色をカテゴリ色に合わせる */}
          <div className="event-main-title" style={{ color: catColor }}>
            {event.mainTitle}
          </div>
          <div className="event-sub-title">{event.subTitle}</div>
          <div className="event-time-badge">
            {event.startTime} 〜 {event.endTime}
          </div>
        </div>
      </div>
    </div>
  );
}