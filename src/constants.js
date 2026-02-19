export const CATEGORY_SETTINGS = {
  '授業': { color: '#29cdff', hasTotal: false },
  '考査': { color: '#ff4f4f', hasTotal: false },
  'バイト': { color: '#9861ff', hasTotal: false },
  'サークル': { color: '#ff9654', hasTotal: false },
  'イベント': { color: '#4fff4c', hasTotal: false },
  '筋トレ': { color: '#6d80f7', hasTotal: true },
  '予定': { color: '#fdb4b4', hasTotal: false },
  '勉強': { color: '#b2b2b2', hasTotal: true }
};

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 他にも、開始時間（6時）などのマジックナンバーを共通化しておくとメンテナンスが楽になります
export const START_HOUR = 6;
export const ROW_HEIGHT = 200; // 1時間あたりの高さ(px)