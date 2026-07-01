import { Member, Announcement, MemoryWall } from './types';

export const INITIAL_MEMBERS: Member[] = [
  // ĐỜI 15
  {
    id: 'nghiem-dieu',
    fullName: 'Nghiêm Điều (Chu)',
    generation: 15,
    gender: 'Nam',
    birthDate: '1885',
    deathDate: '1962',
    deathAnniversaryLunar: '15 tháng 8',
    isDeceased: true,
    spouseName: 'Lê Thị Mai (Cụ Bà Lùn)',
    relationshipToHead: 'Cụ Tổ Ông',
    chiBranch: 'Chi Cả',
    birthPlace: 'Hòa Xá, Ứng Hòa, Hà Nội',
    restingPlace: 'Nghĩa trang Quê nhà, Hòa Xá',
    story: 'Người khai sáng gia tộc, chăm chỉ làm lụng, lập nghiệp phương xa và giáo dục con cháu giữ gìn nền nếp gia phong, hướng thiện trọng nghĩa.'
  },
  {
    id: 'le-thi-mai',
    fullName: 'Lê Thị Mai (Cụ Bà Lùn)',
    generation: 15,
    gender: 'Nữ',
    birthDate: '1889',
    deathDate: '1971',
    deathAnniversaryLunar: '10 tháng 10',
    isDeceased: true,
    spouseName: 'Nghiêm Điều (Chu)',
    relationshipToHead: 'Cụ Tổ Bà',
    chiBranch: 'Chi Cả',
    birthPlace: 'Mỹ Đức, Hà Nội',
    restingPlace: 'Nghĩa trang Quê nhà, Hòa Xá',
    story: 'Cụ bà hiền hậu, tần tảo nuôi con, là hậu phương vững chắc giúp gia đình vượt qua những năm tháng kháng chiến khó khăn.'
  },

  // ĐỜI 16
  {
    id: 'nghiem-cung',
    fullName: 'Nghiêm Cung',
    generation: 16,
    gender: 'Nam',
    birthDate: '1912',
    deathDate: '1988',
    deathAnniversaryLunar: '12 tháng 3',
    isDeceased: true,
    spouseName: 'Cụ Bà Cả (Mất sớm) & Cụ Bà Hai',
    parentId: 'nghiem-dieu',
    relationshipToHead: 'Cụ Ông',
    chiBranch: 'Chi Cả',
    birthPlace: 'Hòa Xá, Ứng Hòa, Hà Nội',
    restingPlace: 'Nghĩa trang Đồng Vông, Hòa Xá',
    story: 'Cụ Nghiêm Cung kế thừa truyền thống của cha, là người uy tín trong dòng họ, thấu hiểu lễ nghĩa, hết lòng chăm lo cho gia tộc.'
  },

  // ĐỜI 17
  // Nhánh Cụ Bà Cả
  {
    id: 'con-gai-1',
    fullName: 'Nghiêm Thị Nhất',
    generation: 17,
    gender: 'Nữ',
    isDeceased: true,
    spouseName: 'Nguyễn Văn Đạt',
    parentId: 'nghiem-cung',
    relationshipToHead: 'Con Gái Cụ Cả (Nhất)',
    chiBranch: 'Nhánh Bà Cả',
    birthPlace: 'Hòa Xá, Hà Nội',
    story: 'Trưởng nữ hiền thảo, lấy chồng tại làng bên, gia quyến ấm êm, có nhiều đóng góp xây dựng họ hàng.'
  },
  {
    id: 'con-gai-2',
    fullName: 'Nghiêm Thị Hai',
    generation: 17,
    gender: 'Nữ',
    isDeceased: true,
    spouseName: 'Trần Văn Bình',
    parentId: 'nghiem-cung',
    relationshipToHead: 'Con Gái Cụ Cả (Hai)',
    chiBranch: 'Nhánh Bà Cả',
    birthPlace: 'Hòa Xá, Hà Nội',
    story: 'Thứ nữ chăm chỉ, mẫu mực, giáo dục các con thành tài, luôn hướng về cội nguồn Nghiêm gia.'
  },

  // Nhánh Cụ Bà Hai
  {
    id: 'nghiem-canh',
    fullName: 'Nghiêm Cảnh',
    generation: 17,
    gender: 'Nam',
    birthDate: '1940',
    deathDate: '2015',
    deathAnniversaryLunar: '24 tháng 1',
    isDeceased: true,
    spouseName: 'Nguyễn Thị Hoa',
    parentId: 'nghiem-cung',
    relationshipToHead: 'Bác Trai Trưởng',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    restingPlace: 'Nghĩa trang Hòa Xá',
    story: 'Trưởng nam nhánh Bà Hai, cán bộ hưu trí nhà nước, mẫu mực, đức độ, có công lớn kết nối con cháu dòng họ.'
  },
  {
    id: 'nghiem-toan',
    fullName: 'Nghiêm Thị Toàn',
    generation: 17,
    gender: 'Nữ',
    birthDate: '1943',
    isDeceased: false,
    spouseName: 'Ngô Văn Sửu',
    parentId: 'nghiem-cung',
    relationshipToHead: 'Bác Gái',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    contact: '0987.654.321',
    story: 'Sống hiền hậu, hiếu nghĩa, hiện đang an dưỡng tuổi già cùng gia đình con cháu tại Hà Nội.'
  },
  {
    id: 'nghiem-phac',
    fullName: 'Nghiêm Phác',
    generation: 17,
    gender: 'Nam',
    birthDate: '1946',
    deathDate: '2021',
    deathAnniversaryLunar: '02 tháng 9',
    isDeceased: true,
    spouseName: 'Lê Thị Cúc',
    parentId: 'nghiem-cung',
    relationshipToHead: 'Bác Trai Thứ',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    restingPlace: 'Nghĩa trang Gò Mây, Hòa Xá',
    story: 'Cựu chiến binh dũng cảm, sau xuất ngũ công tác tại địa phương, tính tình cương trực, đức độ, được mọi người kính trọng.'
  },
  {
    id: 'nghiem-xuan-ma',
    fullName: 'Nghiêm Xuân Mã',
    generation: 17,
    gender: 'Nam',
    birthDate: '1950',
    isDeceased: false,
    spouseName: 'Đặng Thị Thảo',
    parentId: 'nghiem-cung',
    relationshipToHead: 'Bố',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    contact: '0912.345.678',
    story: 'Nhà giáo về hưu, tâm huyết với sự nghiệp dạy học và xây dựng gia đình hiếu học. Người lưu trữ nhiều tư liệu quý giá về gia phả dòng tộc.'
  },
  {
    id: 'nghiem-thi-hoan',
    fullName: 'Nghiêm Thị Hoàn',
    generation: 17,
    gender: 'Nữ',
    birthDate: '1953',
    isDeceased: false,
    spouseName: 'Nguyễn Văn Đạt',
    parentId: 'nghiem-cung',
    relationshipToHead: 'Cô Út',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    contact: '0904.123.456',
    story: 'Tính cách vui vẻ, hòa đồng, hết lòng yêu thương giúp đỡ anh em và các cháu trong dòng họ.'
  },

  // ĐỜI 18
  // Con Bác Nghiêm Cảnh
  {
    id: 'nghiem-xuan-hung',
    fullName: 'Nghiêm Xuân Hùng',
    generation: 18,
    gender: 'Nam',
    birthDate: '1970',
    isDeceased: false,
    spouseName: 'Phạm Thu Trang',
    parentId: 'nghiem-canh',
    relationshipToHead: 'Anh họ (Con bác Cảnh)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    contact: '0913.888.999',
    job: 'Kỹ sư xây dựng',
    story: 'Năng nổ, tháo vát, thành viên tích cực ban liên lạc gia tộc, đứng đầu ban tổ chức các sự kiện hiếu hỉ của gia đình.'
  },
  {
    id: 'nghiem-thi-lan',
    fullName: 'Nghiêm Thị Lan',
    generation: 18,
    gender: 'Nữ',
    birthDate: '1973',
    isDeceased: false,
    spouseName: 'Vũ Quốc Trung',
    parentId: 'nghiem-canh',
    relationshipToHead: 'Chị họ (Con bác Cảnh)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    job: 'Giáo viên cấp 3',
    story: 'Giáo viên dạy Giỏi, luôn tích cực hướng dẫn con cháu học hành tiến bộ.'
  },

  // Con Bác Nghiêm Phác
  {
    id: 'nghiem-xuan-hai',
    fullName: 'Nghiêm Xuân Hải',
    generation: 18,
    gender: 'Nam',
    birthDate: '1975',
    isDeceased: false,
    spouseName: 'Lê Diệu Linh',
    parentId: 'nghiem-phac',
    relationshipToHead: 'Anh họ (Con bác Phác)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    contact: '0982.111.222',
    job: 'Doanh nhân',
    story: 'Nhà quản lý giỏi, thành đạt, đóng góp lớn về tài chính cho quỹ khuyến học và trùng tu mộ phần dòng họ.'
  },
  {
    id: 'nghiem-thi-huong',
    fullName: 'Nghiêm Thị Hương',
    generation: 18,
    gender: 'Nữ',
    birthDate: '1978',
    isDeceased: false,
    spouseName: 'Bùi Minh Trí',
    parentId: 'nghiem-phac',
    relationshipToHead: 'Chị họ (Con bác Phác)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    job: 'Bác sĩ',
    story: 'Bác sĩ khoa nhi tận tâm, thường xuyên hỗ trợ tư vấn chăm sóc sức khỏe cho trẻ nhỏ trong dòng họ.'
  },

  // Con Bố Nghiêm Xuân Mã
  {
    id: 'nghiem-xuan-son',
    fullName: 'Nghiêm Xuân Sơn',
    generation: 18,
    gender: 'Nam',
    birthDate: '1981',
    isDeceased: false,
    spouseName: 'Nguyễn Bích Ngọc',
    parentId: 'nghiem-xuan-ma',
    relationshipToHead: 'Anh trai',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    contact: '0977.333.444',
    job: 'Chuyên viên Công nghệ thông tin',
    story: 'Công tác tại tập đoàn lớn về công nghệ, là người xây dựng và thiết lập website gia phả số hóa này.'
  },
  {
    id: 'nghiem-thi-thanh',
    fullName: 'Nghiêm Thị Thanh',
    generation: 18,
    gender: 'Nữ',
    birthDate: '1984',
    isDeceased: false,
    spouseName: 'Hoàng Anh Quân',
    parentId: 'nghiem-xuan-ma',
    relationshipToHead: 'Em gái',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    job: 'Ngân hàng',
    story: 'Chuyên viên tài chính ngân hàng tận tụy, gia đình hạnh phúc, nuôi dạy hai con ngoan ngoãn.'
  },
  {
    id: 'nghiem-xuan-nghia',
    fullName: 'Nghiêm Xuân Nghĩa',
    generation: 18,
    gender: 'Nam',
    birthDate: '1988',
    isDeceased: false,
    spouseName: 'Phan Khánh Chi',
    parentId: 'nghiem-xuan-ma',
    relationshipToHead: 'Em trai út',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hòa Xá, Hà Nội',
    contact: '0936.555.666',
    job: 'Luật sư',
    story: 'Tư vấn pháp lý cho các doanh nghiệp, nhiệt tình, có trách nhiệm cao với dòng tộc.'
  },

  // ĐỜI 19 (Cháu nội)
  {
    id: 'nghiem-xuan-minh',
    fullName: 'Nghiêm Xuân Minh',
    generation: 19,
    gender: 'Nam',
    birthDate: '2001',
    isDeceased: false,
    parentId: 'nghiem-xuan-hung',
    relationshipToHead: 'Cháu (Con anh Hùng)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hà Nội',
    job: 'Sinh viên Kiến trúc',
    story: 'Học tập xuất sắc, nhận nhiều giải thưởng về thiết kế đồ họa trẻ.'
  },
  {
    id: 'nghiem-xuan-tuan',
    fullName: 'Nghiêm Xuân Tuấn',
    generation: 19,
    gender: 'Nam',
    birthDate: '2005',
    isDeceased: false,
    parentId: 'nghiem-xuan-hai',
    relationshipToHead: 'Cháu (Con anh Hải)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hà Nội',
    story: 'Hiện đang học trung học phổ thông, đạt học sinh giỏi nhiều năm liền.'
  },
  {
    id: 'nghiem-thi-anh',
    fullName: 'Nghiêm Thị Khánh Ánh',
    generation: 19,
    gender: 'Nữ',
    birthDate: '2010',
    isDeceased: false,
    parentId: 'nghiem-xuan-son',
    relationshipToHead: 'Cháu (Con anh Sơn)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hà Nội',
    story: 'Chăm ngoan, học giỏi, say mê vẽ tranh và đàn piano.'
  },
  {
    id: 'nghiem-xuan-bao',
    fullName: 'Nghiêm Xuân Gia Bảo',
    generation: 19,
    gender: 'Nam',
    birthDate: '2016',
    isDeceased: false,
    parentId: 'nghiem-xuan-nghia',
    relationshipToHead: 'Cháu (Con anh Nghĩa)',
    chiBranch: 'Nhánh Bà Hai',
    birthPlace: 'Hà Nội',
    story: 'Bé thông minh, thích tìm hiểu thế giới tự nhiên và các khối Lego.'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Đóng góp quỹ tu sửa lăng mộ Cụ Cố',
    content: 'Ban liên lạc gia tộc kêu gọi con cháu đóng góp công đức cho kế hoạch nâng cấp, ốp đá và lắp đặt khuôn viên bồn hoa xung quanh phần mộ Cụ Tổ Nghiêm Điều và Cụ Bà Lê Thị Mai tại nghĩa trang quê nhà. Thời gian hoàn thiện dự kiến trước ngày giỗ Tổ 15/08 Âm lịch.',
    date: '2026-06-15',
    category: 'QUAN TRỌNG'
  },
  {
    id: 'ann-2',
    title: 'Đề nghị bổ sung thông tin thế hệ 18, 19',
    content: 'Để hoàn thiện cuốn Gia phả gia đình Cụ Nghiêm Cung in ấn phát hành vào dịp họp mặt sắp tới, kính đề nghị các gia đình rà soát lại thông tin vợ/chồng, con cháu đời thứ 18, 19 (ngày sinh nhật dương/âm, trình độ học vấn, công việc hiện tại) và gửi về cho Ban liên lạc để tổng hợp trước ngày 15/07 Dương lịch.',
    date: '2026-06-25',
    category: 'CẬP NHẬT'
  },
  {
    id: 'ann-3',
    title: 'Họp mặt chúc thọ Cụ Nghiêm Thị Toàn bước sang tuổi 83',
    content: 'Hội đồng gia tộc kính mời toàn thể con cháu chi ngành tề tựu đông đủ về chúc thọ Cụ Nghiêm Thị Toàn tại tư gia. Sự hiện diện đầy đủ của con cháu là món quà tinh thần lớn lao nhất dành cho Cụ.',
    date: '2026-06-28',
    category: 'TIN VUI'
  }
];

export const INITIAL_MEMORIES: MemoryWall[] = [
  {
    id: 'mem-1',
    author: 'Nghiêm Xuân Mã',
    targetMemberId: 'nghiem-cung',
    targetMemberName: 'Nghiêm Cung',
    relationship: 'Con trai',
    content: 'Bố kính nhớ hương linh của Cha. Con và gia đình nhỏ luôn ghi nhớ những lời dạy dỗ nghiêm nghị mà đầy bao dung của Cha để vững bước và nuôi dạy các cháu trưởng thành.',
    timestamp: '2026-06-30T10:30:00Z',
    candleLit: true,
    incenseBurned: true
  },
  {
    id: 'mem-2',
    author: 'Nghiêm Xuân Hùng',
    targetMemberId: 'nghiem-canh',
    targetMemberName: 'Nghiêm Cảnh',
    relationship: 'Con trai trưởng',
    content: 'Bố ơi, hôm nay con thắp nến cầu nguyện chúc Bố ở thế giới bên kia luôn an lạc. Con cháu dòng họ vẫn luôn gìn giữ kỷ vật tấm áo sờn vai ngày xưa của Bố.',
    timestamp: '2026-06-29T18:15:00Z',
    candleLit: true,
    incenseBurned: false
  }
];
