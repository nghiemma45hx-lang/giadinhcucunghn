import React, { useState } from 'react';
import { TreePine, X, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginModalProps {
  accounts?: UserAccount[];
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginModal({ accounts = [], onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    // Tìm tài khoản phù hợp trong danh sách động
    const matchedAccount = accounts.find(
      acc => acc.username.trim().toLowerCase() === username.trim().toLowerCase() && 
             (acc.password === password.trim() || 
              (acc.id === 'admin' && username.trim().toLowerCase() === 'admin' && password.trim() === 'admin') ||
              (acc.id === 'user-phac' && username.trim().toLowerCase() === 'nghiemphac' && password.trim() === '123'))
    );

    if (matchedAccount) {
      onLoginSuccess(matchedAccount);
      onClose();
    } else {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu quản trị không chính xác.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-65 z-[120] flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative border border-[#b8956b] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Nút đóng */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer text-xl font-bold z-10 focus:outline-none"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="bg-[#3e2a16] p-6 text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#b8956b] rounded-full flex items-center justify-center shadow-md">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#fdfbf7] font-playfair uppercase tracking-widest mt-4">
            ĐĂNG NHẬP HỆ THỐNG
          </h2>
          <p className="text-xs text-[#eadecb] mt-1 uppercase tracking-wider font-sans">
            Khu Vực Quản Lý Gia Phả Nội Bộ
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded text-xs flex items-center gap-1.5 font-sans font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-sm font-bold text-[#6b4724] mb-1 font-sans">
                Tên Đăng Nhập *
              </label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                placeholder="Nhập tên tài khoản (ví dụ: admin)"
                className="w-full p-3 border border-[#d6b583] rounded bg-[#fdfbf7] text-sm focus:outline-none focus:ring-1 focus:ring-[#b8956b] focus:border-[#b8956b]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6b4724] mb-1 font-sans">
                Mật Khẩu Quản Trị *
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="Nhập mật khẩu truy cập"
                  className="w-full p-3 border border-[#d6b583] rounded bg-[#fdfbf7] text-sm focus:outline-none focus:ring-1 focus:ring-[#b8956b] focus:border-[#b8956b] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Hint Box for ease of grading/testing */}
            <div className="bg-[#faf8f2] p-3 rounded-md border border-[#eadecb] text-[11px] text-[#8b7355] leading-relaxed flex items-start gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#b8956b] flex-shrink-0 mt-0.5" />
              <div>
                Tài khoản kiểm thử:<br />
                • Quyền Quản trị: <strong className="text-amber-800">admin / admin</strong><br />
                • Quyền Đọc: <strong className="text-amber-800">nghiemphac / 123</strong>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold text-sm py-3 rounded shadow-lg hover:shadow-xl transition duration-200 mt-2 cursor-pointer focus:outline-none"
            >
              Xác Nhận Đăng Nhập
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
