import { Link } from 'react-router-dom';
import { Compass, Database, Facebook, Github, GraduationCap, Globe, LibraryBig, Moon, Search, ShieldCheck, Smartphone } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SCHOOL, TEAM } from '../lib/team';

const FEATURES = [
  { icon: Compass, title: 'Khám phá', text: 'Bảng xếp hạng thịnh hành, phổ biến, điểm cao và truyện sắp ra mắt.' },
  { icon: Search, title: 'Tìm kiếm nâng cao', text: 'Lọc theo thể loại, tag, quốc gia, định dạng, năm phát hành. Hỗ trợ loại trừ.' },
  { icon: LibraryBig, title: 'Tủ truyện cá nhân', text: 'Theo dõi tiến độ, chấm điểm, sao lưu và khôi phục. Không cần tài khoản.' },
  { icon: Globe, title: 'Đọc ngay trên web', text: 'Trình đọc cuộn dọc / từng trang, nhớ trang đang đọc. Kèm link bản chính thức để ủng hộ tác giả.' },
  { icon: Moon, title: 'Giao diện sáng / tối', text: 'Tự động theo hệ thống hoặc chọn thủ công.' },
  { icon: Smartphone, title: 'Mọi thiết bị', text: 'Thiết kế responsive, dùng tốt trên điện thoại, máy tính bảng và desktop.' },
];

export default function About() {
  useDocumentTitle('Giới thiệu');
  return (
    <div className="container-page py-12">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Về eManga</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Nơi tìm bộ truyện tiếp theo bạn sẽ mê</h1>
        <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400">
          eManga là dự án mã nguồn mở giúp bạn khám phá manga, manhwa và manhua: xem đánh giá, nhân vật, truyện liên quan, gợi ý
          tương tự và biết nên đọc ở đâu cho hợp pháp.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/browse" className="btn-primary">
            Bắt đầu khám phá
          </Link>
          <a href="https://github.com/uit-ntn/emanga-fe" target="_blank" rel="noreferrer" className="btn-secondary">
            <Github className="h-4 w-4" /> Mã nguồn
          </a>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-bold">{title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold">Nguồn dữ liệu</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Thông tin truyện, ảnh bìa, nhân vật và đánh giá được lấy trực tiếp từ{' '}
            <a href="https://anilist.co" target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
              AniList
            </a>{' '}
            qua API GraphQL công khai. Chương truyện là bản dịch cộng đồng lấy qua{' '}
            <a href="https://mangadex.org" target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
              MangaDex
            </a>
            , ghi rõ tên nhóm dịch. eManga không lưu trữ nội dung truyện. Khi truyện có bản chính thức, hãy ủng hộ tác giả.
          </p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold">Quyền riêng tư</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Không đăng ký, không đăng nhập, không theo dõi. Tủ truyện và cài đặt chỉ được lưu trong trình duyệt của bạn
            (localStorage). Bạn có thể sao lưu ra file JSON bất cứ lúc nào.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="section-title text-center">Đội ngũ</h2>
        <p className="mt-2 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <GraduationCap className="h-4 w-4" /> Sinh viên {SCHOOL}
        </p>
        <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
          {TEAM.map((m) => (
            <div key={m.github} className="card flex items-center gap-4 p-5">
              <img
                src={`https://github.com/${m.github}.png?size=160`}
                alt={m.name}
                loading="lazy"
                className="h-16 w-16 rounded-full bg-zinc-200 object-cover dark:bg-zinc-800"
              />
              <div className="min-w-0">
                <p className="font-bold">{m.name}</p>
                <p className="text-sm text-zinc-500">{m.role}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <a href={`https://github.com/${m.github}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                    <Github className="h-4 w-4" /> {m.github}
                  </a>
                  <a href={m.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                    <Facebook className="h-4 w-4" /> Facebook
                  </a>
                  {m.site && (
                    <a href={m.site} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                      <Globe className="h-4 w-4" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
