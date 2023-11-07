export const LANGUAGES = {
  vi: 'Tiếng Việt',
  en: 'English',
  ja: '日本語',
  'ja-ro': 'Romaji',
  ko: '한국어',
  zh: '中文',
  'zh-hk': '中文 (HK)',
  'es-la': 'Español (LATAM)',
  es: 'Español',
  fr: 'Français',
  'pt-br': 'Português (BR)',
  id: 'Bahasa Indonesia',
  th: 'ไทย',
  ru: 'Русский',
  de: 'Deutsch',
  it: 'Italiano',
};

export const STATUS = {
  ongoing: { label: 'Đang tiến hành', color: 'bg-emerald-500' },
  completed: { label: 'Hoàn thành', color: 'bg-sky-500' },
  hiatus: { label: 'Tạm ngưng', color: 'bg-amber-500' },
  cancelled: { label: 'Đã huỷ', color: 'bg-zinc-500' },
};

export const DEMOGRAPHICS = {
  shounen: 'Shounen',
  shoujo: 'Shoujo',
  seinen: 'Seinen',
  josei: 'Josei',
  none: 'Khác',
};

export const CONTENT_RATINGS = {
  safe: 'An toàn',
  suggestive: 'Gợi cảm',
  erotica: 'Nhạy cảm',
};

export const SORT_OPTIONS = {
  relevance: { label: 'Liên quan nhất', order: { relevance: 'desc' } },
  followedCount: { label: 'Theo dõi nhiều', order: { followedCount: 'desc' } },
  latestUploadedChapter: { label: 'Mới cập nhật', order: { latestUploadedChapter: 'desc' } },
  createdAt: { label: 'Mới thêm', order: { createdAt: 'desc' } },
  rating: { label: 'Đánh giá cao', order: { rating: 'desc' } },
  title: { label: 'Tên A → Z', order: { title: 'asc' } },
  year: { label: 'Năm phát hành', order: { year: 'desc' } },
};

export const TAG_GROUP_LABELS = {
  genre: 'Thể loại',
  theme: 'Chủ đề',
  format: 'Định dạng',
  content: 'Nội dung',
};
