import React, { useState, useEffect } from 'react';
import { Member, MemoryWall } from '../types';
import { Heart, Flame, Sparkles, MessageSquare, User, Clock, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MemorialSectionProps {
  members: Member[];
  memories: MemoryWall[];
  onAddMemory: (newMemory: Omit<MemoryWall, 'id' | 'timestamp'>) => void;
}

export default function MemorialSection({
  members,
  memories,
  onAddMemory
}: MemorialSectionProps) {
  // Trạng thái thắp hương & thắp nến
  const [isIncenseBurning, setIsIncenseBurning] = useState(false);
  const [incenseProgress, setIncenseProgress] = useState(100);
  const [isCandleActive, setIsCandleActive] = useState(false);
  const [isFlowerActive, setIsFlowerActive] = useState(false);
  
  // Trạng thái Form viết tưởng niệm
  const [authorName, setAuthorName] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relationship, setRelationship] = useState('');
  const [memoryContent, setMemoryContent] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const deceasedMembers = members.filter(m => m.isDeceased);

  // Xử lý đếm ngược nhang cháy (incense)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isIncenseBurning) {
      interval = setInterval(() => {
        setIncenseProgress(prev => {
          if (prev <= 1) {
            setIsIncenseBurning(false);
            return 100;
          }
          return prev - 1;
        });
      }, 500); // 50 giây để cháy hết
    }
    return () => clearInterval(interval);
  }, [isIncenseBurning]);

  const handleBurnIncense = () => {
    setIsIncenseBurning(true);
    setIncenseProgress(100);
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !targetId || !relationship.trim() || !memoryContent.trim()) {
      setFormError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    const targetMem = members.find(m => m.id === targetId);
    if (!targetMem) return;

    onAddMemory({
      author: authorName,
      targetMemberId: targetId,
      targetMemberName: targetMem.fullName,
      relationship,
      content: memoryContent,
      candleLit: isCandleActive,
      incenseBurned: isIncenseBurning
    });

    setAuthorName('');
    setTargetId('');
    setRelationship('');
    setMemoryContent('');
    setFormError('');
    setFormSuccess(true);

    setTimeout(() => {
      setFormSuccess(false);
    }, 4000);
  };

  return (
    <div id="memorial-view" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#0f0f0f] rounded-lg shadow-2xl border border-[#2a2a2a] p-6 md:p-12 min-h-[70vh] flex flex-col items-center relative overflow-hidden">
        
        {/* Background Glowing Ambiance */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500 rounded-full filter blur-[100px] opacity-[0.06] pointer-events-none"></div>

        <h4 className="text-[#b8956b] text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-3 text-center">
          Bàn Thờ Tổ Tiên • Cội Nguồn Thiêng Liêng
        </h4>
        <h2 className="text-3xl md:text-5xl font-bold text-[#eadecb] font-playfair mb-4 uppercase tracking-widest text-center drop-shadow-md">
          Phòng Tưởng Niệm & Tri Ân
        </h2>
        <p className="text-[#888888] max-w-2xl text-center mb-10 text-sm leading-relaxed font-sans">
          Nơi con cháu thắp hương trầm dâng lễ kính dâng chân linh các bậc tiền nhân, bày tỏ tấm lòng hiếu thảo, lưu truyền đạo lý tốt đẹp "Uống nước nhớ nguồn, Ăn quả nhớ kẻ trồng cây".
        </p>

        {/* ALTAR AREA - BÀN THỜ ẢO */}
        <div className="w-full max-w-xl bg-[#141414] rounded-xl border border-[#333333] p-6 md:p-8 flex flex-col items-center shadow-inner relative mb-12">
          
          {/* Flame candles on the sides */}
          <div className="absolute left-6 top-8 flex flex-col items-center gap-1">
            <div className={`w-3 h-12 bg-red-800 rounded-b-md relative transition duration-1000 ${isCandleActive ? 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}>
              {isCandleActive && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 w-2.5 h-4 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b,0_0_20px_#ef4444] origin-bottom"></div>
              )}
            </div>
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Hồng Lạp</span>
          </div>

          <div className="absolute right-6 top-8 flex flex-col items-center gap-1">
            <div className={`w-3 h-12 bg-red-800 rounded-b-md relative transition duration-1000 ${isCandleActive ? 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}>
              {isCandleActive && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 w-2.5 h-4 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b,0_0_20px_#ef4444] origin-bottom"></div>
              )}
            </div>
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Hồng Lạp</span>
          </div>

          {/* Decorative Flowers */}
          {isFlowerActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.7, scale: 1 }}
              className="absolute bottom-4 left-10 text-pink-500 flex gap-1"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-[10px] font-sans font-semibold text-pink-300">Dâng Hoa Sen</span>
            </motion.div>
          )}

          {isFlowerActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.7, scale: 1 }}
              className="absolute bottom-4 right-10 text-pink-500 flex gap-1"
            >
              <span className="text-[10px] font-sans font-semibold text-pink-300">Dâng Hoa Sen</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </motion.div>
          )}

          {/* Lư Hương Trung Tâm */}
          <div className="flex flex-col items-center relative py-6">
            
            {/* Smoke effects from burning incense */}
            {isIncenseBurning && (
              <div className="absolute top-[-30px] flex justify-center gap-4 z-0">
                <div className="w-0.5 h-16 bg-gradient-to-t from-gray-500 to-transparent animate-smoke-slow opacity-60"></div>
                <div className="w-0.5 h-20 bg-gradient-to-t from-gray-400 to-transparent animate-smoke-fast opacity-50"></div>
                <div className="w-0.5 h-16 bg-gradient-to-t from-gray-500 to-transparent animate-smoke-slow opacity-60"></div>
              </div>
            )}

            {/* Chân nhang */}
            <div className="flex justify-center gap-3.5 mb-[-12px] z-10 relative">
              <div className="w-1.5 h-16 bg-gradient-to-t from-[#8b5a2b] to-[#d6a56b] rounded-t-full relative">
                {isIncenseBurning && (
                  <div 
                    style={{ height: `${incenseProgress}%` }}
                    className="absolute inset-0 bg-red-600 rounded-t-full transition-all duration-500 origin-bottom"
                  >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#ff5e00] rounded-full shadow-[0_0_8px_#ff5e00] animate-pulse"></div>
                  </div>
                )}
              </div>
              <div className="w-1.5 h-20 bg-gradient-to-t from-[#8b5a2b] to-[#d6a56b] rounded-t-full relative">
                {isIncenseBurning && (
                  <div 
                    style={{ height: `${incenseProgress}%` }}
                    className="absolute inset-0 bg-red-600 rounded-t-full transition-all duration-500 origin-bottom"
                  >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#ff5e00] rounded-full shadow-[0_0_10px_#ff5e00] animate-pulse"></div>
                  </div>
                )}
              </div>
              <div className="w-1.5 h-16 bg-gradient-to-t from-[#8b5a2b] to-[#d6a56b] rounded-t-full relative">
                {isIncenseBurning && (
                  <div 
                    style={{ height: `${incenseProgress}%` }}
                    className="absolute inset-0 bg-red-600 rounded-t-full transition-all duration-500 origin-bottom"
                  >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#ff5e00] rounded-full shadow-[0_0_8px_#ff5e00] animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Lư đồng */}
            <div className="w-28 h-22 bg-gradient-to-b from-[#a65d1d] to-[#5c3008] rounded-b-[45px] border-t-[3px] border-[#d69e2e] flex flex-col items-center justify-center shadow-[0_12px_35px_rgba(0,0,0,0.8)] z-20 relative">
              <span className="text-[#fdfbf7] text-[10px] font-bold uppercase tracking-widest text-center leading-tight">
                Nghiêm<br />Gia
              </span>
              <div className="absolute bottom-2 w-4 h-1 bg-[#d69e2e] rounded-full opacity-40"></div>
            </div>
          </div>

          {/* Action buttons on altar */}
          <div className="grid grid-cols-3 gap-3 w-full mt-6 border-t border-[#262626] pt-6 z-30">
            <button
              onClick={handleBurnIncense}
              disabled={isIncenseBurning}
              className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer focus:outline-none ${
                isIncenseBurning 
                  ? 'bg-amber-950 text-amber-500 border border-amber-900 cursor-not-allowed'
                  : 'bg-amber-700 hover:bg-amber-600 text-white shadow-md'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Thắp Hương Trầm
            </button>
            <button
              onClick={() => setIsCandleActive(!isCandleActive)}
              className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer focus:outline-none ${
                isCandleActive 
                  ? 'bg-red-950 text-red-400 border border-red-900'
                  : 'bg-red-800 hover:bg-red-700 text-white shadow-md'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> {isCandleActive ? 'Tắt Nến Trầm' : 'Thắp Nến Đăng'}
            </button>
            <button
              onClick={() => setIsFlowerActive(!isFlowerActive)}
              className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer focus:outline-none ${
                isFlowerActive 
                  ? 'bg-pink-950 text-pink-400 border border-pink-900'
                  : 'bg-pink-800 hover:bg-pink-700 text-white shadow-md'
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> {isFlowerActive ? 'Thu Hoa Sen' : 'Dâng Hoa Kính'}
            </button>
          </div>
        </div>

        {/* MEMORY FORM AND WALL GRID */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[#222222] pt-10">
          
          {/* CỘT TRÁI: Form gửi lời tưởng nhớ */}
          <div className="lg:col-span-5 bg-[#141414] rounded-xl border border-[#2a2a2a] p-6 self-start">
            <h3 className="text-[#d6b583] text-lg font-bold font-playfair mb-4 flex items-center gap-1.5 border-b border-[#262626] pb-2">
              <MessageSquare className="w-5 h-5" /> Gửi Lời Kính Viếng
            </h3>
            
            {formError && (
              <div className="mb-4 bg-red-950 border border-red-800 text-red-300 px-3.5 py-2 rounded text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 bg-green-950 border border-green-800 text-green-300 px-3.5 py-2 rounded text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Gửi lời tưởng nhớ thành kính thành công! Lời chúc đã được lưu lên bảng vàng.</span>
              </div>
            )}

            <form onSubmit={handleAddMemorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Họ Tên Con Cháu</label>
                <input 
                  type="text" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Nhập tên của bạn (ví dụ: Nghiêm Xuân Mã)"
                  className="w-full p-2.5 rounded bg-[#1f1f1f] border border-[#333] text-white focus:outline-none focus:border-[#b8956b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Mối Quan Hệ</label>
                  <input 
                    type="text" 
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="ví dụ: Cháu nội, Con trai..."
                    className="w-full p-2.5 rounded bg-[#1f1f1f] border border-[#333] text-white focus:outline-none focus:border-[#b8956b]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Kính gửi Hương Linh Cụ</label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#1f1f1f] border border-[#333] text-white focus:outline-none focus:border-[#b8956b]"
                  >
                    <option value="">-- Chọn Cụ tiên nhân --</option>
                    {deceasedMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} (Đời {m.generation})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Nội dung kính dâng (Cầu nguyện/Tâm nguyện)</label>
                <textarea 
                  rows={4}
                  value={memoryContent}
                  onChange={(e) => setMemoryContent(e.target.value)}
                  placeholder="Thành kính thắp nén nhang dâng Tổ Tiên, cầu chúc chân linh các cụ luôn siêu sinh tịnh độ, gia hộ độ trì cho dòng tộc bình an, hưng thịnh..."
                  className="w-full p-2.5 rounded bg-[#1f1f1f] border border-[#333] text-white focus:outline-none focus:border-[#b8956b] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold py-2.5 rounded transition duration-200 cursor-pointer"
              >
                Kính dâng tâm nguyện
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: Bảng tưởng niệm - Danh sách lời chúc */}
          <div className="lg:col-span-7 flex flex-col">
            <h3 className="text-[#d6b583] text-lg font-bold font-playfair mb-4 flex items-center gap-1.5 border-b border-[#262626] pb-2">
              <Sparkles className="w-5 h-5 text-[#b8956b]" /> Bảng Lưu Niệm Thành Kính
            </h3>
            
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {memories.length === 0 ? (
                <div className="bg-[#141414] rounded-lg p-8 border border-[#222] text-center italic text-gray-500 text-sm">
                  Chưa có lời tưởng nhớ nào được lưu. Hãy là người thắp nhang và gửi lời đầu tiên.
                </div>
              ) : (
                <AnimatePresence>
                  {memories.map(mem => (
                    <motion.div 
                      key={mem.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-[#141414] rounded-xl border border-[#2a2a2a] p-4 flex gap-4 shadow-sm relative hover:border-[#b8956b] transition-colors duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-[#d6b583]">
                          <User className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <span className="text-sm font-bold text-gray-200 block">
                            {mem.author} <span className="text-xs font-normal text-gray-500">({mem.relationship})</span>
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {new Date(mem.timestamp).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <p className="text-xs text-[#b8956b] mb-2">
                          Kính dâng lên cụ: <strong className="uppercase font-semibold text-amber-200">{mem.targetMemberName}</strong>
                        </p>

                        <p className="text-xs text-gray-400 italic leading-relaxed whitespace-pre-line bg-[#1c1c1c] p-3 rounded border border-[#222]">
                          "{mem.content}"
                        </p>
                      </div>

                      {/* Small glowing dots for flame/incense associated */}
                      <div className="absolute top-4 right-4 flex gap-1 text-[9px] font-bold">
                        {mem.candleLit && <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" title="Đã thắp nến" />}
                        {mem.incenseBurned && <Sparkles className="w-3.5 h-3.5 text-amber-500" title="Đã thắp hương" />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>

        {/* DANH SÁCH BAN THỜ AN TÁNG TIÊN NHÂN */}
        <div className="w-full mt-12 border-t border-[#222222] pt-10 text-left">
          <h3 className="text-[#d6b583] text-xl font-bold uppercase tracking-widest mb-6 font-playfair border-b border-[#262626] pb-2">
            Danh Sách Tiên Nhân Kính Tế
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {deceasedMembers.map(member => (
              <div 
                key={member.id}
                className="bg-[#141414] rounded-xl p-5 border border-[#222] hover:border-[#b8956b] transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-[#fdfbf7] font-bold text-base font-playfair mb-1">{member.fullName}</h4>
                  <p className="text-[#d66b1d] font-bold uppercase tracking-wider text-[10px] mb-3">
                    Đời {member.generation} • {member.relationshipToHead || 'Bậc tiên nhân'}
                  </p>
                  
                  <div className="space-y-1.5 text-gray-400 font-sans border-t border-dashed border-[#262626] pt-2.5">
                    {member.deathAnniversaryLunar && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 font-semibold w-[80px]">Ngày kỵ nhật:</span>
                        <span className="text-red-400 font-bold">{member.deathAnniversaryLunar} Âm lịch</span>
                      </div>
                    )}
                    {member.birthDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 font-semibold w-[80px]">Niên hiệu:</span>
                        <span className="font-mono">{member.birthDate} - {member.deathDate || 'Chưa rõ'}</span>
                      </div>
                    )}
                    {member.restingPlace && (
                      <div className="flex items-start gap-1.5">
                        <span className="text-gray-500 font-semibold w-[80px] flex-shrink-0">Mộ phần:</span>
                        <span className="text-gray-300 italic leading-normal">{member.restingPlace}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setTargetId(member.id);
                    // Cuộn trang lên form
                    document.getElementById('memorial-view')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full mt-4 bg-[#1f1f1f] hover:bg-[#b8956b] hover:text-white border border-[#333] hover:border-[#b8956b] text-gray-300 py-2 rounded font-bold transition duration-200 text-[11px]"
                >
                  Dâng nhang tưởng nhớ
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CUSTOM SMOKE KEYFRAME ANIMATION */}
      <style>{`
        @keyframes smokeSlow {
          0% { transform: translateY(0) scaleX(1) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translateY(-40px) scaleX(1.5) translateX(-10px); opacity: 0.3; }
          100% { transform: translateY(-80px) scaleX(2) translateX(10px); opacity: 0; }
        }
        @keyframes smokeFast {
          0% { transform: translateY(0) scaleX(1) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          40% { transform: translateY(-30px) scaleX(1.3) translateX(8px); opacity: 0.35; }
          100% { transform: translateY(-70px) scaleX(1.8) translateX(-8px); opacity: 0; }
        }
        .animate-smoke-slow {
          animation: smokeSlow 4s infinite linear;
        }
        .animate-smoke-fast {
          animation: smokeFast 3s infinite linear;
        }
      `}</style>
    </div>
  );
}
