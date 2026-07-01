import React, { useState } from 'react';
import { Home, UserCog, ShieldCheck, FileText, Download, Megaphone, BookOpen, Fan, ArrowRight, Shield } from 'lucide-react';
import { Announcement, Member, UserAccount } from '../types';
import { exportToWord } from '../utils';
import { motion } from 'motion/react';

interface HomeSectionProps {
  members: Member[];
  announcements: Announcement[];
  currentUser: UserAccount | null;
  onViewChange: (view: string) => void;
  onLoginShow: () => void;
}

export default function HomeSection({
  members,
  announcements,
  currentUser,
  onViewChange,
  onLoginShow
}: HomeSectionProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Thống kê nhanh
  const generationCount = Array.from(new Set(members.map(m => m.generation))).length;
  const totalMembers = members.length;
  const livingMembers = members.filter(m => !m.isDeceased).length;
  const deceasedMembers = members.filter(m => m.isDeceased).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="home-view" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
      
      {/* CỘT TRÁI: Vertical Menu */}
      <aside className="w-full lg:w-[260px] flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-[#eadecb] p-4 sticky top-24">
          <h3 className="text-lg font-bold text-[#6b4724] border-b-2 border-[#b8956b] pb-2 mb-4 uppercase font-playfair flex items-center gap-1.5">
            Danh Mục Chức Năng
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onViewChange('home')}
                className="w-full flex items-center p-2.5 rounded bg-[#f4f0e6] text-[#6b4724] font-medium border-l-4 border-[#b8956b] transition text-left cursor-pointer"
              >
                <Home className="w-5 h-5 mr-2 text-[#b8956b]" /> Trang chủ
              </button>
            </li>
            
            <li>
              <button
                onClick={() => {
                  if (currentUser) {
                    setShowProfileModal(true);
                  } else {
                    onLoginShow();
                  }
                }}
                className="w-full flex items-center p-2.5 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-left cursor-pointer hover:border-l-4 hover:border-[#b8956b]"
              >
                <UserCog className="w-5 h-5 mr-2 text-[#8b7355]" /> Quản lý tài khoản
              </button>
            </li>

            {currentUser && currentUser.role === 'admin' && (
              <li>
                <button
                  onClick={() => onViewChange('admin')}
                  className="w-full flex items-center p-2.5 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-left cursor-pointer hover:border-l-4 hover:border-[#b8956b]"
                >
                  <ShieldCheck className="w-5 h-5 mr-2 text-green-700" /> Quản trị hệ thống
                </button>
              </li>
            )}

            <li className="pt-3 border-t border-dashed border-[#eadecb] mt-2">
              <span className="text-[11px] uppercase text-[#8b7355] font-bold block mb-2 px-2 tracking-wider">
                In ấn / Xuất file
              </span>
              <button
                onClick={() => exportToWord(members)}
                className="w-full flex items-center p-2.5 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-left cursor-pointer"
              >
                <Download className="w-5 h-5 text-blue-700 mr-2" />
                <span>Xuất file Word</span>
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center p-2.5 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-left cursor-pointer"
              >
                <FileText className="w-5 h-5 text-red-600 mr-2" />
                <span>In bản PDF / Giấy</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* CỘT GIỮA: NỘI DUNG CHÍNH */}
      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-[#eadecb] p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none select-none">
            <Fan className="w-full h-full rotate-45 text-[#3e2a16]" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#6b4724] mb-4 font-playfair flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#b8956b]" /> Tổng Quan Gia Tộc
          </h2>
          
          <div className="text-[#5a3d1c] leading-relaxed space-y-4 text-justify">
            <p className="indent-6">
              Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Gia phả gia đình Cụ <strong>Nghiêm Cung</strong> được lập ra nhằm ghi chép lại nguồn cội, công đức tổ tiên, ghi nhận bước phát triển qua các thế hệ dòng họ để làm gương sáng cho đời sau.
            </p>
            <p className="indent-6">
              Khởi nguồn từ cụ cố <strong>Nghiêm Điều (Chu)</strong> và cụ bà <strong>Lê Thị Mai</strong> ở đất Ứng Hòa, Hà Nội, trải qua nhiều thăng trầm lịch sử, con cháu Nghiêm gia luôn luôn giữ vững nền nếp gia phong, hiếu học, đoàn kết, đóng góp tích cực cho đất nước và gìn giữ văn hóa gia đình tốt đẹp.
            </p>
            <p className="indent-6">
              Hệ thống Gia phả số hóa này là sợi dây liên kết vô hình giữa quá khứ và hiện tại, giúp từng thành viên tìm về cội nguồn linh thiêng, gắn kết tình thân chi ngành bền chặt hơn bao giờ hết.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-dashed border-[#eadecb] pt-6">
            <div className="text-center p-2 rounded bg-[#faf8f2]">
              <div className="text-3.5xl font-bold text-[#b8956b] font-playfair">{generationCount}</div>
              <div className="text-[11px] uppercase text-[#8b7355] mt-1 font-bold tracking-wider">Số Đời</div>
            </div>
            <div className="text-center p-2 rounded bg-[#faf8f2] border-l border-dashed border-[#eadecb]">
              <div className="text-3.5xl font-bold text-[#b8956b] font-playfair">{totalMembers}</div>
              <div className="text-[11px] uppercase text-[#8b7355] mt-1 font-bold tracking-wider">Thành Viên</div>
            </div>
            <div className="text-center p-2 rounded bg-[#faf8f2] border-l border-dashed border-[#eadecb]">
              <div className="text-3.5xl font-bold text-green-700 font-playfair">{livingMembers}</div>
              <div className="text-[11px] uppercase text-[#8b7355] mt-1 font-bold tracking-wider">Còn Sống</div>
            </div>
            <div className="text-center p-2 rounded bg-[#faf8f2] border-l border-dashed border-[#eadecb]">
              <div className="text-3.5xl font-bold text-red-700 font-playfair">{deceasedMembers}</div>
              <div className="text-[11px] uppercase text-[#8b7355] mt-1 font-bold tracking-wider">Tưởng Niệm</div>
            </div>
          </div>
        </motion.section>

        {/* Quick Links Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onViewChange('family-tree')}
            className="p-4 bg-white hover:bg-[#faf7f0] border border-[#eadecb] rounded-lg shadow-xs hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between min-h-[120px]"
          >
            <div>
              <h4 className="font-bold text-[#6b4724] font-playfair text-lg group-hover:text-[#b8956b] transition">Xem Cây Gia Phả</h4>
              <p className="text-xs text-[#8b7355] mt-1">Khám phá sơ đồ phả hệ thông minh, trực quan nhiều thế hệ của dòng họ.</p>
            </div>
            <span className="text-[#b8956b] text-sm font-semibold flex items-center gap-1 mt-3">
              Xem ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button 
            onClick={() => onViewChange('member-list')}
            className="p-4 bg-white hover:bg-[#faf7f0] border border-[#eadecb] rounded-lg shadow-xs hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between min-h-[120px]"
          >
            <div>
              <h4 className="font-bold text-[#6b4724] font-playfair text-lg group-hover:text-[#b8956b] transition">Tra Cứu Con Cháu</h4>
              <p className="text-xs text-[#8b7355] mt-1">Tìm kiếm chi tiết thông tin, tiểu sử, ngày giỗ, liên lạc của từng thành viên.</p>
            </div>
            <span className="text-[#b8956b] text-sm font-semibold flex items-center gap-1 mt-3">
              Xem ngay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button 
            onClick={() => onViewChange('memorial')}
            className="p-4 bg-[#141414] text-white hover:bg-[#1f1f1f] border border-[#333] rounded-lg shadow-xs hover:shadow-md transition text-left cursor-pointer group flex flex-col justify-between min-h-[120px]"
          >
            <div>
              <h4 className="font-bold text-[#d6b583] font-playfair text-lg group-hover:text-amber-300 transition">Thắp Hương Tưởng Nhớ</h4>
              <p className="text-xs text-gray-400 mt-1">Kính viếng hương linh tổ tiên, dâng hoa, dâng nến và gửi lời tri ân thành kính.</p>
            </div>
            <span className="text-[#d6b583] text-sm font-semibold flex items-center gap-1 mt-3">
              Kính dâng <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </section>
      </main>

      {/* CỘT PHẢI: Announcements & Side Widgets */}
      <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-[#eadecb] overflow-hidden sticky top-24">
          <div className="bg-[#b8956b] text-white p-3.5 flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wide text-sm font-playfair">Thông Báo Gia Tộc</h3>
          </div>
          
          <div className="p-4 space-y-4 divide-y divide-[#faf5eb]">
            {announcements.length === 0 ? (
              <p className="text-sm text-[#8b7355] italic text-center py-4">Chưa có thông báo nào mới.</p>
            ) : (
              announcements.map((ann, idx) => (
                <div key={ann.id} className={`pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded mb-1 ${
                    ann.category === 'QUAN TRỌNG' ? 'bg-red-100 text-red-700' :
                    ann.category === 'CẬP NHẬT' ? 'bg-blue-100 text-blue-700' :
                    ann.category === 'TIN BUỒN' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-700'
                  }`}>
                    {ann.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#6b4724] hover:text-[#b8956b] transition cursor-pointer mb-1 line-clamp-2">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-[#8b7355] line-clamp-3 mb-1.5 leading-relaxed">
                    {ann.content}
                  </p>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    Ngày đăng: {new Date(ann.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* MODAL XEM PROFILE TÀI KHOẢN */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-65 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-[#b8956b] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#3e2a16] text-[#fdfbf7] p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#d6b583]" />
                <h3 className="text-lg font-bold uppercase font-playfair">Thông Tin Tài Khoản</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center py-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-[#f4ecd8] flex items-center justify-center text-2xl font-bold text-[#6b4724]">
                  {currentUser.fullName.charAt(0)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 text-sm py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Họ & tên:</span>
                <span className="col-span-2 text-[#4a331a] font-bold">{currentUser.fullName}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm py-1 border-b border-gray-50">
                <span className="text-gray-400 font-medium">Tên đăng nhập:</span>
                <span className="col-span-2 text-[#4a331a] font-mono font-semibold">{currentUser.username}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm py-1">
                <span className="text-gray-400 font-medium">Phân quyền:</span>
                <span className="col-span-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                    currentUser.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {currentUser.role === 'admin' ? 'Hội Đồng Gia Tộc (Admin)' : 'Thành Viên (User)'}
                  </span>
                </span>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full mt-6 bg-[#b8956b] hover:bg-[#8b7355] text-white py-2.5 font-bold rounded-md transition duration-200 cursor-pointer text-sm"
              >
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
