import { Link } from 'react-router-dom';
import { Github, GraduationCap, Globe, Mail } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SCHOOL, TEAM, socialLinks } from '../lib/team';
import SocialIcon from '../components/ui/SocialIcon';
import { PHASES, STATS } from '../lib/timeline';
import banner from '../assets/img/Banner.png';
import { FOUNDED } from '../lib/brand';

const BRAND_STORY = [
  {
    title: 'Cuốn sách đang mở',
    text: 'Biểu tượng của eManga là một cuốn truyện vừa được lật ra. Không phải cuốn sách đóng gáy nằm im trên kệ, mà là khoảnh khắc ngay trước khi bạn chìm vào trang đầu tiên. Đó là cảm giác bọn mình muốn mỗi lần bạn mở web.',
  },
  {
    title: 'Ngôi sao lấp lánh',
    text: 'Vệt sáng bay ra từ trang sách là chút phép màu của truyện tranh: một chương mới, một plot twist, một nhân vật khiến bạn thức tới 2 giờ sáng. Bọn mình gọi nó là "ngôi sao của chương tiếp theo".',
  },
  {
    title: 'A New World in Every Page',
    text: 'Mỗi trang, một thế giới. Manga, manhwa hay manhua, mỗi bộ truyện là một vũ trụ riêng, và eManga chỉ muốn làm cánh cửa gọn gàng, nhanh và miễn phí để bạn bước vào.',
  },
  {
    title: `Since ${FOUNDED}`,
    text: `eManga ra đời vào tháng 9/${FOUNDED}, bắt đầu từ một đồ án sinh viên và vài dòng commit đầu tiên. Từ đó tới cuối năm, giao diện được làm lại từ đầu, đổi nguồn dữ liệu, thêm tủ truyện, backend và trình đọc. Con số ${FOUNDED} trên logo là lời nhắc rằng bọn mình đã đi một chặng đường, và vẫn đang đi tiếp.`,
  },
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
          tương tự và đọc truyện ngay trên web.
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


      <section className="mx-auto mt-20 max-w-5xl">
        <div className="overflow-hidden rounded-3xl bg-zinc-950 px-6 py-8 ring-1 ring-brand-600/20 sm:px-10">
          <img src={banner} alt={`eManga – A New World in Every Page – Since ${FOUNDED}`} width={2172} height={724} className="mx-auto w-full max-w-3xl" loading="lazy" />
        </div>
        <h2 className="section-title mt-10 text-center">Câu chuyện sau logo</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-500">
          Logo của eManga không chỉ để cho đẹp. Mỗi chi tiết trên đó là một mảnh của câu chuyện bọn mình bắt đầu từ năm {FOUNDED}.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {BRAND_STORY.map((b) => (
            <article key={b.title} className="card p-6">
              <h3 className="text-lg font-bold text-brand-600">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="section-title text-center">Quá trình phát triển</h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Tóm tắt từ lịch sử commit trên{' '}
          <a href="https://github.com/uit-ntn/emanga-fe/commits/main" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
            GitHub
          </a>
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-extrabold text-brand-600">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>

        <ol className="relative mx-auto mt-10 max-w-3xl border-l-2 border-zinc-200 pl-6 dark:border-zinc-800 sm:pl-8">
          {PHASES.map((p, i) => (
            <li key={p.title} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[2.15rem] top-0 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white ring-4 ring-zinc-50 dark:ring-zinc-950 sm:-left-[2.65rem]">
                {i + 1}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{p.period}</p>
              <h3 className="mt-1 text-lg font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{p.summary}</p>
              <ul className="card mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                {p.items.map((it) => (
                  <li key={it.date + it.text} className="flex gap-3 px-4 py-2.5 text-sm">
                    <span className="w-14 shrink-0 font-mono text-xs leading-5 text-zinc-500 sm:w-24">{it.date}</span>
                    <span className="flex-1">{it.text}</span>
                    {it.author && (
                      <span className="shrink-0 self-start rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
                        {it.author}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <h2 className="section-title text-center">Đội ngũ</h2>
        <p className="mt-2 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <GraduationCap className="h-4 w-4" /> Sinh viên {SCHOOL}
        </p>
        <div className="mx-auto mt-6 grid max-w-4xl gap-6 md:grid-cols-2">
          {TEAM.map((m) => (
            <article key={m.github} className="card flex flex-col p-6">
              <div className="flex items-center gap-4">
                <img
                  src={`https://github.com/${m.github}.png?size=200`}
                  alt={m.name}
                  loading="lazy"
                  className="h-20 w-20 rounded-2xl bg-zinc-200 object-cover dark:bg-zinc-800"
                />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{m.name}</h3>
                  <p className="text-sm font-medium text-brand-600">{m.role}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{m.bio}</p>

              <ul className="mt-4 space-y-1.5 text-sm">
                <li className="flex gap-2">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <span>
                    {m.school}
                    <span className="block text-xs text-zinc-500">
                      Ngành {m.major} · {m.program} · {m.studentId}
                    </span>
                  </span>
                </li>
                {m.email && (
                  <li className="flex gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <a href={`mailto:${m.email}`} className="hover:text-brand-600">
                      {m.email}
                    </a>
                  </li>
                )}
              </ul>

              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Đóng góp chính</p>
                <ul className="flex flex-wrap gap-1.5">
                  {m.contributions.map((c) => (
                    <li key={c} className="rounded-lg bg-brand-600/10 px-2 py-1 text-xs font-medium text-brand-700 dark:text-brand-400">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Kỹ năng</p>
                <ul className="flex flex-wrap gap-1.5">
                  {m.skills.map((k) => (
                    <li key={k} className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-800">
                      {k}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {socialLinks(m).map((l) => (
                  <a key={l.key} href={l.url} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-1.5">
                    <SocialIcon name={l.key} /> {l.key === 'github' ? m.github : l.label}
                  </a>
                ))}
                {m.site && (
                  <a href={m.site} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-1.5">
                    <Globe className="h-4 w-4" /> Portfolio
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
