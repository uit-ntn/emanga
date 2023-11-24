# eManga

Web khám phá **manga, manhwa, manhua**: bảng xếp hạng, tìm kiếm nâng cao, thông tin chi tiết, gợi ý truyện tương tự và nơi đọc chính thức. Không cần tài khoản, tủ truyện được lưu ngay trên trình duyệt.

Dữ liệu lấy từ [AniList GraphQL API](https://docs.anilist.co/) (công khai, hỗ trợ CORS), nên app chỉ cần frontend tĩnh, không có backend.

## Tính năng

- **Trang chủ**: carousel thịnh hành, đang hot, manhwa nổi bật, phổ biến mọi thời đại, điểm cao nhất, sắp ra mắt, lối tắt thể loại, "Bạn đang đọc".
- **Tìm kiếm tức thì** ở header (gợi ý khi gõ, điều hướng bằng bàn phím, `Ctrl + K`).
- **Khám phá**: lọc theo tình trạng, quốc gia, định dạng, năm; chọn hoặc loại trừ thể loại và tag; nhiều kiểu sắp xếp; bộ lọc đồng bộ với URL nên chia sẻ link được.
- **Trang truyện**: banner, điểm, độ phổ biến, xếp hạng, nơi đọc chính thức, nhân vật, truyện liên quan, gợi ý, tag (ẩn spoiler), biểu đồ phân bố điểm.
- **Tủ truyện**: trạng thái đọc, tiến độ chương, điểm cá nhân, sao lưu / khôi phục bằng file JSON.
- Giao diện sáng / tối / theo hệ thống, responsive, có skeleton loading và xử lý lỗi kèm nút thử lại.

## Công nghệ

| | |
|---|---|
| Build | [Vite 5](https://vitejs.dev/) |
| UI | React 18, [Tailwind CSS 3](https://tailwindcss.com/), [lucide-react](https://lucide.dev/) |
| Router | React Router 6 (lazy routes) |
| Data | [TanStack Query 5](https://tanstack.com/query) + AniList GraphQL |
| State | Store nhỏ dùng `useSyncExternalStore` + localStorage (đồng bộ giữa các tab) |
| Test / Lint | Vitest, ESLint |

## Bắt đầu

Yêu cầu Node.js 18 trở lên.

```bash
npm install
npm run dev        # http://localhost:3000
```

Các lệnh khác:

```bash
npm run build      # build production vào dist/
npm run preview    # chạy thử bản build
npm test           # unit test
npm run lint
```

Biến môi trường (tuỳ chọn, xem `.env.example`):

| Biến | Mặc định | Ghi chú |
|---|---|---|
| `VITE_ANILIST_API` | `https://graphql.anilist.co` | Đổi nếu dùng proxy hoặc cache riêng |

## Deploy

- **GitHub Actions** (khuyên dùng): workflow `.github/workflows/deploy.yml` tự lint, test, build và deploy lên GitHub Pages mỗi khi push vào `main`. Cần bật *Settings → Pages → Source: GitHub Actions*.
- **Thủ công**: `npm run deploy` (build với base `/emanga-fe/` và đẩy lên nhánh `gh-pages`).

`404.html` là bản sao của `index.html`, giúp các link sâu như `/manga/30013` vẫn mở được trên GitHub Pages.

## Cấu trúc thư mục

```
src/
  api/          client GraphQL + các query AniList
  components/   layout/, manga/, ui/
  hooks/        React Query hooks, debounce, theme, title
  lib/          chuẩn hoá dữ liệu, hằng số, định dạng
  pages/        Home, Browse, MangaDetail, Library, About, NotFound
  store/        settings + tủ truyện (localStorage)
```

## Lưu ý

AniList có giới hạn khoảng 90 request mỗi phút cho mỗi IP. Client đã tự thử lại khi gặp lỗi 429.

eManga không lưu trữ hay phát tán nội dung truyện. Hãy ủng hộ tác giả qua các nền tảng chính thức.

## Đóng góp

1. Fork repo và tạo nhánh: `git checkout -b feat/ten-tinh-nang`
2. Commit theo [Conventional Commits](https://www.conventionalcommits.org/)
3. Mở Pull Request
