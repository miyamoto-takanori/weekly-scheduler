export const CATEGORY_SETTINGS = {
  'バイト': { color: '#D1B9FF', hasTotal: true },
  '授業': { color: '#33CFFF', hasTotal: true },
  '筋トレ': { color: '#FFADAD', hasTotal: false },
  'キラ勉': { color: '#B9FBC0', hasTotal: true },
  'その他': { color: '#E2E2E2', hasTotal: false }
};

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 他にも、開始時間（6時）などのマジックナンバーを共通化しておくとメンテナンスが楽になります
export const START_HOUR = 6;
export const ROW_HEIGHT = 200; // 1時間あたりの高さ(px)