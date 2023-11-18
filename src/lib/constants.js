export const STATUS = {
  RELEASING: { label: 'Đang phát hành', color: 'bg-emerald-500' },
  FINISHED: { label: 'Hoàn thành', color: 'bg-sky-500' },
  HIATUS: { label: 'Tạm ngưng', color: 'bg-amber-500' },
  NOT_YET_RELEASED: { label: 'Sắp ra mắt', color: 'bg-violet-500' },
  CANCELLED: { label: 'Đã huỷ', color: 'bg-zinc-500' },
};

export const FORMATS = {
  MANGA: 'Manga',
  ONE_SHOT: 'Oneshot',
  NOVEL: 'Light novel',
};

export const COUNTRIES = {
  JP: 'Manga (Nhật)',
  KR: 'Manhwa (Hàn)',
  CN: 'Manhua (Trung)',
  TW: 'Đài Loan',
};

export const SORT_OPTIONS = {
  POPULARITY_DESC: 'Phổ biến nhất',
  TRENDING_DESC: 'Đang thịnh hành',
  SCORE_DESC: 'Điểm cao nhất',
  FAVOURITES_DESC: 'Yêu thích nhiều',
  START_DATE_DESC: 'Mới nhất',
  START_DATE: 'Cũ nhất',
  TITLE_ROMAJI: 'Tên A → Z',
  SEARCH_MATCH: 'Liên quan nhất',
};

export const GENRE_VI = {
  Action: 'Hành động',
  Adventure: 'Phiêu lưu',
  Comedy: 'Hài hước',
  Drama: 'Chính kịch',
  Ecchi: 'Ecchi',
  Fantasy: 'Giả tưởng',
  Horror: 'Kinh dị',
  'Mahou Shoujo': 'Ma pháp thiếu nữ',
  Mecha: 'Mecha',
  Music: 'Âm nhạc',
  Mystery: 'Bí ẩn',
  Psychological: 'Tâm lý',
  Romance: 'Lãng mạn',
  'Sci-Fi': 'Khoa học viễn tưởng',
  'Slice of Life': 'Đời thường',
  Sports: 'Thể thao',
  Supernatural: 'Siêu nhiên',
  Thriller: 'Giật gân',
};

export const genreLabel = (g) => GENRE_VI[g] ?? g;

export const RELATION_LABELS = {
  ADAPTATION: 'Chuyển thể',
  PREQUEL: 'Phần trước',
  SEQUEL: 'Phần sau',
  PARENT: 'Truyện gốc',
  SIDE_STORY: 'Ngoại truyện',
  CHARACTER: 'Chung nhân vật',
  SUMMARY: 'Tóm tắt',
  ALTERNATIVE: 'Phiên bản khác',
  SPIN_OFF: 'Spin-off',
  OTHER: 'Khác',
  SOURCE: 'Nguyên tác',
  COMPILATION: 'Tuyển tập',
  CONTAINS: 'Bao gồm',
};

export const ROLE_LABELS = {
  MAIN: 'Chính',
  SUPPORTING: 'Phụ',
  BACKGROUND: 'Nền',
  'Story & Art': 'Tác giả & Hoạ sĩ',
  Story: 'Tác giả',
  Art: 'Hoạ sĩ',
};

export const SOURCE_LABELS = {
  ORIGINAL: 'Nguyên tác',
  LIGHT_NOVEL: 'Light novel',
  NOVEL: 'Tiểu thuyết',
  WEB_NOVEL: 'Web novel',
  VIDEO_GAME: 'Trò chơi',
  OTHER: 'Khác',
  MANGA: 'Manga',
  ANIME: 'Anime',
  VISUAL_NOVEL: 'Visual novel',
  DOUJINSHI: 'Doujinshi',
};
