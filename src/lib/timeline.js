/**
 * Development history shown on the About page, summarised from the git log
 * (github.com/uit-ntn/emanga-fe/commits/main). Newest phase last.
 */
export const PHASES = [
  {
    period: '02/09 – 10/09/2023',
    title: 'Khởi tạo dự án',
    summary:
      'Dựng bản đầu tiên bằng Create React App và Bootstrap, lấy dữ liệu từ MangaDex. Làm việc theo nhánh và Pull Request trên GitHub.',
    items: [
      { date: '02/09', author: 'Nhân', text: 'Khởi tạo ứng dụng (create app)' },
      { date: '02/09 – 05/09', author: 'Thi', text: 'Trang danh sách truyện và trang chi tiết truyện' },
      { date: '04/09', author: 'Nhân', text: 'Footer, README, cấu hình GitHub Pages' },
      { date: '05/09', author: 'Nhân', text: 'Sửa lỗi trang chủ' },
      { date: '06/09 – 08/09', author: 'Nhân', text: 'Thử nghiệm đăng ký và quên mật khẩu (sau này bỏ để web hoàn toàn công khai)' },
    ],
  },
  {
    period: '05/11 – 15/11/2023',
    title: 'Làm lại toàn bộ giao diện',
    summary: 'Chuyển sang Vite, Tailwind CSS và TanStack Query. Bỏ đăng nhập, ai cũng dùng được ngay.',
    items: [
      { date: '05/11', text: 'Chuyển từ CRA sang Vite + Tailwind, khung giao diện mới, chế độ sáng/tối' },
      { date: '07/11', text: 'Lớp gọi API có retry, chuẩn hoá dữ liệu, unit test với Vitest' },
      { date: '09/11', text: 'Trang chủ mới với carousel và ô tìm kiếm gợi ý tức thì' },
      { date: '12/11', text: 'Trang Khám phá: bộ lọc nâng cao đồng bộ với URL, phân trang' },
      { date: '15/11', text: 'Trang chi tiết truyện và danh sách chương' },
    ],
  },
  {
    period: '18/11 – 26/11/2023',
    title: 'Đổi nguồn dữ liệu, thêm tủ truyện',
    summary:
      'MangaDex chặn request từ trình duyệt trên website khác, nên phần thông tin truyện chuyển sang AniList GraphQL (công khai, hỗ trợ CORS).',
    items: [
      { date: '18/11', text: 'Chuyển sang AniList: xếp hạng, nhân vật, truyện liên quan, gợi ý, biểu đồ điểm' },
      { date: '21/11', text: 'Tủ truyện cá nhân lưu trên trình duyệt: trạng thái, tiến độ, điểm, sao lưu JSON' },
      { date: '24/11', text: 'Trang Giới thiệu, README mới' },
      { date: '26/11', text: 'Ghi tên nhóm phát triển ở footer' },
    ],
  },
  {
    period: '28/11 – 02/12/2023',
    title: 'Backend và trình đọc truyện',
    summary: 'Thêm backend nhỏ trên AWS Lambda để đọc chương truyện ngay trên web, deploy toàn bộ bằng AWS Amplify.',
    items: [
      { date: '28/11', text: 'Backend đọc truyện (Amplify Gen 2 + Lambda): cache, giới hạn tốc độ, chống SSRF' },
      { date: '30/11', text: 'Trình đọc: cuộn dọc / từng trang, phím tắt, nhớ trang đang đọc' },
      { date: '02/12', text: 'Deploy frontend và backend bằng AWS Amplify' },
    ],
  },
];

export const STATS = [
  { value: '25+', label: 'commit' },
  { value: '15', label: 'Pull Request' },
  { value: '4', label: 'giai đoạn' },
  { value: '2', label: 'thành viên' },
];
