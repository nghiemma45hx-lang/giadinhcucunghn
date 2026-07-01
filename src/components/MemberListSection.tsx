import { useState } from 'react';
import { Member, UserAccount } from '../types';
import { Search, Users, User, Phone, MapPin, Sparkles, Filter, RefreshCw, Edit2, Eye } from 'lucide-react';

interface MemberListSectionProps {
  members: Member[];
  currentUser: UserAccount | null;
  onEditMember: (memberId: string) => void;
}

export default function MemberListSection({
  members,
  currentUser,
  onEditMember
}: MemberListSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Lấy danh sách các Đời để lọc
  const generations = Array.from(new Set(members.map(m => m.generation))).sort((a, b) => a - b);

  // Bộ lọc
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.relationshipToHead && m.relationshipToHead.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (m.story && m.story.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGen = selectedGen === 'all' ? true : m.generation.toString() === selectedGen;
    const matchesGender = selectedGender === 'all' ? true : m.gender === selectedGender;
    
    let matchesStatus = true;
    if (selectedStatus === 'living') {
      matchesStatus = !m.isDeceased;
    } else if (selectedStatus === 'deceased') {
      matchesStatus = m.isDeceased;
    }

    return matchesSearch && matchesGen && matchesGender && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGen('all');
    setSelectedGender('all');
    setSelectedStatus('all');
  };

  return (
    <div id="member-list-view" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER CONTROLS */}
      <div className="bg-white rounded-lg shadow-sm border border-[#eadecb] p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#faf5eb] pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#6b4724] font-playfair flex items-center gap-2 uppercase tracking-wider">
              <Users className="w-6 h-6 text-[#b8956b]" /> Danh Sách Thành Viên Gia Đình
            </h2>
            <p className="text-xs text-[#8b7355] mt-1 font-sans">
              Tìm kiếm nhanh và lọc thông tin hồ sơ của mọi thế hệ thành viên trong gia quyến Cụ Nghiêm Cung.
            </p>
          </div>
          <span className="text-xs font-semibold bg-[#f4ecd8] text-[#6b4724] py-1.5 px-3 rounded-full self-start md:self-auto">
            Tổng số: <strong className="text-amber-800 font-mono text-sm">{filteredMembers.length}</strong> / {members.length} thành viên
          </span>
        </div>

        {/* INPUTS AND FILTER CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Nhập họ tên, chức danh, tiểu sử..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#d6b583] rounded-md bg-[#fdfbf7] focus:outline-none focus:ring-1 focus:ring-[#b8956b] focus:border-[#b8956b]"
            />
          </div>

          {/* Lọc thế hệ */}
          <div className="relative">
            <select
              value={selectedGen}
              onChange={(e) => setSelectedGen(e.target.value)}
              className="w-full p-2 text-sm border border-[#d6b583] rounded-md bg-[#fdfbf7] focus:outline-none focus:ring-1 focus:ring-[#b8956b] text-[#4a331a] font-sans"
            >
              <option value="all">Tất cả thế hệ (Đời)</option>
              {generations.map(gen => (
                <option key={gen} value={gen.toString()}>Đời Thứ {gen}</option>
              ))}
            </select>
          </div>

          {/* Lọc giới tính */}
          <div className="relative">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full p-2 text-sm border border-[#d6b583] rounded-md bg-[#fdfbf7] focus:outline-none focus:ring-1 focus:ring-[#b8956b] text-[#4a331a] font-sans"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          {/* Lọc tình trạng */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 text-sm border border-[#d6b583] rounded-md bg-[#fdfbf7] focus:outline-none focus:ring-1 focus:ring-[#b8956b] text-[#4a331a] font-sans"
            >
              <option value="all">Trạng thái (Sống/Mất)</option>
              <option value="living">Thành viên còn sống</option>
              <option value="deceased">Kính nhớ (Đã khuất)</option>
            </select>
          </div>
        </div>

        {/* Nút reset */}
        {(searchTerm || selectedGen !== 'all' || selectedGender !== 'all' || selectedStatus !== 'all') && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#8b7355] hover:text-[#6b4724] font-semibold flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Đặt lại bộ lọc tìm kiếm
            </button>
          </div>
        )}
      </div>

      {/* MEMBER DIRECTORY - GRID LAYOUT */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#eadecb] p-12 text-center">
          <Filter className="w-12 h-12 text-[#b8956b] mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-[#6b4724] font-playfair">Không tìm thấy thành viên phù hợp</h3>
          <p className="text-xs text-[#8b7355] mt-1">Vui lòng thử điều chỉnh lại từ khóa hoặc bộ lọc của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div 
              key={member.id}
              className="bg-white rounded-lg border border-[#eadecb] p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg ${
                      member.isDeceased 
                        ? 'bg-amber-100 text-amber-800'
                        : member.gender === 'Nam' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                    }`}>
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#6b4724] font-playfair hover:text-[#b8956b] transition cursor-pointer text-[15px] leading-snug">
                        {member.fullName}
                      </h4>
                      <span className="text-[10px] text-[#8b7355] font-sans font-bold">
                        Đời thứ {member.generation} • {member.relationshipToHead || 'Con cháu'}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    member.isDeceased ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {member.isDeceased ? 'Tưởng nhớ' : 'Còn sống'}
                  </span>
                </div>

                {/* Body info list */}
                <div className="space-y-1.5 text-xs text-[#4a331a] mb-4 border-t border-dashed border-[#faf5eb] pt-3 font-sans">
                  {member.spouseName && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="font-semibold text-gray-400 w-[70px]">Bạn đời:</span>
                      <span className="truncate">
                        {member.spouseName} {member.spouseType ? `(${member.spouseType})` : ''}
                      </span>
                    </div>
                  )}
                  {member.chiBranch && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="font-semibold text-gray-400 w-[70px]">Chi nhánh:</span>
                      <span>{member.chiBranch}</span>
                    </div>
                  )}
                  {member.birthPlace && (
                    <div className="flex items-start gap-1 text-gray-500">
                      <span className="font-semibold text-gray-400 w-[70px] flex-shrink-0">Quê quán:</span>
                      <span className="line-clamp-1">{member.birthPlace}</span>
                    </div>
                  )}
                  {member.restingPlace && (
                    <div className="flex items-start gap-1 text-red-800 bg-red-50 px-2 py-0.5 rounded text-[10px]">
                      <MapPin className="w-3 h-3 text-red-700 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold w-[70px] flex-shrink-0">An táng tại:</span>
                      <span className="truncate">{member.restingPlace}</span>
                    </div>
                  )}
                  {member.contact && !member.isDeceased && (
                    <div className="flex items-center gap-1 text-green-700">
                      <Phone className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="font-semibold w-[70px] flex-shrink-0">SĐT:</span>
                      <span className="font-mono">{member.contact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 bg-[#f4ecd8] hover:bg-[#b8956b] text-[#4a3219] hover:text-white font-bold py-1.5 px-3 rounded text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Chi tiết
                </button>
                {currentUser && currentUser.role === 'admin' && (
                  <button
                    onClick={() => onEditMember(member.id)}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 p-1.5 rounded transition cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-65 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-[#b8956b] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#3e2a16] text-[#fdfbf7] p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#d6b583]" />
                <h3 className="text-lg font-bold uppercase font-playfair">Hồ Sơ Thành Viên</h3>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
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
                    selectedMember.gender === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                  }`}>
                    {selectedMember.gender}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMember.isDeceased ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {selectedMember.isDeceased ? 'Đã khuất (Tưởng niệm)' : 'Còn sống'}
                  </span>
                </div>
              </div>

              {/* Chi tiết thông tin */}
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                  <span className="text-gray-400">Ngày sinh/mất:</span>
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

                {selectedMember.spouseName && (
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-gray-50">
                    <span className="text-gray-400">Bạn đời:</span>
                    <span className="col-span-2 text-[#4a331a] font-semibold">
                      {selectedMember.spouseName} {selectedMember.spouseType ? `(${selectedMember.spouseType})` : ''}
                    </span>
                  </div>
                )}

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
                    <span className="text-gray-400">Số liên hệ SĐT:</span>
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
                    <span className="text-gray-400">Trình độ học vấn:</span>
                    <span className="col-span-2 text-[#4a331a]">{selectedMember.education}</span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-gray-400 block mb-1">Ghi chú cuộc đời & đóng góp:</span>
                  <p className="text-[#4a331a] italic text-xs leading-relaxed bg-[#faf8f2] p-3 rounded-md border border-[#eadecb] whitespace-pre-line">
                    {selectedMember.story || 'Chưa có thông tin ghi chép tiểu sử chi tiết.'}
                  </p>
                </div>
              </div>

              {/* Modal footer controls */}
              <div className="pt-4 flex gap-2">
                {currentUser && currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      onEditMember(selectedMember.id);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold py-2 px-4 rounded-md text-sm transition cursor-pointer"
                >
                  Đóng hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
