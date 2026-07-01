import { useState } from 'react';
import { Member } from '../types';
import { BarChart3, PieChart, Calendar, Heart, Award, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface StatisticsSectionProps {
  members: Member[];
}

export default function StatisticsSection({ members }: StatisticsSectionProps) {
  const [hoveredGen, setHoveredGen] = useState<number | null>(null);
  const [hoveredGender, setHoveredGender] = useState<string | null>(null);

  // 1. Thống kê theo thế hệ (Đời 15 đến 19)
  const generations = [15, 16, 17, 18, 19];
  const genCounts = generations.map(gen => {
    return {
      generation: gen,
      count: members.filter(m => m.generation === gen).length
    };
  });
  const maxGenCount = Math.max(...genCounts.map(g => g.count)) || 1;

  // 2. Thống kê theo giới tính
  const maleCount = members.filter(m => m.gender === 'Nam').length;
  const femaleCount = members.filter(m => m.gender === 'Nữ').length;
  const totalCounts = members.length || 1;
  const malePercent = Math.round((maleCount / totalCounts) * 100);
  const femalePercent = Math.round((femaleCount / totalCounts) * 100);

  // 3. Thống kê trạng thái sống/mất
  const deceasedCount = members.filter(m => m.isDeceased).length;
  const livingCount = members.filter(m => !m.isDeceased).length;
  const deceasedPercent = Math.round((deceasedCount / totalCounts) * 100);
  const livingPercent = Math.round((livingCount / totalCounts) * 100);

  // Lấy các ngày giỗ trong gia quyến (sắp xếp ngẫu nhiên hoặc theo niên hạn)
  const deceasedList = members.filter(m => m.isDeceased && m.deathAnniversaryLunar);

  return (
    <div id="statistics-view" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER OVERVIEW */}
      <div className="bg-white rounded-lg shadow-sm border border-[#eadecb] p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#6b4724] font-playfair flex items-center gap-2 uppercase tracking-wider">
          <BarChart3 className="w-6 h-6 text-[#b8956b]" /> Báo Cáo Thống Kê Số Liệu Gia Tộc
        </h2>
        <p className="text-xs text-[#8b7355] mt-1 font-sans">
          Bản phân tích thống kê số hóa trực quan về nhân số chi ngành, mật độ các đời và tình trạng phát triển dân số của gia quyến Cụ Nghiêm Cung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI - BIỂU ĐỒ THỐNG KÊ (LG:COL-SPAN-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Biểu đồ cột: Phân bổ thành viên theo thế hệ */}
          <div className="bg-white rounded-lg border border-[#eadecb] p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#6b4724] font-playfair border-b border-[#faf5eb] pb-3 mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#b8956b]" /> Mật độ phân bổ nhân khẩu theo thế hệ (Đời)
            </h3>

            {/* Trực quan hóa cột SVG */}
            <div className="h-64 flex items-end justify-between gap-4 px-4 pt-4 border-b border-[#eadecb] relative">
              
              {/* Grid lines */}
              <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-100 h-0"></div>
              <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-100 h-0"></div>
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-100 h-0"></div>
              <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-100 h-0"></div>

              {genCounts.map(item => {
                const heightPercent = (item.count / maxGenCount) * 85; // Giữ lại 15% làm margin top
                return (
                  <div 
                    key={item.generation}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                    onMouseEnter={() => setHoveredGen(item.generation)}
                    onMouseLeave={() => setHoveredGen(null)}
                  >
                    {/* Tooltip hiển thị số lượng */}
                    <div className={`absolute top-[-30px] bg-[#3e2a16] text-[#fdfbf7] text-xs py-1 px-2.5 rounded shadow-md transition-all duration-200 ${
                      hoveredGen === item.generation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'
                    }`}>
                      {item.count} thành viên
                    </div>

                    {/* Cột chính */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8 }}
                      className={`w-12 sm:w-16 rounded-t-md transition-all duration-200 ${
                        hoveredGen === item.generation 
                          ? 'bg-[#b8956b] shadow-md' 
                          : 'bg-[#faf0e6] border-2 border-[#eadecb]'
                      }`}
                    ></motion.div>
                    
                    {/* Chú thích dưới đáy */}
                    <span className="text-xs font-bold text-[#6b4724] mt-2 font-mono">
                      Đời {item.generation}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-gray-400 italic text-center font-sans">
              (Rê chuột vào từng cột để xem chi tiết sĩ số thành viên)
            </div>
          </div>

          {/* 2. Biểu đồ tròn: Giới tính & Sống/Mất */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Biểu đồ tròn: Giới tính */}
            <div className="bg-white rounded-lg border border-[#eadecb] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#6b4724] font-playfair border-b border-[#faf5eb] pb-3 mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#b8956b]" /> Tỷ lệ cơ cấu Giới tính
                </h3>
                
                {/* SVG Donut Chart */}
                <div className="flex items-center justify-center py-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f4ecd8" strokeWidth="3" />
                      
                      {/* Male Segment (Blue) */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke="#3182ce" 
                        strokeWidth="3.2" 
                        strokeDasharray={`${malePercent} ${100 - malePercent}`}
                        strokeDashoffset="0"
                      />
                      
                      {/* Female Segment (Pink/Red) */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke="#e53e3e" 
                        strokeWidth="3.2" 
                        strokeDasharray={`${femalePercent} ${100 - femalePercent}`}
                        strokeDashoffset={`-${malePercent}`}
                      />
                    </svg>
                    
                    {/* Centered overall label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-400 font-sans">Nam/Nữ</span>
                      <span className="text-xl font-bold text-[#6b4724] font-mono">{maleCount}:{femaleCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-2 border-t border-[#faf5eb] pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#3182ce]"></span>
                    <span className="text-gray-500 font-medium">Thành viên Nam:</span>
                  </div>
                  <span className="font-bold text-[#4a331a] font-mono">{maleCount} người ({malePercent}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#e53e3e]"></span>
                    <span className="text-gray-500 font-medium">Thành viên Nữ:</span>
                  </div>
                  <span className="font-bold text-[#4a331a] font-mono">{femaleCount} người ({femalePercent}%)</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ tròn: Trạng thái Sống/Mất */}
            <div className="bg-white rounded-lg border border-[#eadecb] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#6b4724] font-playfair border-b border-[#faf5eb] pb-3 mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#b8956b]" /> Cơ cấu Sức khỏe & Tưởng niệm
                </h3>
                
                {/* SVG Donut Chart */}
                <div className="flex items-center justify-center py-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f4ecd8" strokeWidth="3" />
                      
                      {/* Living Segment (Green) */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="3.2" 
                        strokeDasharray={`${livingPercent} ${100 - livingPercent}`}
                        strokeDashoffset="0"
                      />
                      
                      {/* Deceased Segment (Gold) */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke="#d69e2e" 
                        strokeWidth="3.2" 
                        strokeDasharray={`${deceasedPercent} ${100 - deceasedPercent}`}
                        strokeDashoffset={`-${livingPercent}`}
                      />
                    </svg>
                    
                    {/* Centered overall label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-400 font-sans">Tổng số</span>
                      <span className="text-xl font-bold text-[#6b4724] font-mono">{members.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-2 border-t border-[#faf5eb] pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                    <span className="text-gray-500 font-medium">Đang sống (Hưởng dương):</span>
                  </div>
                  <span className="font-bold text-[#4a331a] font-mono">{livingCount} người ({livingPercent}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#d69e2e]"></span>
                    <span className="text-gray-500 font-medium">Đã khuất (Tưởng niệm):</span>
                  </div>
                  <span className="font-bold text-[#4a331a] font-mono">{deceasedCount} cụ ({deceasedPercent}%)</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* CỘT PHẢI - LỊCH GIỖ & SỰ KIỆN CẬN KỀ (LG:COL-SPAN-4) */}
        <aside className="lg:col-span-4">
          <div className="bg-[#fdfbf7] rounded-lg border border-[#eadecb] overflow-hidden shadow-xs sticky top-24">
            <div className="bg-[#6b4724] text-[#fdfbf7] p-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#d6b583]" />
              <h3 className="font-bold font-playfair uppercase text-sm tracking-wide">Lịch Giỗ Tổ & Gia Tiên</h3>
            </div>
            
            <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto">
              <p className="text-xs text-[#8b7355] leading-relaxed border-b border-dashed border-[#eadecb] pb-3">
                Danh sách ngày kỵ nhật kỉ niệm ngày mất của các bậc tiền nhân trong Nghiêm Gia chi tộc. Con cháu thắp nén nhang tưởng nhớ đạo hiếu nghĩa tình.
              </p>

              {deceasedList.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs italic">
                  Chưa cập nhật đầy đủ dữ liệu ngày giỗ.
                </div>
              ) : (
                deceasedList.map(member => (
                  <div 
                    key={member.id}
                    className="p-3 bg-white border border-[#eadecb] rounded-lg hover:border-[#b8956b] transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-[#6b4724] uppercase font-playfair leading-tight">
                          {member.fullName}
                        </h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Thế hệ {member.generation} • {member.relationshipToHead}
                        </span>
                      </div>
                      
                      {/* Lunar Date badge */}
                      <span className="bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold py-0.5 px-2 rounded-md flex-shrink-0 font-mono">
                        {member.deathAnniversaryLunar} Âm
                      </span>
                    </div>
                    
                    {member.restingPlace && (
                      <div className="text-[10px] text-gray-400 italic mt-2 border-t border-dashed border-gray-50 pt-1.5 flex items-start gap-1">
                        <span className="font-bold font-sans">Mộ phần:</span>
                        <span className="line-clamp-1">{member.restingPlace}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
