import { Member } from './types';

// Xây dựng cây phân cấp từ danh sách phẳng
export interface TreeNode {
  member: Member;
  children: TreeNode[];
}

export function buildHierarchy(members: Member[], rootId: string = 'nghiem-dieu'): TreeNode | null {
  const root = members.find(m => m.id === rootId);
  if (!root) return null;

  const getChildren = (parentId: string): TreeNode[] => {
    return members
      .filter(m => m.parentId === parentId)
      .map(m => ({
        member: m,
        children: getChildren(m.id)
      }));
  };

  return {
    member: root,
    children: getChildren(root.id)
  };
}

// Format ngày tháng định dạng tiếng Việt
export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Chưa rõ';
  if (/^\d{4}$/.test(dateStr)) return dateStr; // Chỉ có năm
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Xuất file Word giả lập bằng HTML Blob (Mở được bằng MS Word trực tiếp)
export function exportToWord(members: Member[]) {
  const sortedMembers = [...members].sort((a, b) => a.generation - b.generation);
  
  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>Gia Phả Gia Đình Cụ Nghiêm Cung</title>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Times New Roman', Times, serif; line-height: 1.6; color: #333; }
        h1 { text-align: center; text-transform: uppercase; color: #8b5a2b; font-size: 24pt; margin-bottom: 5pt; }
        h2 { text-align: center; font-style: italic; color: #5c3a21; font-size: 16pt; margin-top: 0; margin-bottom: 30pt; }
        h3 { border-bottom: 2px solid #8b5a2b; padding-bottom: 5pt; color: #8b5a2b; font-size: 14pt; margin-top: 20pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 15pt; }
        th { background-color: #f4ecd8; border: 1px solid #b8956b; padding: 8px; text-align: left; font-weight: bold; }
        td { border: 1px solid #e2d2be; padding: 8px; }
        .footer { text-align: center; margin-top: 50pt; font-size: 10pt; color: #777; }
        .generation-title { font-weight: bold; color: #5c3a21; background-color: #faf6eb; padding: 5px; margin-top: 15pt; }
      </style>
    </head>
    <body>
      <h1>GIA PHẢ GIA ĐÌNH CỤ NGHIÊM CUNG</h1>
      <h2>Cội Nguồn Thiêng Liêng - Đức Lưu Quang</h2>
      
      <h3>1. THÔNG TIN KHAI SÁNG</h3>
      <p>Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Gia phả gia đình Cụ Nghiêm Cung được lập ra nhằm ghi chép lại nguồn cội, công đức tổ tiên, làm gương cho con cháu đời sau học tập và giữ gìn nền nếp gia phong.</p>
      <p><b>Cụ Tổ Ông:</b> Nghiêm Điều (Chu) - Sinh năm 1885 - Mất năm 1962. Nơi an táng: Hòa Xá, Ứng Hòa, Hà Nội.</p>
      <p><b>Cụ Tổ Bà:</b> Lê Thị Mai (Cụ Bà Lùn) - Sinh năm 1889 - Mất năm 1971. Nơi an táng: Hòa Xá, Ứng Hòa, Hà Nội.</p>

      <h3>2. DANH SÁCH THÀNH VIÊN THEO THẾ HỆ</h3>
  `;

  const generations = Array.from(new Set(sortedMembers.map(m => m.generation))).sort((a, b) => a - b);
  
  generations.forEach(gen => {
    htmlContent += `<div class="generation-title">THẾ HỆ THỨ ${gen} (ĐỜI ${gen})</div>`;
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th style="width: 25%">Họ và Tên</th>
            <th style="width: 10%">Giới tính</th>
            <th style="width: 15%">Năm sinh/mất</th>
            <th style="width: 20%">Mối quan hệ</th>
            <th style="width: 30%">Tiểu sử & Ghi chú</th>
          </tr>
        </thead>
        <tbody>
    `;

    const genMembers = sortedMembers.filter(m => m.generation === gen);
    genMembers.forEach(m => {
      const dates = m.isDeceased 
        ? `${m.birthDate || 'Chưa rõ'} - ${m.deathDate || 'đã mất'}`
        : `${m.birthDate || 'Chưa rõ'} (Còn sống)`;
      htmlContent += `
        <tr>
          <td><b>${m.fullName}</b></td>
          <td>${m.gender}</td>
          <td>${dates}</td>
          <td>${m.relationshipToHead || 'Thành viên'}</td>
          <td>${m.story || 'Chưa có ghi chú tiểu sử.'}</td>
        </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
    `;
  });

  htmlContent += `
      <div class="footer">
        <p>&copy; 2026 Bản quyền thuộc về gia đình cụ Nghiêm Cung. Địa chỉ: Xã Hòa Xá, Thành phố Hà Nội.</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Gia_Pha_Gia_Dinh_Cu_Nghiem_Cung.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
