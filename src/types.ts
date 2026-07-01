export interface SpouseInfo {
  id: string; // ID duy nhất để quản lý
  name: string; // Họ tên bạn đời
  type?: string; // Bên ngoại tộc (phân loại bạn đời: Chính thất, Trắc thất, Vợ cả, Vợ hai, Chồng...)
}

export interface Member {
  id: string;
  fullName: string;
  generation: number; // e.g. 15, 16, 17, 18, 19
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  deathDate?: string; // Ngày mất
  deathAnniversaryLunar?: string; // Ngày giỗ âm lịch (e.g. "12 tháng 3")
  isDeceased: boolean;
  spouseName?: string; // Tên bạn đời (vợ/chồng) - Giữ nguyên tương thích ngược
  spouseType?: string; // Bên ngoại tộc - Giữ nguyên tương thích ngược
  parentId?: string; // ID của cha trong dòng họ
  motherId?: string; // ID của mẹ trong dòng họ
  relationshipToHead?: string; // Quan hệ với cụ tổ (e.g. Con, Cháu, Bác, Bố, Cô...)
  chiBranch?: string; // Chi/Ngành (e.g. "Chi Cả", "Chi Hai")
  birthPlace?: string; // Quê quán
  restingPlace?: string; // Nơi an táng (mộ phần)
  contact?: string; // Số điện thoại/Liên lạc (nếu còn sống)
  story?: string; // Tiểu sử, ghi chú đóng góp
  education?: string; // Học vấn
  job?: string; // Nghề nghiệp
  spouses?: SpouseInfo[]; // Danh sách nhiều bạn đời
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'QUAN TRỌNG' | 'CẬP NHẬT' | 'TIN BUỒN' | 'TIN VUI';
  imageUrl?: string;
  youtubeUrl?: string;
  driveUrl?: string;
}

export interface MemoryWall {
  id: string;
  author: string;
  targetMemberId: string;
  targetMemberName: string;
  relationship: string;
  content: string;
  timestamp: string;
  candleLit: boolean;
  incenseBurned: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'user';
  password?: string;
}
