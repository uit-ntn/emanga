# eManga

Web khám phá và đọc **manga, manhwa, manhua**: bảng xếp hạng, tìm kiếm nâng cao, thông tin chi tiết, gợi ý, đọc truyện ngay trên web và tủ truyện cá nhân. Không cần tài khoản.

Phát triển bởi **Nguyễn Thanh Nhân** và **Quãng Đại Thi**, sinh viên Đại học Quốc gia Thành phố Hồ Chí Minh.

## Tính năng

- **Trang chủ**: carousel thịnh hành, đang hot, manhwa nổi bật, phổ biến mọi thời đại, điểm cao nhất, sắp ra mắt, lối tắt thể loại, "Bạn đang đọc".
- **Tìm kiếm tức thì** ở header (gợi ý khi gõ, điều hướng bằng bàn phím, `Ctrl + K`).
- **Khám phá**: lọc theo tình trạng, quốc gia, định dạng, năm; chọn hoặc loại trừ thể loại và tag; bộ lọc đồng bộ với URL.
- **Trang truyện**: banner, điểm, xếp hạng, nhân vật, truyện liên quan, gợi ý, tag (ẩn spoiler), biểu đồ điểm, link bản chính thức.
- **Đọc truyện**: chọn ngôn ngữ bản dịch, danh sách chương; trình đọc cuộn dọc hoặc từng trang, phím tắt, tiết kiệm dữ liệu, nhớ trang đang đọc.
- **Tủ truyện**: trạng thái đọc, tiến độ (tự cập nhật khi đọc), điểm cá nhân, sao lưu / khôi phục bằng file JSON.
- Giao diện sáng / tối, responsive, skeleton loading, xử lý lỗi kèm nút thử lại.

## Kiến trúc

```
                ┌──────────────────────────── AWS Amplify ────────────────────────────┐
Trình duyệt ──► │  Hosting (dist/, React SPA)                                         │
     │          │  Lambda "reader-api" + Function URL  ──►  api.mangadex.org          │
     │          │      /lookup /feed /chapter /image   ──►  MangaDex@Home (ảnh)       │
     │          └─────────────────────────────────────────────────────────────────────┘
     └──────────────────────────────────────────────────►  graphql.anilist.co (CORS)
```

- **AniList** (thông tin, ảnh bìa, tìm kiếm) được gọi thẳng từ trình duyệt.
- **MangaDex** không cho website bên thứ ba gọi API hay tải ảnh từ trình duyệt, nên chương truyện và ảnh đi qua backend nhỏ trong [amplify/functions/reader-api](amplify/functions/reader-api). Backend:
  - chỉ mở các endpoint đọc cần thiết, có kiểm tra đầu vào; ảnh chỉ được lấy từ host của MangaDex (chống SSRF);
  - cache, giới hạn dưới 5 request/giây tới MangaDex, User-Agent ghi rõ là eManga;
  - tìm truyện MangaDex tương ứng qua ID AniList (`links.al`).
- Lúc dev, Vite chạy **chính code backend đó** ở `/api`, nên không cần tài khoản AWS.

## Công nghệ

| | |
|---|---|
| Frontend | Vite 5, React 18, React Router 6, TanStack Query 5, Tailwind CSS 3, lucide-react |
| Backend | AWS Amplify Gen 2, Lambda (Node 20) + Function URL |
| Test / Lint | Vitest, ESLint, TypeScript (cho `amplify/`) |

## Chạy ở máy

Yêu cầu Node.js 18 trở lên.

```bash
npm install
npm run dev        # http://localhost:3000, backend chạy ở /api
```

```bash
npm test           # unit test (frontend + backend)
npm run lint
npm run build && npm run preview   # chạy thử bản build (vẫn có /api)
```

Muốn chạy thử Lambda thật trên AWS (tuỳ chọn), cần AWS CLI đã cấu hình:

```bash
npm run sandbox    # deploy backend vào môi trường sandbox riêng, tạo amplify_outputs.json
```

## Deploy lên AWS Amplify

1. Push repo lên GitHub.
2. Vào **AWS Amplify Console → Create new app → GitHub**, chọn repo `emanga-fe` và nhánh `main`. Amplify tự nhận [amplify.yml](amplify.yml):
   - **backend**: `ampx pipeline-deploy` tạo Lambda `reader-api` và Function URL;
   - **frontend**: đọc URL đó từ `amplify_outputs.json` vào `VITE_READER_API`, rồi `npm run build`.
3. Thêm rule để các link như `/manga/30013` không bị 404. Vào **Hosting → Rewrites and redirects → Manage → Open text editor**:

   ```json
   [
     {
       "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json|webp|avif)$)([^.]+$)/>",
       "target": "/index.html",
       "status": "200"
     }
   ]
   ```

4. Từ đó, mỗi lần push vào `main` Amplify sẽ tự build và deploy cả frontend lẫn backend.

### Biến môi trường (tuỳ chọn)

| Biến | Mặc định | Ghi chú |
|---|---|---|
| `VITE_READER_API` | `/api` | URL backend đọc truyện. `amplify.yml` tự đặt khi deploy |
| `VITE_ANILIST_API` | `https://graphql.anilist.co` | Đổi nếu dùng proxy hoặc cache riêng |

## Cấu trúc thư mục

```
amplify/
  backend.ts                    khai báo backend Amplify Gen 2
  functions/reader-api/         core.js (logic), handler.ts (Lambda), resource.ts
src/
  api/          AniList GraphQL + client backend đọc truyện
  components/   layout/, manga/, reader/, ui/
  hooks/        React Query hooks, debounce, theme, title
  lib/          chuẩn hoá dữ liệu, chương, hằng số, thông tin nhóm
  pages/        Home, Browse, MangaDetail, Reader, Library, About, NotFound
  store/        settings + tủ truyện (localStorage)
amplify.yml     cấu hình build trên Amplify
```

## Lưu ý

- Chương truyện là bản dịch của cộng đồng, lấy qua MangaDex. Dự án phi lợi nhuận, không quảng cáo, ghi nguồn MangaDex và tên nhóm dịch. Hãy đọc [điều khoản API của MangaDex](https://api.mangadex.org/docs/) trước khi deploy công khai.
- Nhiều truyện có bản quyền (ví dụ Solo Leveling) đã bị gỡ chương trên MangaDex. Khi đó trang truyện chỉ hiện link bản chính thức.
- Ảnh mặc định ở chế độ tiết kiệm dữ liệu, vừa nhẹ vừa nằm trong giới hạn 6 MB mỗi response của Lambda.
- AniList giới hạn khoảng 90 request mỗi phút cho mỗi IP. Client đã tự thử lại khi gặp lỗi 429.

## Đóng góp

1. Fork repo và tạo nhánh: `git checkout -b feat/ten-tinh-nang`
2. Commit theo [Conventional Commits](https://www.conventionalcommits.org/)
3. Mở Pull Request
