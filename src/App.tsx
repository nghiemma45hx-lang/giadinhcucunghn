import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import HomeSection from './components/HomeSection';
import FamilyTreeSection from './components/FamilyTreeSection';
import MemberListSection from './components/MemberListSection';
import MemorialSection from './components/MemorialSection';
import StatisticsSection from './components/StatisticsSection';
import AdminSection from './components/AdminSection';
import LoginModal from './components/LoginModal';

import { Member, Announcement, MemoryWall, UserAccount } from './types';
import { INITIAL_MEMBERS, INITIAL_ANNOUNCEMENTS, INITIAL_MEMORIES } from './initialData';
import { 
  dbGetMembers, dbAddMember, dbUpdateMember, dbDeleteMember,
  dbGetAnnouncements, dbAddAnnouncement, dbUpdateAnnouncement, dbDeleteAnnouncement,
  dbGetMemories, dbAddMemory, dbGetSettings, dbSaveSetting, SUPABASE_SQL_SETUP 
} from './supabaseClient';
import { Star, Database, Copy, Check, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Khởi tạo trạng thái ban đầu từ localStorage (dành cho chế độ offline/dự phòng)
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('nghiem_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('nghiem_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [memories, setMemories] = useState<MemoryWall[]>(() => {
    const saved = localStorage.getItem('nghiem_memories');
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('nghiem_settings');
    return saved ? JSON.parse(saved) : {
      banner_title: 'Gia Phả Gia Đình',
      banner_subtitle: 'Cụ Nghiêm Cung',
      banner_image: 'https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop',
      clan_overview_title: 'Tổng Quan Gia Tộc',
      clan_overview_content: 'Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Gia phả gia đình Cụ **Nghiêm Cung** được lập ra nhằm ghi chép lại nguồn cội, công đức tổ tiên, ghi nhận bước phát triển qua các thế hệ dòng họ để làm gương sáng cho đời sau.\n\nKhởi nguồn từ cụ cố **Nghiêm Điều (Chu)** và cụ bà **Lê Thị Mai** ở đất Ứng Hòa, Hà Nội, trải qua nhiều thăng trầm lịch sử, con cháu Nghiêm gia luôn luôn giữ vững nền nếp gia phong, hiếu học, đoàn kết, đóng góp tích cực cho đất nước và gìn giữ văn hóa gia đình tốt đẹp.\n\nHệ thống Gia phả số hóa này là sợi dây liên kết vô hình giữa quá khứ và hiện tại, giúp từng thành viên tìm về cội nguồn linh thiêng, gắn kết tình thân chi ngành bền chặt hơn bao giờ hết.'
    };
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('nghiem_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<string>(() => {
    const saved = localStorage.getItem('nghiem_current_view');
    return saved ? saved : 'home';
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Trạng thái kết nối & khởi tạo cơ sở dữ liệu Supabase
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [supabaseNeedsSetup, setSupabaseNeedsSetup] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Danh sách tài khoản hệ thống dùng cho quản trị xem
  const accounts: UserAccount[] = [
    { id: 'admin', username: 'admin', fullName: 'Hội Đồng Gia Tộc (Admin)', role: 'admin' },
    { id: 'user-phac', username: 'nghiemphac', fullName: 'Bác Nghiêm Phác', role: 'user' }
  ];

  // Tải dữ liệu từ Supabase trên mount
  const fetchSupabaseData = async () => {
    setSupabaseLoading(true);
    try {
      const membersRes = await dbGetMembers();
      const announcementsRes = await dbGetAnnouncements();
      const memoriesRes = await dbGetMemories();
      const settingsRes = await dbGetSettings();

      if (membersRes.needsSetup || announcementsRes.needsSetup || memoriesRes.needsSetup || settingsRes.needsSetup) {
        setSupabaseNeedsSetup(true);
      } else {
        setSupabaseNeedsSetup(false);
        if (membersRes.data) {
          setMembers(membersRes.data);
        }
        if (announcementsRes.data) {
          setAnnouncements(announcementsRes.data);
        }
        if (memoriesRes.data) {
          setMemories(memoriesRes.data);
        }
        if (settingsRes.data && Object.keys(settingsRes.data).length > 0) {
          setSettings(settingsRes.data);
        }
      }
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu từ Supabase:', err);
    } finally {
      setSupabaseLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  // 2. Đồng bộ hóa với localStorage đề phòng sự cố mạng
  useEffect(() => {
    localStorage.setItem('nghiem_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('nghiem_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('nghiem_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('nghiem_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nghiem_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nghiem_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nghiem_current_view', currentView);
  }, [currentView]);

  const handleUpdateSetting = async (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    if (!supabaseNeedsSetup) {
      await dbSaveSetting(key, value);
    }
  };

  // 3. Hàm xử lý CRUD Thành Viên kết nối Supabase
  const [membersHistory, setMembersHistory] = useState<Member[][]>([]);

  const setMembersWithHistory = (newMembers: Member[] | ((prev: Member[]) => Member[])) => {
    setMembers(prev => {
      const resolved = typeof newMembers === 'function' ? newMembers(prev) : newMembers;
      if (JSON.stringify(prev) !== JSON.stringify(resolved)) {
        setMembersHistory(h => [...h.slice(-19), prev]); // Lưu tối đa 20 trạng thái gần nhất
      }
      return resolved;
    });
  };

  const handleAddMember = async (newMem: Member) => {
    setMembersWithHistory(prev => [newMem, ...prev]);
    if (!supabaseNeedsSetup) {
      await dbAddMember(newMem);
    }
  };

  const handleUpdateMember = async (updatedMem: Member) => {
    setMembersWithHistory(prev => prev.map(m => m.id === updatedMem.id ? updatedMem : m));
    if (!supabaseNeedsSetup) {
      await dbUpdateMember(updatedMem);
    }
  };

  const handleDeleteMember = async (id: string) => {
    setMembersWithHistory(prev => prev.filter(m => m.id !== id));
    if (!supabaseNeedsSetup) {
      await dbDeleteMember(id);
    }
  };

  const handleClearAllMembers = async () => {
    if (members.length === 0) return;
    setMembersWithHistory([]);
    if (!supabaseNeedsSetup) {
      // Xóa tất cả các thành viên trên DB bằng cách lặp qua từng ID
      for (const m of members) {
        await dbDeleteMember(m.id);
      }
    }
  };

  const handleUndoMembers = () => {
    if (membersHistory.length === 0) return;
    const previous = membersHistory[membersHistory.length - 1];
    setMembersHistory(prev => prev.slice(0, prev.length - 1));
    setMembers(previous);
  };

  // 4. Hàm xử lý CRUD Thông Báo kết nối Supabase
  const handleAddAnnouncement = async (newAnn: Announcement) => {
    setAnnouncements(prev => [newAnn, ...prev]);
    if (!supabaseNeedsSetup) {
      await dbAddAnnouncement(newAnn);
    }
  };

  const handleUpdateAnnouncement = async (updatedAnn: Announcement) => {
    setAnnouncements(prev => prev.map(a => a.id === updatedAnn.id ? updatedAnn : a));
    if (!supabaseNeedsSetup) {
      await dbUpdateAnnouncement(updatedAnn);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    if (!supabaseNeedsSetup) {
      await dbDeleteAnnouncement(id);
    }
  };

  // 5. Thêm Lời Tưởng Nhớ mới kết nối Supabase
  const handleAddMemory = async (newMem: Omit<MemoryWall, 'id' | 'timestamp'>) => {
    const fullMemory: MemoryWall = {
      ...newMem,
      id: `mem-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setMemories(prev => [fullMemory, ...prev]);
    if (!supabaseNeedsSetup) {
      await dbAddMemory(fullMemory);
    }
  };

  // Kích hoạt chỉnh sửa trực tiếp từ phả hệ hoặc danh sách
  const handleEditMemberDirect = (memberId: string) => {
    setEditingMemberId(memberId);
    setCurrentView('admin');
  };

  // Sao chép mã SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col text-[#4a331a] bg-[#fdfbf7] selection:bg-[#b8956b] selection:text-white">
      
      {/* BANNER THÔNG BÁO SUPABASE CHƯA SETUP */}
      {supabaseNeedsSetup && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-xs font-sans text-amber-900 flex flex-wrap items-center justify-between gap-2 shadow-xs select-none">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 animate-bounce" />
            <span>
              <strong>Bắt đầu với Supabase:</strong> Cơ sở dữ liệu Supabase đang chờ bạn tạo bảng dữ liệu. Hãy bấm "Thiết Lập Ngay" để lấy mã SQL tạo bảng và chạy trên trang quản trị Supabase.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSetupModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1 px-3 rounded text-[11px] transition shadow-xs cursor-pointer"
            >
              Thiết Lập Ngay
            </button>
          </div>
        </div>
      )}

      {/* BANNER ĐANG TẢI DỮ LIỆU TỪ SUPABASE */}
      {supabaseLoading && !supabaseNeedsSetup && (
        <div className="bg-[#fcf8f0] border-b border-[#eadecb] py-1 px-4 text-[10px] text-gray-500 font-sans flex items-center justify-center gap-1.5 select-none">
          <RefreshCw className="w-3 h-3 text-[#b8956b] animate-spin" />
          <span>Đang đồng bộ dữ liệu gia tộc từ cơ sở dữ liệu đám mây Supabase...</span>
        </div>
      )}

      {/* 1. HERO BANNER */}
      <Hero settings={settings} />


      {/* 2. NAVBAR NAVIGATION */}
      <Navbar 
        currentView={currentView}
        onViewChange={setCurrentView}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView('home');
          alert('Bạn đã đăng xuất khỏi tài khoản.');
        }}
        onLoginShow={() => setShowLoginModal(true)}
      />

      {/* 3. DÒNG CHỮ CHẠY (MARQUEE) */}
      <div className="bg-[#d6b583] text-[#4a3219] py-1.5 border-b border-[#c29f6b] overflow-hidden select-none">
        <div className="marquee-container text-xs md:text-sm font-semibold flex">
          <span className="marquee-content whitespace-nowrap block pl-[100%] animate-marquee">
            <Star className="w-3 h-3 text-[#7c562e] inline-block mr-2 fill-[#7c562e]" /> Mộc bản thụ nguyên, thuỷ lưu tuyền bản - Cây có cội, nước có nguồn. Chào mừng quý thành viên đến với trang thông tin nội bộ Gia Phả Gia Đình Cụ Nghiêm Cung. Chúc quý vị và gia quyến một ngày an lành, hạnh phúc và vạn sự như ý! <Star className="w-3 h-3 text-[#7c562e] inline-block ml-2 fill-[#7c562e]" />
          </span>
        </div>
      </div>

      {/* 4. APP VIEW SECTIONS - ROUTER CHUYỂN VIEW */}
      <main className="flex-1 w-full bg-[#fdfbf7]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {currentView === 'home' && (
              <HomeSection 
                members={members}
                announcements={announcements}
                currentUser={currentUser}
                onViewChange={setCurrentView}
                onLoginShow={() => setShowLoginModal(true)}
                settings={settings}
              />
            )}

            {currentView === 'family-tree' && (
              <FamilyTreeSection 
                members={members}
                currentUser={currentUser}
                onEditMember={handleEditMemberDirect}
              />
            )}

            {currentView === 'member-list' && (
              <MemberListSection 
                members={members}
                currentUser={currentUser}
                onEditMember={handleEditMemberDirect}
              />
            )}

            {currentView === 'memorial' && (
              <MemorialSection 
                members={members}
                memories={memories}
                onAddMemory={handleAddMemory}
              />
            )}

            {currentView === 'statistics' && (
              <StatisticsSection 
                members={members}
              />
            )}

            {currentView === 'admin' && (
              <AdminSection 
                members={members}
                announcements={announcements}
                accounts={accounts}
                settings={settings}
                onUpdateSetting={handleUpdateSetting}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                onAddAnnouncement={handleAddAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                editingMemberId={editingMemberId}
                setEditingMemberId={setEditingMemberId}
                onClearAllMembers={handleClearAllMembers}
                onUndoMembers={handleUndoMembers}
                canUndoMembers={membersHistory.length > 0}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5. MODALS & POPUPS */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'admin') {
              setCurrentView('admin');
              alert('Đăng nhập quản trị thành công! Chào mừng bạn đến với khu vực quản lý gia tộc.');
            } else {
              alert(`Chào mừng ${user.fullName} đã kết nối.`);
            }
          }}
        />
      )}

      {/* 5.1 MODAL HƯỚNG DẪN THIẾT LẬP SUPABASE */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/65 z-[130] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden relative border border-[#b8956b] animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#3e2a16] p-5 text-center relative flex-shrink-0">
              <button 
                onClick={() => setShowSetupModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer text-xl font-bold"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="mx-auto w-10 h-10 bg-[#b8956b] rounded-full flex items-center justify-center shadow-md mb-2">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#fdfbf7] font-playfair uppercase tracking-wider">
                Khởi Tạo Cơ Sở Dữ Liệu Supabase
              </h3>
              <p className="text-[11px] text-[#eadecb] uppercase tracking-widest font-sans">
                Chỉ cần 3 bước để đồng bộ đám mây toàn diện
              </p>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#5c4021]">
              <div>
                <span className="font-bold text-[#b8956b] uppercase tracking-wide block mb-1">Bước 1: Truy cập trang quản trị Supabase</span>
                <p className="leading-relaxed mb-1">
                  Mở trang quản trị dự án Supabase của bạn tại liên kết bên dưới hoặc truy cập mục <strong className="text-amber-800">SQL Editor</strong> trong Dashboard của Supabase:
                </p>
                <a 
                  href="https://supabase.com/dashboard/project/ovcgqweqcrfwtjtojids/editor" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-amber-700 hover:underline font-semibold"
                >
                  Mở Supabase SQL Editor <Database className="w-3.5 h-3.5 inline" />
                </a>
              </div>

              <div>
                <span className="font-bold text-[#b8956b] uppercase tracking-wide block mb-1">Bước 2: Sao chép câu lệnh SQL khởi tạo</span>
                <p className="leading-relaxed mb-2">
                  Sao chép đoạn mã SQL dưới đây để tự động tạo ra 3 bảng: <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 border border-amber-200">members</code>, <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 border border-amber-200">announcements</code>, và <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-900 border border-amber-200">memories</code>. Dữ liệu ban đầu (INITIAL_DATA) sẽ tự động được đồng bộ ngay sau khi các bảng được tạo!
                </p>
                <div className="relative bg-slate-950 text-slate-100 rounded-md p-3 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800 shadow-inner">
                  <button 
                    onClick={handleCopySql}
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1 px-2.5 rounded flex items-center gap-1 transition text-[10px] cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span>Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                  <pre>{SUPABASE_SQL_SETUP}</pre>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#b8956b] uppercase tracking-wide block mb-1">Bước 3: Chạy lệnh (Run) & Tải lại trang</span>
                <p className="leading-relaxed">
                  Nhấn nút <strong className="text-amber-800">Run</strong> màu xanh trong Supabase Dashboard để chạy câu lệnh trên. Sau khi hoàn thành thành công, hãy bấm vào nút dưới đây để kiểm tra lại và làm mới dữ liệu.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#faf8f2] p-4 border-t border-[#eadecb] flex justify-end gap-2 flex-shrink-0">
              <button 
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 border border-[#d6b583] hover:bg-[#f3edd8] text-gray-700 font-medium rounded transition text-xs cursor-pointer"
              >
                Đóng hướng dẫn
              </button>
              <button 
                onClick={() => {
                  fetchSupabaseData();
                  alert('Hệ thống đang kiểm tra lại kết nối với các bảng Supabase...');
                }}
                className="px-4 py-2 bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold rounded shadow-md hover:shadow-lg transition text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tôi đã chạy lệnh, Đồng Bộ Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TRADITIONAL VIETNAMESE FOOTER */}
      <footer className="bg-[#3e2a16] text-[#eadecb] py-8 border-t-4 border-[#b8956b] mt-auto select-none print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <h4 className="font-playfair font-bold text-xl text-[#fdfbf7] tracking-wider uppercase">
            Gia Phả Gia Đình Cụ Nghiêm Cung
          </h4>
          <p className="text-xs opacity-80 max-w-md mx-auto leading-relaxed">
            Hệ thống lưu trữ số hóa gia phả, kết nối huyết thống linh thiêng của con cháu Nghiêm gia qua muôn thế hệ.
          </p>
          <div className="h-[1px] w-24 bg-[#b8956b] mx-auto opacity-40"></div>
          <div className="text-[10px] opacity-65 font-sans">
            &copy; 2026 Bản quyền thuộc về gia đình cụ Nghiêm Cung. Địa chỉ: Xã Hòa Xá, Huyện Ứng Hòa, Thành phố Hà Nội.
          </div>
        </div>
      </footer>

      {/* CUSTOM GLOBAL STYLES FOR MARQUEE AND CUSTOM CONNECTIONS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .marquee-container {
          overflow: hidden;
          width: 100%;
        }
      `}</style>

    </div>
  );
}
