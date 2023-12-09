export const SCHOOL = 'Đại học Quốc gia Thành phố Hồ Chí Minh';

/**
 * Team info for the footer and About page.
 * TODO: các trường đánh dấu "cập nhật" là dữ liệu tạm, thay bằng thông tin thật.
 */
export const TEAM = [
  {
    name: 'Nguyễn Thanh Nhân',
    role: 'DevOps Engineer',
    major: 'Hệ thống thông tin',
    program: 'Chương trình Chất lượng cao',
    github: 'uit-ntn',
    facebook: 'https://www.facebook.com/UIT.NTN.13',
    linkedin: 'https://www.linkedin.com/in/nguyen-nhan-732a66247/',
    instagram: '', // TODO: link Instagram
    site: 'https://uit-ntn.github.io/portfolio/',
    school: SCHOOL,
    studentId: 'MSSV: 21521219', // TODO
    email: '21521219@gm.uit.edu.vn', // TODO
    bio: 'Phụ trách hạ tầng, CI/CD và triển khai trên AWS, đồng thời phát triển frontend React và backend.', // TODO
    skills: ['AWS', 'CI/CD', 'Docker', 'Linux', 'React'],
    contributions: ['Khởi tạo dự án', 'Hạ tầng & deploy Amplify', 'Backend & trình đọc', 'Tủ truyện'],
  },
  {
    name: 'Quãng Đại Thi',
    role: 'Business Analyst',
    major: 'Hệ thống thông tin',
    program: 'Chương trình Chuẩn',
    github: 'DT2K3',
    facebook: 'https://www.facebook.com/aithi.992969',
    linkedin: 'https://www.linkedin.com/in/thi-qu%C3%A3ng-%C4%91%E1%BA%A1i-90736a268/',
    instagram: '', // TODO: link Instagram
    school: SCHOOL,
    studentId: 'MSSV:', // TODO
    email: '2152@gm.uit.edu.vn', // TODO
    bio: 'Phụ trách phân tích yêu cầu, thiết kế luồng người dùng và giao diện danh sách, chi tiết truyện.', // TODO
    skills: ['Phân tích nghiệp vụ', 'UML / BPMN', 'Figma', 'React'],
    contributions: ['Phân tích yêu cầu', 'Danh sách truyện', 'Trang chi tiết truyện', 'Thiết kế giao diện'],
  },
];

/** Social profiles of a member, in display order; empty ones are skipped. */
export const socialLinks = (m) =>
  [
    { key: 'facebook', label: 'Facebook', url: m.facebook },
    { key: 'linkedin', label: 'LinkedIn', url: m.linkedin },
    { key: 'instagram', label: 'Instagram', url: m.instagram },
    { key: 'github', label: 'GitHub', url: m.github && `https://github.com/${m.github}` },
  ].filter((l) => l.url);
