import { useState } from 'react';
import { Member, UserAccount } from '../types';
import { Network, ZoomIn, ZoomOut, RotateCcw, HelpCircle, Eye, Edit2, Check, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface FamilyTreeSectionProps {
  members: Member[];
  currentUser: UserAccount | null;
  onEditMember: (memberId: string) => void;
}

export default function FamilyTreeSection({
  members,
  currentUser,
  onEditMember
}: FamilyTreeSectionProps) {
  const [scale, setScale] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showHelper, setShowHelper] = useState<boolean>(true);

  // Tìm cụ tổ (Đời thấp nhất - thông thường là Đời 15)
  const sortedGenerations = Array.from(new Set(members.map(m => m.generation))).sort((a, b) => a - b);
  const oldestGen = sortedGenerations[0] || 15;
  
  // Lấy các thành viên của Đời 15 làm các gốc rễ
  const rootMembers = members.filter(m => m.generation === oldestGen && !m.parentId);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.6));
  const handleReset = () => setScale(1);

  // Render đệ quy các con cháu của một thành viên nhất định
  const renderTreeNodes = (parentId: string) => {
    const children = members.filter(m => m.parentId === parentId);
    if (children.length === 0) return null;

    // Sắp xếp con cháu đúng thứ tự các đời theo logic phả hệ:
    // 1. Theo năm sinh (ai sinh trước đứng trước bên trái)
    // 2. Theo vai vế (Trưởng, cả đứng trước Thứ)
    // 3. Theo thứ tự ABC nếu không có dữ liệu năm sinh
    const sortedChildren = [...children].sort((a, b) => {
      const getBirthYear = (m: Member) => {
        if (!m.birthDate) return 9999;
        const matched = m.birthDate.match(/\d{4}/);
        return matched ? parseInt(matched[0], 10) : 9999;
      };

      const yearA = getBirthYear(a);
      const yearB = getBirthYear(b);

      if (yearA !== yearB) {
        return yearA - yearB;
      }

      const isA_Truong = a.relationshipToHead?.toLowerCase().includes('trưởng') || a.relationshipToHead?.toLowerCase().includes('cả');
      const isB_Truong = b.relationshipToHead?.toLowerCase().includes('trưởng') || b.relationshipToHead?.toLowerCase().includes('cả');

      if (isA_Truong && !isB_Truong) return -1;
      if (!isA_Truong && isB_Truong) return 1;

      return a.fullName.localeCompare(b.fullName, 'vi');
    });

    return (
      <ul className="flex justify-center pt-6 relative">
        {sortedChildren.map(child => {
          let nodeColorClass = 'node-blue';
          if (child.gender === 'Nữ') {
            nodeColorClass = 'node-red';
          }
          if (child.isDeceased) {
            nodeColorClass = 'node-gold';
          }
          if (child.fullName.includes('Cụ Bà Cả') || child.fullName.includes('Cụ Bà Hai')) {
            nodeColorClass = 'node-purple';
          }

          const hasSpouses = (child.spouses && child.spouses.length > 0) || child.spouseName;

          return (
            <li key={child.id} className="float-left text-center relative px-2 pt-6">
              {/* Box Node */}
              <div 
                onClick={() => setSelectedMember(child)}
                className={`node-box ${nodeColorClass} transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex flex-col items-center justify-center p-3 rounded-lg border-2 bg-white min-w-[130px] min-h-[65px] relative z-10`}
              >
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 mb-0.5">
                  ĐỜI {child.generation} • {child.relationshipToHead || 'Con cháu'}
                </span>
                <span className="text-xs font-bold uppercase text-[#4a331a] truncate max-w-[120px]">
                  {child.fullName}
                </span>
                {child.birthDate && (
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                    ({child.birthDate}{child.deathDate ? ` - ${child.deathDate}` : ''})
                  </span>
                )}
                
                {/* Spouse indicator icon */}
                {hasSpouses && (
                  <div className="absolute -top-1.5 -right-1.5 bg-[#e53e3e] text-white px-1 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 text-[8px] font-bold">
                    <Heart className="w-2.5 h-2.5 fill-white text-white" />
                    {child.spouses && child.spouses.length > 1 ? child.spouses.length : ''}
                  </div>
                )}
              </div>

              {/* Con cháu của node này */}
              {renderTreeNodes(child.id)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div id="family-tree-view" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER BANNER */}
      <div className="bg-white rounded-lg shadow-sm border border-[#eadecb] p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#6b4724] font-playfair flex items-center gap-2 uppercase tracking-wider">
              <Network className="w-6 h-6 text-[#b8956b]" /> Sơ Đồ Cây Gia Phả
            </h2>
            <p className="text-xs text-[#8b7355] mt-1 font-sans">
              Hệ thống cây phả hệ thông minh tự động dựng khung kết nối tổ tiên qua các đời 15, 16, 17, 18, 19.
            </p>
          </div>
          
          {/* Controls Panel */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button 
              onClick={handleZoomIn}
              className="p-2 bg-[#f4ecd8] hover:bg-[#b8956b] hover:text-white rounded-md text-[#4a3219] transition cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-2 bg-[#f4ecd8] hover:bg-[#b8956b] hover:text-white rounded-md text-[#4a3219] transition cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={handleReset}
              className="p-2 bg-[#f4ecd8] hover:bg-[#b8956b] hover:text-white rounded-md text-[#4a3219] transition cursor-pointer"
              title="Đặt lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowHelper(!showHelper)}
              className="p-2 bg-[#f4ecd8] hover:bg-[#b8956b] hover:text-white rounded-md text-[#4a3219] transition cursor-pointer"
              title="Hướng dẫn chú giải"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chú giải ý nghĩa màu sắc */}
        {showHelper && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 border-t border-dashed border-[#eadecb] pt-4 text-xs font-sans"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md border-2 border-[#3182ce] bg-[#ebf8ff]"></span>
              <span className="text-[#2c5282] font-semibold">Nam (Trong Họ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md border-2 border-[#e53e3e] bg-[#fff5f5]"></span>
              <span className="text-[#9b2c2c] font-semibold">Nữ (Trong Họ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md border-2 border-[#d69e2e] bg-[#fffff0]"></span>
              <span className="text-[#744210] font-semibold">Đã Khuất / Tưởng Niệm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md border-2 border-[#805ad5] bg-[#faf5ff]"></span>
              <span className="text-[#44337a] font-semibold">Bạn Đời / Ngoại Tộc</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* CANVAS CÂY GIA PHẢ CHÍNH */}
      <div className="bg-white rounded-lg shadow-md border border-[#eadecb] overflow-auto max-h-[70vh] p-8 md:p-12">
        <div 
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}
          className="tree flex flex-col items-center justify-start min-w-[1200px]"
        >
          <ul>
            {rootMembers.map(root => {
              // Lấy các bạn đời/spouses của cụ cố nếu có
              return (
                <li key={root.id} className="float-left text-center relative px-2">
                  <div className="flex items-center justify-center gap-4">
                    {/* Node Gốc (Cụ Tổ Ông) */}
                    <div 
                      onClick={() => setSelectedMember(root)}
                      className="node-box node-gold transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex flex-col items-center justify-center p-3 rounded-lg border-2 bg-white min-w-[130px] min-h-[65px] relative z-10"
                    >
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 mb-0.5">
                        ĐỜI {root.generation} • {root.relationshipToHead || 'Cụ Tổ'}
                      </span>
                      <span className="text-xs font-bold uppercase text-[#4a331a]">
                        {root.fullName}
                      </span>
                      {root.birthDate && (
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                          ({root.birthDate} - {root.deathDate || 'đã mất'})
                        </span>
                      )}
                    </div>
                    
                    {/* Render tất cả các bạn đời của cụ tổ */}
                    {root.spouses && root.spouses.length > 0 ? (
                      root.spouses.map((spouse, sIdx) => {
                        const spouseMember = members.find(m => m.fullName.toLowerCase() === spouse.name.toLowerCase());
                        return (
                          <div key={spouse.id || sIdx} className="flex items-center gap-2">
                            <span className="text-gray-400 font-bold font-sans">&amp;</span>
                            <div 
                              onClick={() => {
                                if (spouseMember) setSelectedMember(spouseMember);
                                else setSelectedMember({
                                  id: `spouse-mock-${spouse.id || sIdx}`,
                                  fullName: spouse.name,
                                  generation: root.generation,
                                  gender: 'Nữ',
                                  isDeceased: true,
                                  relationshipToHead: spouse.type || 'Cụ Tổ Bà',
                                  story: 'Vợ hiền dâu thảo. Một đời tần tảo vun đắp gia tộc ấm no hạnh phúc.'
                                });
                              }}
                              className="node-box node-purple transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex flex-col items-center justify-center p-3 rounded-lg border-2 bg-white min-w-[130px] min-h-[65px] relative z-10"
                            >
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-700 mb-0.5">
                                ĐỜI {root.generation} • {spouse.type || 'Cụ Tổ Bà'}
                              </span>
                              <span className="text-xs font-bold uppercase text-[#4a331a] truncate max-w-[120px]">
                                {spouse.name}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {spouseMember?.birthDate ? `(${spouseMember.birthDate})` : '(đã mất)'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : root.spouseName ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold font-sans">&amp;</span>
                        <div 
                          onClick={() => {
                            const spouseMember = members.find(m => m.fullName.includes(root.spouseName || 'Lê Thị Mai'));
                            if (spouseMember) setSelectedMember(spouseMember);
                            else setSelectedMember({
                              id: 'le-thi-mai-mock',
                              fullName: root.spouseName || 'Lê Thị Mai',
                              generation: root.generation,
                              gender: 'Nữ',
                              isDeceased: true,
                              relationshipToHead: 'Cụ Tổ Bà',
                              story: 'Vợ hiền dâu thảo nhà họ Nghiêm. Một đời tần tảo vun đắp gia tộc ấm no hạnh phúc.'
                            });
                          }}
                          className="node-box node-purple transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex flex-col items-center justify-center p-3 rounded-lg border-2 bg-white min-w-[130px] min-h-[65px] relative z-10"
                        >
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-700 mb-0.5">
                            ĐỜI {root.generation} • Cụ Tổ Bà
                          </span>
                          <span className="text-xs font-bold uppercase text-[#4a331a]">
                            {root.spouseName}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                            (1889 - 1971)
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Render con cháu trực thuộc */}
                  {renderTreeNodes(root.id)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* MODAL CHI TIẾT THÀNH VIÊN KHI CLICK */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-65 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-[#b8956b] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#3e2a16] text-[#fdfbf7] p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#d6b583]" />
                <h3 className="text-lg font-bold uppercase font-playfair">Thông Tin Phả Hệ</h3>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer focus:outline-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="text-center py-4 border-b border-gray-100 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mb-2 ${
                  selectedMember.isDeceased 
                    ? 'bg-amber-100 text-amber-800'
                    : selectedMember.gender === 'Nam' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {selectedMember.fullName.charAt(0)}
                </div>
                <h4 className="text-xl font-bold text-[#6b4724] font-playfair">{selectedMember.fullName}</h4>
                <p className="text-xs text-[#8b7355] mt-1 font-semibold">
                  Thế Hệ Thứ {selectedMember.generation} • {selectedMember.relationshipToHead || 'Con cháu'}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMember.gender === 'Nam' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                  }`}>
                    {selectedMember.gender}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMember.isDeceased ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {selectedMember.isDeceased ? 'Tưởng Niệm (Đã Mất)' : 'Còn sống'}
                  </span>
                </div>
              </div>

              {/* Chi tiết từng thuộc tính */}
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                  <span className="text-gray-400">Sinh/Mất:</span>
                  <span className="col-span-2 text-[#4a331a] font-mono">
                    {selectedMember.birthDate || 'Chưa rõ'} {selectedMember.deathDate ? ` - ${selectedMember.deathDate}` : (selectedMember.isDeceased ? ' (Đã mất)' : ' (Còn sống)')}
                  </span>
                </div>

                {selectedMember.deathAnniversaryLunar && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Ngày giỗ âm:</span>
                    <span className="col-span-2 text-red-700 font-bold">
                      {selectedMember.deathAnniversaryLunar}
                    </span>
                  </div>
                )}

                {selectedMember.spouses && selectedMember.spouses.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Bạn đời ({selectedMember.spouses.length}):</span>
                    <div className="col-span-2 space-y-1">
                      {selectedMember.spouses.map((spouse, sIdx) => (
                        <div key={spouse.id || sIdx} className="text-[#4a331a] font-semibold flex items-center gap-1.5 flex-wrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          <span>{spouse.name}</span>
                          <span className="text-[9px] text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.2 rounded font-bold uppercase">
                            {spouse.type || 'Phối ngẫu'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedMember.spouseName ? (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Bạn đời:</span>
                    <span className="col-span-2 text-[#4a331a] font-semibold">
                      {selectedMember.spouseName} {selectedMember.spouseType ? `(${selectedMember.spouseType})` : ''}
                    </span>
                  </div>
                ) : null}

                {selectedMember.parentId && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Cha (Cấp trên):</span>
                    <span className="col-span-2 text-[#4a331a] font-semibold">
                      {members.find(m => m.id === selectedMember.parentId)?.fullName || 'Chưa rõ'}
                    </span>
                  </div>
                )}

                {selectedMember.motherId && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Mẹ:</span>
                    <span className="col-span-2 text-[#4a331a] font-semibold">
                      {members.find(m => m.id === selectedMember.motherId)?.fullName || 'Chưa rõ'}
                    </span>
                  </div>
                )}

                {selectedMember.chiBranch && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Chi nhánh:</span>
                    <span className="col-span-2 text-[#4a331a]">{selectedMember.chiBranch}</span>
                  </div>
                )}

                {selectedMember.birthPlace && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Quê quán:</span>
                    <span className="col-span-2 text-[#4a331a]">{selectedMember.birthPlace}</span>
                  </div>
                )}

                {selectedMember.restingPlace && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Nơi an táng:</span>
                    <span className="col-span-2 text-[#4a331a] italic">{selectedMember.restingPlace}</span>
                  </div>
                )}

                {selectedMember.contact && !selectedMember.isDeceased && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Liên hệ SĐT:</span>
                    <span className="col-span-2 text-green-700 font-bold font-mono">{selectedMember.contact}</span>
                  </div>
                )}

                {selectedMember.job && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Nghề nghiệp:</span>
                    <span className="col-span-2 text-[#4a331a]">{selectedMember.job}</span>
                  </div>
                )}

                {selectedMember.education && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Trình độ:</span>
                    <span className="col-span-2 text-[#4a331a]">{selectedMember.education}</span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-gray-400 block mb-1">Ghi chú & Tiểu sử:</span>
                  <p className="text-[#4a331a] italic text-xs leading-relaxed bg-[#faf8f2] p-3 rounded-md border border-[#eadecb]">
                    {selectedMember.story || 'Chưa cập nhật đầy đủ thông tin tiểu sử cuộc đời.'}
                  </p>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="pt-4 flex gap-2">
                {currentUser && currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      onEditMember(selectedMember.id);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa thông tin
                  </button>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold py-2 px-4 rounded-md text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Xem tiếp sơ đồ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STYLES CHO DÒNG KẾT NỐI CỦA CÂY GIA PHẢ */}
      <style>{`
        .tree ul {
          padding-top: 24px; position: relative;
          display: flex; justify-content: center;
        }
        .tree li {
          float: left; text-align: center;
          list-style-type: none;
          position: relative;
          padding: 24px 6px 0 6px;
        }
        .tree li::before, .tree li::after {
          content: ''; position: absolute; top: 0; right: 50%;
          border-top: 2px solid #8b7355;
          width: 50%; height: 24px;
        }
        .tree li::after {
          right: auto; left: 50%;
          border-left: 2px solid #8b7355;
        }
        .tree li:only-child::after, .tree li:only-child::before {
          display: none;
        }
        .tree li:only-child { padding-top: 0; }
        .tree li:first-child::before, .tree li:last-child::after {
          border: 0 none;
        }
        .tree li:last-child::before {
          border-right: 2px solid #8b7355;
        }
        .tree ul ul::before {
          content: ''; position: absolute; top: 0; left: 50%;
          border-left: 2px solid #8b7355;
          width: 0; height: 24px;
          transform: translateX(-50%);
        }
        
        /* Node Color Styles */
        .node-blue { border-color: #3182ce; background-color: #ebf8ff; color: #2c5282; }
        .node-red { border-color: #e53e3e; background-color: #fff5f5; color: #9b2c2c; }
        .node-gold { border-color: #d69e2e; background-color: #fffff0; color: #744210; }
        .node-purple { border-color: #805ad5; background-color: #faf5ff; color: #44337a; }
      `}</style>

    </div>
  );
}
