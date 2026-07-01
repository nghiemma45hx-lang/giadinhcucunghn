import { useState } from 'react';
import { Network, Home, Users, Heart, BarChart3, ShieldAlert, LogIn, LogOut, Menu, X, Leaf } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onLoginShow: () => void;
}

export default function Navbar({
  currentView,
  onViewChange,
  currentUser,
  onLogout,
  onLoginShow
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'family-tree', label: 'Cây gia phả', icon: Network },
    { id: 'member-list', label: 'Danh sách thành viên', icon: Users },
    { id: 'memorial', label: 'Phòng tưởng nhớ', icon: Heart },
    { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#5c3e21] text-[#fdfbf7] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex-shrink-0 flex items-center gap-2 text-left focus:outline-none hover:opacity-90 transition"
            >
              <Leaf className="w-6 h-6 text-[#d6b583] fill-[#d6b583]" />
              <div className="hidden sm:block">
                <span className="font-playfair font-bold text-lg text-[#fdfbf7] tracking-wider block leading-none">
                  NGHIÊM GIA
                </span>
                <span className="text-[10px] text-[#eadecb] uppercase tracking-widest block font-sans">
                  Gia Phả Số Hóa
                </span>
              </div>
            </button>
            
            {/* Desktop Menu */}
            <div className="hidden xl:flex space-x-1 ml-8">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5 focus:outline-none cursor-pointer ${
                      isActive 
                        ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]' 
                        : 'hover:bg-[#4a3219] hover:text-white text-[#fdfbf7]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#d6b583]" />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Admin Menu Link */}
              {currentUser && currentUser.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5 focus:outline-none cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]'
                      : 'hover:bg-[#4a3219] hover:text-white text-[#fdfbf7]'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-[#d6b583]" />
                  Quản trị hệ thống
                </button>
              )}
            </div>
          </div>

          {/* User Controls */}
          <div className="hidden xl:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-[#d6b583] font-playfair bg-[#4a3219] py-1 px-3 rounded-md">
                  Xin chào, <strong className="text-white">{currentUser.fullName}</strong>
                </span>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 rounded-md text-sm font-bold bg-red-800 text-white hover:bg-red-700 transition shadow flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginShow}
                className="px-4 py-2 rounded-md text-sm font-bold bg-[#d6b583] text-[#4a3219] hover:bg-[#c29f6b] transition shadow flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập quản trị
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex xl:hidden items-center gap-2">
            {currentUser && (
              <span className="text-xs font-semibold text-[#d6b583] bg-[#4a3219] py-1 px-2 rounded block max-w-[120px] truncate">
                {currentUser.fullName}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#d6b583] hover:text-white hover:bg-[#4a3219] focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#5c3e21] border-t border-[#4a3219] px-2 pt-2 pb-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-base font-medium transition flex items-center gap-2.5 ${
                  isActive 
                    ? 'bg-[#4a3219] text-[#eadecb] border-l-4 border-[#d6b583]' 
                    : 'text-white hover:bg-[#4a3219]'
                }`}
              >
                <Icon className="w-5 h-5 text-[#d6b583]" />
                {item.label}
              </button>
            );
          })}
          
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full text-left px-3 py-2.5 rounded-md text-base font-medium transition flex items-center gap-2.5 ${
                currentView === 'admin'
                  ? 'bg-[#4a3219] text-[#eadecb] border-l-4 border-[#d6b583]'
                  : 'text-white hover:bg-[#4a3219]'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-[#d6b583]" />
              Quản trị hệ thống
            </button>
          )}

          <div className="pt-4 pb-2 border-t border-[#4a3219] mt-3">
            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 rounded-md text-sm font-bold bg-red-800 text-white hover:bg-red-700 transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            ) : (
              <button
                onClick={() => {
                  onLoginShow();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 rounded-md text-sm font-bold bg-[#d6b583] text-[#4a3219] hover:bg-[#c29f6b] transition flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập quản trị
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
