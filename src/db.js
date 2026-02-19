import Dexie from 'dexie';

export const db = new Dexie('WeeklySchedulerDB');

// データベースのスキーマ定義
db.version(1).stores({
  events: '++id, date, category, startTime, endTime' // 検索によく使う項目をインデックス化
});