import React, { useState, useRef } from 'react';
import { Member, Announcement, UserAccount, SpouseInfo } from '../types';
import { 
  Users, Megaphone, Plus, Edit2, Trash2, Save, X, 
  UserPlus, CheckCircle, AlertCircle, RefreshCw, KeyRound,
  FileText, FileSpreadsheet, Upload, Settings, Layout, Image, Video, Globe, Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import { parseAndCalculateAges, convertSolarToLunar } from '../utils/lunarConverter';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

interface AdminSectionProps {
  members: Member[];
  announcements: Announcement[];
  accounts: UserAccount[];
  settings?: Record<string, string>;
  onUpdateSetting?: (key: string, value: string) => void;
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onAddAnnouncement: (ann: Announcement) => void;
  onUpdateAnnouncement: (ann: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  editingMemberId: string | null;
  setEditingMemberId: (id: string | null) => void;
  onClearAllMembers?: () => void;
  onUndoMembers?: () => void;
  canUndoMembers?: boolean;
  onSyncMembers?: (customMembers?: Member[]) => Promise<boolean>;
  onAddAccount?: (acc: UserAccount) => void;
  onUpdateAccount?: (acc: UserAccount) => void;
  onDeleteAccount?: (id: string) => void;
  onUndoAccounts?: () => void;
  canUndoAccounts?: boolean;
}

export default function AdminSection({
  members,
  announcements,
  accounts,
  settings,
  onUpdateSetting,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  editingMemberId,
  setEditingMemberId,
  onClearAllMembers,
  onUndoMembers,
  canUndoMembers = false,
  onSyncMembers,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUndoAccounts,
  canUndoAccounts = false
}: AdminSectionProps) {
  // Tabs: members or announcements or accounts or settings
  const [activeTab, setActiveTab] = useState<'members' | 'announcements' | 'accounts' | 'settings'>('members');
  const [isSyncing, setIsSyncing] = useState(false);
  const shouldSyncRef = useRef(false);

  // Trạng thái Form Thành Viên
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [fullName, setFullName] = useState('');
  const [generation, setGeneration] = useState<number>(18);
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [isDeceased, setIsDeceased] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [deathAnniversaryLunar, setDeathAnniversaryLunar] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [spouseType, setSpouseType] = useState('');
  const [formSpouses, setFormSpouses] = useState<any[]>([]);
  const [tempSpouseName, setTempSpouseName] = useState('');
  const [tempSpouseType, setTempSpouseType] = useState('');
  const [parentId, setParentId] = useState('');
  const [motherId, setMotherId] = useState('');
  const [relationshipToHead, setRelationshipToHead] = useState('');
  const [chiBranch, setChiBranch] = useState('Chi Cả');
  const [birthPlace, setBirthPlace] = useState('');
  const [restingPlace, setRestingPlace] = useState('');
  const [contact, setContact] = useState('');
  const [story, setStory] = useState('');
  const [education, setEducation] = useState('');
  const [job, setJob] = useState('');
  const [lunarConversionNotice, setLunarConversionNotice] = useState('');

  // Trạng thái Form Thông Báo
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annId, setAnnId] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'QUAN TRỌNG' | 'CẬP NHẬT' | 'TIN BUỒN' | 'TIN VUI'>('CẬP NHẬT');
  const [annDate, setAnnDate] = useState('');
  const [annImageUrl, setAnnImageUrl] = useState('');
  const [annYoutubeUrl, setAnnYoutubeUrl] = useState('');
  const [annDriveUrl, setAnnDriveUrl] = useState('');

  // Sửa lỗi / Hiển thị thông báo thành công
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hàm tải thư viện PDF.js từ CDN động
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  const parsePdfFile = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdfjsLib = await loadPdfJs();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const parsePdfText = (text: string) => {
    const getValueForLabel = (labels: string[]) => {
      for (const label of labels) {
        const escapedLabel = label.replace(/[\/\(\)\*\-\+]/g, '\\$&');
        const regex = new RegExp(`${escapedLabel}\\s*\\(?.*?\\)?\\s*:\\s*([^\\n\\r]+)`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
          const val = match[1].replace(/\.{2,}/g, '').trim();
          if (val && !val.startsWith('..') && !val.includes('ví dụ:')) {
            return val;
          }
        }
      }
      return '';
    };

    const fullName = getValueForLabel(['Họ và tên thành viên', 'Họ và tên', 'ho va ten', 'ho ten']);
    if (!fullName) return null;

    const genRaw = getValueForLabel(['Thế hệ', 'Đời thứ']);
    const genMatch = genRaw.match(/\d+/);
    const generationVal = genMatch ? parseInt(genMatch[0], 10) : 18;

    const genderRaw = getValueForLabel(['Giới tính']).toLowerCase();
    const genderVal: 'Nam' | 'Nữ' = (genderRaw.includes('nữ') || genderRaw.includes('nu') || genderRaw.includes('[x] nữ')) ? 'Nữ' : 'Nam';

    const statusRaw = getValueForLabel(['Tình trạng']).toLowerCase();
    const isDeceasedVal = statusRaw.includes('đã mất') || statusRaw.includes('da mat') || statusRaw.includes('kính tế') || statusRaw.includes('deceased') || statusRaw.includes('[x] đã mất');

    const chiBranchVal = getValueForLabel(['Chi / Ngành trực thuộc', 'Chi / Ngành', 'Chi/Ngành']) || 'Chi Cả';
    const relationshipToHeadVal = getValueForLabel(['Mối quan hệ với Tổ', 'Mối quan hệ']) || undefined;
    const birthDateVal = getValueForLabel(['Năm sinh', 'Ngày sinh']) || undefined;
    const parentRaw = getValueForLabel(['Cấp Trên Trong Họ', 'Họ tên Cha']);
    const spouseNameVal = getValueForLabel(['Họ tên Bạn đời', 'Bạn đời', 'Vợ/Chồng']) || undefined;
    const spouseTypeVal = getValueForLabel(['Bên ngoại tộc', 'Bầu đoàn', 'Phân loại bạn đời']) || undefined;
    const contactVal = getValueForLabel(['Số điện thoại']) || undefined;
    const jobVal = getValueForLabel(['Nghề nghiệp']) || undefined;
    const educationVal = getValueForLabel(['Trình độ học vấn', 'Học vấn']) || undefined;
    const deathDateVal = getValueForLabel(['Năm mất']) || undefined;
    const deathAnniversaryLunarVal = getValueForLabel(['Ngày giỗ âm lịch', 'Ngày giỗ']) || undefined;
    const restingPlaceVal = getValueForLabel(['Nơi an táng', 'Mộ phần']) || undefined;
    const birthPlaceVal = getValueForLabel(['Nơi sinh / Quê quán', 'Quê quán']) || undefined;
    const storyVal = getValueForLabel(['Tiểu sử cuộc đời', 'Tiểu sử']) || undefined;

    return {
      fullName,
      generationVal,
      genderVal,
      isDeceasedVal,
      chiBranchVal,
      relationshipToHeadVal,
      birthDateVal,
      parentRaw,
      spouseNameVal,
      spouseTypeVal,
      contactVal,
      jobVal,
      educationVal,
      deathDateVal,
      deathAnniversaryLunarVal,
      restingPlaceVal,
      birthPlaceVal,
      storyVal
    };
  };

  const parseWordDocument = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const tds = Array.from(doc.querySelectorAll('td'));
    const getValueForLabel = (labels: string[]) => {
      for (let i = 0; i < tds.length; i++) {
        const text = tds[i].textContent || '';
        const match = labels.some(label => text.toLowerCase().includes(label.toLowerCase()));
        if (match) {
          const nextTd = tds[i + 1];
          if (nextTd) {
            const val = nextTd.textContent || '';
            const cleanVal = val.replace(/\.{2,}/g, '').trim();
            if (cleanVal && !cleanVal.includes('ví dụ:')) {
              return cleanVal;
            }
          }
        }
      }
      
      const paragraphs = Array.from(doc.querySelectorAll('p'));
      for (const p of paragraphs) {
        const text = p.textContent || '';
        for (const label of labels) {
          if (text.toLowerCase().includes(label.toLowerCase())) {
            const parts = text.split(':');
            if (parts.length > 1) {
              const cleanVal = parts.slice(1).join(':').replace(/\.{2,}/g, '').trim();
              if (cleanVal && !cleanVal.includes('ví dụ:')) {
                return cleanVal;
              }
            }
          }
        }
      }
      return '';
    };

    const fullName = getValueForLabel(['Họ và tên thành viên', 'Họ và tên', 'Họ tên']);
    if (!fullName) return null;

    const genRaw = getValueForLabel(['Thế hệ', 'Đời thứ']);
    const genMatch = genRaw.match(/\d+/);
    const generationVal = genMatch ? parseInt(genMatch[0], 10) : 18;

    const genderRaw = getValueForLabel(['Giới tính']).toLowerCase();
    const genderVal: 'Nam' | 'Nữ' = (genderRaw.includes('nữ') || genderRaw.includes('nu') || genderRaw.includes('[x] nữ')) ? 'Nữ' : 'Nam';

    const statusRaw = getValueForLabel(['Tình trạng']).toLowerCase();
    const isDeceasedVal = statusRaw.includes('đã mất') || statusRaw.includes('da mat') || statusRaw.includes('kính tế') || statusRaw.includes('deceased') || statusRaw.includes('[x] đã mất');

    const chiBranchVal = getValueForLabel(['Chi / Ngành', 'Chi/Ngành']) || 'Chi Cả';
    const relationshipToHeadVal = getValueForLabel(['Mối quan hệ với Tổ', 'Mối quan hệ']) || undefined;
    const birthDateVal = getValueForLabel(['Năm sinh', 'Ngày sinh']) || undefined;
    const parentRaw = getValueForLabel(['Cấp Trên Trong Họ', 'Họ tên Cha']);
    const spouseNameVal = getValueForLabel(['Họ tên Bạn đời', 'Bạn đời', 'Vợ/Chồng']) || undefined;
    const spouseTypeVal = getValueForLabel(['Bên ngoại tộc', 'Bầu đoàn', 'Phân loại bạn đời']) || undefined;
    const contactVal = getValueForLabel(['Số điện thoại']) || undefined;
    const jobVal = getValueForLabel(['Nghề nghiệp']) || undefined;
    const educationVal = getValueForLabel(['Trình độ học vấn', 'Học vấn']) || undefined;
    const deathDateVal = getValueForLabel(['Năm mất']) || undefined;
    const deathAnniversaryLunarVal = getValueForLabel(['Ngày giỗ âm lịch', 'Ngày giỗ']) || undefined;
    const restingPlaceVal = getValueForLabel(['Nơi an táng', 'Mộ phần']) || undefined;
    const birthPlaceVal = getValueForLabel(['Nơi sinh / Quê quán', 'Quê quán']) || undefined;
    const storyVal = getValueForLabel(['Tiểu sử']) || undefined;

    return {
      fullName,
      generationVal,
      genderVal,
      isDeceasedVal,
      chiBranchVal,
      relationshipToHeadVal,
      birthDateVal,
      parentRaw,
      spouseNameVal,
      spouseTypeVal,
      contactVal,
      jobVal,
      educationVal,
      deathDateVal,
      deathAnniversaryLunarVal,
      restingPlaceVal,
      birthPlaceVal,
      storyVal
    };
  };

  const importMembersFromRows = (rows: string[][], fileTypeName: string) => {
    try {
      if (rows.length === 0) {
        showToast(`Tệp ${fileTypeName} rỗng hoặc không đúng định dạng.`, 'error');
        return;
      }

      // Tìm dòng tiêu đề
      let headerIdx = -1;
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const hasNameHeader = row.some(cell => {
          const c = (cell || '').toLowerCase().replace(/\s+/g, '');
          return c.includes('họvàtên') || c.includes('họtên') || c === 'tên' || c.includes('fullname');
        });
        if (hasNameHeader) {
          headerIdx = r;
          break;
        }
      }

      if (headerIdx === -1) {
        showToast('Không tìm thấy dòng tiêu đề (phải có cột Họ và Tên) trong tệp.', 'error');
        return;
      }

      const headers = rows[headerIdx].map(h => (h || '').trim().toLowerCase());
      const dataRows = rows.slice(headerIdx + 1);

      const getIndex = (aliases: string[]) => {
        return headers.findIndex(h => {
          const normalized = h.replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi, '');
          return aliases.some(alias => normalized.includes(alias.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi, '')));
        });
      };

      const idxFullName = getIndex(['họvàtên', 'họtên', 'tên', 'fullname', 'name']);
      const idxGen = getIndex(['thếhệ', 'đời', 'generation']);
      const idxGender = getIndex(['giớitính', 'gender']);
      const idxStatus = getIndex(['tìnhtrạng', 'trạngthái', 'isdeceased', 'deceased', 'status']);
      const idxParent = getIndex(['họtêncha', 'cha', 'bố', 'mẹ', 'parent']);
      const idxChi = getIndex(['chingành', 'chi', 'ngành', 'branch']);
      const idxRel = getIndex(['vaivévớitổ', 'mốiquanhệ', 'relationship']);
      const idxBirth = getIndex(['nămsinh', 'ngàysinh', 'birth']);
      const idxSpouse = getIndex(['họtênbạnđời', 'bạnđời', 'phốingẫu', 'spouse']);
      const idxSpouseType = getIndex(['bênngoạitộc', 'bầuđoàn', 'phânloạibạnđời', 'spousetype']);
      const idxContact = getIndex(['sốđiệnthoại', 'liênhệ', 'sđt', 'contact', 'phone']);
      const idxJob = getIndex(['nghềnghiệp', 'job']);
      const idxEducation = getIndex(['họcvấn', 'trìnhđộ', 'education']);
      const idxDeath = getIndex(['nămmất', 'ngàymất', 'death']);
      const idxDeathLunar = getIndex(['ngàygiỗâmlịch', 'ngàygiỗ', 'anniversary']);
      const idxResting = getIndex(['nơiantáng', 'mộphần', 'burial', 'resting']);
      const idxBirthPlace = getIndex(['nơisinh', 'quêquán', 'birthplace']);
      const idxStory = getIndex(['tiểusử', 'ghichú', 'story', 'biography']);

      if (idxFullName === -1) {
        showToast('Cột Họ và Tên (*) là bắt buộc.', 'error');
        return;
      }

      // Ánh xạ tên -> ID để liên kết Cha/Mẹ
      const nameToIdMap: { [key: string]: string } = {};
      members.forEach(m => {
        nameToIdMap[m.fullName.trim().toLowerCase()] = m.id;
      });

      const importedMembers: Member[] = [];
      const rowsWithNewIds = dataRows.map((row, index) => {
        const rawName = row[idxFullName];
        if (!rawName || !rawName.trim()) return null;
        
        const cleanName = rawName.trim();
        const generatedId = `mem-imp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`;
        
        nameToIdMap[cleanName.toLowerCase()] = generatedId;
        
        return {
          row,
          generatedId,
          cleanName
        };
      }).filter(Boolean) as { row: string[]; generatedId: string; cleanName: string }[];

      if (rowsWithNewIds.length === 0) {
        showToast('Không có dữ liệu thành viên hợp lệ nào để tải lên.', 'error');
        return;
      }

      rowsWithNewIds.forEach(({ row, generatedId, cleanName }) => {
        const genRaw = idxGen !== -1 ? parseInt(row[idxGen], 10) : 18;
        const generationVal = isNaN(genRaw) ? 18 : genRaw;

        const genderRaw = idxGender !== -1 ? (row[idxGender] || '').trim().toLowerCase() : 'nam';
        const genderVal: 'Nam' | 'Nữ' = (genderRaw.includes('nữ') || genderRaw.includes('nu') || genderRaw === 'f' || genderRaw === 'female') ? 'Nữ' : 'Nam';

        const statusRaw = idxStatus !== -1 ? (row[idxStatus] || '').trim().toLowerCase() : '';
        const isDeceasedVal = statusRaw.includes('mất') || statusRaw.includes('khuất') || statusRaw.includes('tế') || statusRaw.includes('qua đời') || statusRaw.includes('deceased') || statusRaw.includes('die') || statusRaw === 'mất';

        const chiBranchVal = idxChi !== -1 ? (row[idxChi] || '').trim() : 'Chi Cả';
        const relationshipToHeadVal = (idxRel !== -1 && row[idxRel]) ? row[idxRel].trim() : undefined;
        const birthDateVal = (idxBirth !== -1 && row[idxBirth]) ? row[idxBirth].trim() : undefined;
        const spouseNameVal = (idxSpouse !== -1 && row[idxSpouse]) ? row[idxSpouse].trim() : undefined;
        const spouseTypeVal = (spouseNameVal && idxSpouseType !== -1 && row[idxSpouseType]) ? row[idxSpouseType].trim() : undefined;
        
        let spousesList: SpouseInfo[] | undefined = undefined;
        if (spouseNameVal) {
          const names = spouseNameVal.split(/[&;|]|\s+vào\s+|\s+và\s+/).map(n => n.trim()).filter(Boolean);
          const types = spouseTypeVal ? spouseTypeVal.split(/[&;|]|\s+vào\s+|\s+và\s+/).map(t => t.trim()).filter(Boolean) : [];
          
          spousesList = names.map((name, sIdx) => ({
            id: `spouse-imp-${generatedId}-${sIdx}-${Math.random().toString(36).substring(2, 5)}`,
            name,
            type: types[sIdx] || types[0] || (genderVal === 'Nam' ? 'Vợ cả' : 'Chồng')
          }));
        }

        const contactVal = (idxContact !== -1 && row[idxContact]) ? row[idxContact].trim() : undefined;
        const jobVal = (idxJob !== -1 && row[idxJob]) ? row[idxJob].trim() : undefined;
        const educationVal = (idxEducation !== -1 && row[idxEducation]) ? row[idxEducation].trim() : undefined;
        const deathDateVal = (idxDeath !== -1 && row[idxDeath]) ? row[idxDeath].trim() : undefined;
        const deathAnniversaryLunarVal = (idxDeathLunar !== -1 && row[idxDeathLunar]) ? row[idxDeathLunar].trim() : undefined;
        const restingPlaceVal = (idxResting !== -1 && row[idxResting]) ? row[idxResting].trim() : undefined;
        const birthPlaceVal = (idxBirthPlace !== -1 && row[idxBirthPlace]) ? row[idxBirthPlace].trim() : undefined;
        const storyVal = (idxStory !== -1 && row[idxStory]) ? row[idxStory].trim() : undefined;

        let parentIdVal: string | undefined = undefined;
        if (idxParent !== -1 && row[idxParent]) {
          const parentName = row[idxParent].trim().toLowerCase();
          if (parentName) {
            parentIdVal = nameToIdMap[parentName] || undefined;
          }
        }

        const newMem: Member = {
          id: generatedId,
          fullName: cleanName,
          generation: generationVal,
          gender: genderVal,
          isDeceased: isDeceasedVal,
          birthDate: birthDateVal || undefined,
          deathDate: isDeceasedVal ? (deathDateVal || undefined) : undefined,
          deathAnniversaryLunar: isDeceasedVal ? (deathAnniversaryLunarVal || undefined) : undefined,
          spouses: spousesList,
          spouseName: spouseNameVal || undefined,
          spouseType: spouseNameVal ? (spouseTypeVal || undefined) : undefined,
          parentId: parentIdVal,
          relationshipToHead: relationshipToHeadVal || undefined,
          chiBranch: chiBranchVal || 'Chi Cả',
          birthPlace: birthPlaceVal || undefined,
          restingPlace: isDeceasedVal ? (restingPlaceVal || undefined) : undefined,
          contact: !isDeceasedVal ? (contactVal || undefined) : undefined,
          story: storyVal || undefined,
          education: educationVal || undefined,
          job: jobVal || undefined
        };

        importedMembers.push(newMem);
      });

      importedMembers.forEach(mem => {
        onAddMember(mem);
      });

      showToast(`Tải lên thành công! Đã thêm ${importedMembers.length} thành viên từ ${fileTypeName}.`);
    } catch (err) {
      console.error(err);
      showToast(`Lỗi khi phân tích tệp ${fileTypeName}. Hãy kiểm tra định dạng.`, 'error');
    }
  };

  const importMembersFromCSV = (text: string) => {
    const rows = parseCSV(text);
    importMembersFromRows(rows, 'CSV');
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';
    
    let commaCount = 0;
    let semicolonCount = 0;
    for (let i = 0; i < Math.min(text.length, 1000); i++) {
      if (text[i] === ',') commaCount++;
      if (text[i] === ';') semicolonCount++;
    }
    const separator = semicolonCount > commaCount ? ';' : ',';

    let i = 0;
    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === separator && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
        i++;
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
        if (row.length > 0 || (row.length === 1 && row[0] !== '')) {
          lines.push(row);
        }
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
      } else {
        currentVal += char;
        i++;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      lines.push(row);
    }
    return lines;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          importMembersFromCSV(text);
        }
      };
      reader.readAsText(file, 'UTF-8');
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
          const rows = rawRows.map(row => row.map(cell => cell === null || cell === undefined ? '' : String(cell)));
          
          importMembersFromRows(rows, 'Excel');
        } catch (err) {
          console.error(err);
          showToast('Lỗi khi phân tích tệp Excel. Vui lòng kiểm tra định dạng.', 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;
          
          const parsed = parseWordDocument(html);
          if (parsed) {
            let parentIdVal: string | undefined = undefined;
            if (parsed.parentRaw) {
              const parentNameClean = parsed.parentRaw.replace(/Họ tên Cha\s*:\s*/i, '').replace(/Họ tên Mẹ\s*:\s*/i, '').trim().toLowerCase();
              const matchedParent = members.find(m => m.fullName.trim().toLowerCase() === parentNameClean);
              if (matchedParent) {
                parentIdVal = matchedParent.id;
              }
            }

            const newMem: Member = {
              id: `mem-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              fullName: parsed.fullName,
              generation: parsed.generationVal,
              gender: parsed.genderVal,
              isDeceased: parsed.isDeceasedVal,
              birthDate: parsed.birthDateVal || undefined,
              deathDate: parsed.isDeceasedVal ? (parsed.deathDateVal || undefined) : undefined,
              deathAnniversaryLunar: parsed.isDeceasedVal ? (parsed.deathAnniversaryLunarVal || undefined) : undefined,
              spouseName: parsed.spouseNameVal || undefined,
              spouseType: parsed.spouseNameVal ? (parsed.spouseTypeVal || undefined) : undefined,
              parentId: parentIdVal,
              relationshipToHead: parsed.relationshipToHeadVal || undefined,
              chiBranch: parsed.chiBranchVal || 'Chi Cả',
              birthPlace: parsed.birthPlaceVal || undefined,
              restingPlace: parsed.isDeceasedVal ? (parsed.restingPlaceVal || undefined) : undefined,
              contact: !parsed.isDeceasedVal ? (parsed.contactVal || undefined) : undefined,
              story: parsed.storyVal || undefined,
              education: parsed.educationVal || undefined,
              job: parsed.jobVal || undefined
            };

            onAddMember(newMem);
            showToast(`Tải lên thành công! Đã thêm thành viên: ${newMem.fullName}`);
          } else {
            showToast('Không tìm thấy họ tên thành viên hợp lệ trong tệp Word. Hãy chắc chắn đã điền mục này.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Lỗi khi phân tích tệp Word. Vui lòng kiểm tra định dạng.', 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === 'pdf') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const fullText = await parsePdfFile(arrayBuffer);
          const parsed = parsePdfText(fullText);
          
          if (parsed) {
            let parentIdVal: string | undefined = undefined;
            if (parsed.parentRaw) {
              const parentNameClean = parsed.parentRaw.replace(/Họ tên Cha\s*:\s*/i, '').replace(/Họ tên Mẹ\s*:\s*/i, '').trim().toLowerCase();
              const matchedParent = members.find(m => m.fullName.trim().toLowerCase() === parentNameClean);
              if (matchedParent) {
                parentIdVal = matchedParent.id;
              }
            }

            const newMem: Member = {
              id: `mem-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              fullName: parsed.fullName,
              generation: parsed.generationVal,
              gender: parsed.genderVal,
              isDeceased: parsed.isDeceasedVal,
              birthDate: parsed.birthDateVal || undefined,
              deathDate: parsed.isDeceasedVal ? (parsed.deathDateVal || undefined) : undefined,
              deathAnniversaryLunar: parsed.isDeceasedVal ? (parsed.deathAnniversaryLunarVal || undefined) : undefined,
              spouseName: parsed.spouseNameVal || undefined,
              spouseType: parsed.spouseNameVal ? (parsed.spouseTypeVal || undefined) : undefined,
              parentId: parentIdVal,
              relationshipToHead: parsed.relationshipToHeadVal || undefined,
              chiBranch: parsed.chiBranchVal || 'Chi Cả',
              birthPlace: parsed.birthPlaceVal || undefined,
              restingPlace: parsed.isDeceasedVal ? (parsed.restingPlaceVal || undefined) : undefined,
              contact: !parsed.isDeceasedVal ? (parsed.contactVal || undefined) : undefined,
              story: parsed.storyVal || undefined,
              education: parsed.educationVal || undefined,
              job: parsed.jobVal || undefined
            };

            onAddMember(newMem);
            showToast(`Tải lên thành công! Đã thêm thành viên: ${newMem.fullName}`);
          } else {
            showToast('Không thể phân tích họ tên thành viên trong biểu mẫu PDF. Hãy đảm bảo file đúng định dạng và có đầy đủ thông tin.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Lỗi khi phân tích tệp PDF. Vui lòng kiểm tra định dạng.', 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast('Định dạng tệp không được hỗ trợ. Hãy dùng .csv, .xlsx, .xls, .docx, .doc, .pdf', 'error');
    }

    e.target.value = '';
  };

  // Mở Form sửa Thành Viên
  const handleEditMemberClick = (member: Member) => {
    setMemberId(member.id);
    setFullName(member.fullName);
    setGeneration(member.generation);
    setGender(member.gender);
    setIsDeceased(member.isDeceased);
    setBirthDate(member.birthDate || '');
    setDeathDate(member.deathDate || '');
    setDeathAnniversaryLunar(member.deathAnniversaryLunar || '');
    setSpouseName(member.spouseName || '');
    setSpouseType(member.spouseType || '');
    
    if (member.spouses && member.spouses.length > 0) {
      setFormSpouses(member.spouses);
    } else if (member.spouseName) {
      // Cố gắng tách nếu có dấu & hoặc và
      if (member.spouseName.includes('&')) {
        const parsedSpouses = member.spouseName.split('&').map((s, idx) => ({
          id: `default-${member.id}-${idx}-${Date.now()}`,
          name: s.trim(),
          type: idx === 0 ? 'Vợ cả' : 'Vợ hai'
        }));
        setFormSpouses(parsedSpouses);
      } else {
        setFormSpouses([{ id: `default-${member.id}-${Date.now()}`, name: member.spouseName, type: member.spouseType || '' }]);
      }
    } else {
      setFormSpouses([]);
    }
    
    setParentId(member.parentId || '');
    setMotherId(member.motherId || '');
    setRelationshipToHead(member.relationshipToHead || '');
    setChiBranch(member.chiBranch || 'Chi Cả');
    setBirthPlace(member.birthPlace || '');
    setRestingPlace(member.restingPlace || '');
    setContact(member.contact || '');
    setStory(member.story || '');
    setEducation(member.education || '');
    setJob(member.job || '');
    
    // Tự động kiểm tra quy đổi ngày âm lịch khi mở sửa thành viên đã mất
    if (member.deathDate) {
      let d = 0, m = 0, y = 0;
      let matched = false;
      const val = member.deathDate;
      const ymdMatch = val.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (ymdMatch) {
        y = parseInt(ymdMatch[1], 10);
        m = parseInt(ymdMatch[2], 10);
        d = parseInt(ymdMatch[3], 10);
        matched = true;
      } else {
        const dmyMatch = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (dmyMatch) {
          d = parseInt(dmyMatch[1], 10);
          m = parseInt(dmyMatch[2], 10);
          y = parseInt(dmyMatch[3], 10);
          matched = true;
        }
      }
      if (matched && y >= 1900 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        const lunar = convertSolarToLunar(d, m, y);
        if (lunar) {
          setLunarConversionNotice(`Quy đổi thành công: ngày giỗ Âm lịch rơi vào ngày ${lunar.lunarDay} tháng ${lunar.lunarMonth} âm lịch (Năm ${lunar.canChiYear})`);
        } else {
          setLunarConversionNotice('');
        }
      } else {
        setLunarConversionNotice('');
      }
    } else {
      setLunarConversionNotice('');
    }
    
    setEditingMemberId(member.id);
    setShowMemberForm(true);
  };

  // Tự động tính ngày âm lịch từ ngày dương lịch khi nhập/chọn ngày mất
  const handleDeathDateChange = (val: string) => {
    setDeathDate(val);
    
    if (!val) {
      setLunarConversionNotice('');
      return;
    }
    
    let day = 0, month = 0, year = 0;
    let matched = false;
    
    // Thử YYYY-MM-DD
    const ymdMatch = val.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdMatch) {
      year = parseInt(ymdMatch[1], 10);
      month = parseInt(ymdMatch[2], 10);
      day = parseInt(ymdMatch[3], 10);
      matched = true;
    } else {
      // Thử DD-MM-YYYY hoặc DD/MM/YYYY
      const dmyMatch = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (dmyMatch) {
        day = parseInt(dmyMatch[1], 10);
        month = parseInt(dmyMatch[2], 10);
        year = parseInt(dmyMatch[3], 10);
        matched = true;
      }
    }
    
    if (matched && year >= 1900 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const lunar = convertSolarToLunar(day, month, year);
      if (lunar) {
        const formattedAnniversary = `${lunar.lunarDay < 10 ? '0' + lunar.lunarDay : lunar.lunarDay} tháng ${lunar.lunarMonth < 10 ? '0' + lunar.lunarMonth : lunar.lunarMonth}`;
        setDeathAnniversaryLunar(formattedAnniversary);
        setLunarConversionNotice(`Quy đổi thành công: ngày giỗ Âm lịch rơi vào ngày ${lunar.lunarDay} tháng ${lunar.lunarMonth} âm lịch (Năm ${lunar.canChiYear})`);
      } else {
        setLunarConversionNotice('');
      }
    } else {
      setLunarConversionNotice('');
    }
  };

  const handleAddSpouseToList = (name: string, type: string) => {
    if (!name.trim()) return;
    const newSpouse = {
      id: `spouse-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: name.trim(),
      type: type || 'Vợ cả'
    };
    const updated = [...formSpouses, newSpouse];
    setFormSpouses(updated);
    
    // Đồng bộ với trường cũ
    setSpouseName(updated.map(s => s.name).join(' & '));
    if (updated.length > 0) {
      setSpouseType(updated[0].type || '');
    }
  };

  const handleRemoveSpouseFromList = (id: string) => {
    const updated = formSpouses.filter(s => s.id !== id);
    setFormSpouses(updated);
    
    // Đồng bộ với trường cũ
    setSpouseName(updated.map(s => s.name).join(' & '));
    if (updated.length > 0) {
      setSpouseType(updated[0].type || '');
    } else {
      setSpouseName('');
      setSpouseType('');
    }
  };

  // Lấy danh sách Mẹ hợp lý của Cha đã chọn
  const getAvailableMothers = () => {
    if (!parentId) {
      return members.filter(m => m.gender === 'Nữ');
    }
    const father = members.find(m => m.id === parentId);
    if (!father) return members.filter(m => m.gender === 'Nữ');

    const relatedMothers = members.filter(m => {
      if (m.gender !== 'Nữ') return false;

      // Check nếu mẹ có ghi tên bạn đời là cha
      if (m.spouseName && father.fullName && (m.spouseName.toLowerCase().includes(father.fullName.toLowerCase()) || father.fullName.toLowerCase().includes(m.spouseName.toLowerCase()))) {
        return true;
      }

      // Check nếu cha có mảng spouses chứa tên mẹ
      if (father.spouses && father.spouses.some(s => s.name && (s.name.toLowerCase().includes(m.fullName.toLowerCase()) || m.fullName.toLowerCase().includes(s.name.toLowerCase())))) {
        return true;
      }

      // Hoặc cùng thế hệ để chọn linh hoạt
      if (m.generation === father.generation) {
        return true;
      }

      return false;
    });

    // Sắp xếp ưu tiên các cụ bà có quan hệ bạn đời đã đăng ký
    return relatedMothers.sort((a, b) => {
      const aIsSpouse = father.spouseName && a.fullName && father.spouseName.toLowerCase().includes(a.fullName.toLowerCase());
      const bIsSpouse = father.spouseName && b.fullName && father.spouseName.toLowerCase().includes(b.fullName.toLowerCase());
      if (aIsSpouse && !bIsSpouse) return -1;
      if (!aIsSpouse && bIsSpouse) return 1;
      return 0;
    });
  };

  // Reset form thành viên
  const resetMemberForm = () => {
    setMemberId('');
    setFullName('');
    setGeneration(18);
    setGender('Nam');
    setIsDeceased(false);
    setBirthDate('');
    setDeathDate('');
    setDeathAnniversaryLunar('');
    setSpouseName('');
    setSpouseType('');
    setFormSpouses([]);
    setTempSpouseName('');
    setTempSpouseType('');
    setParentId('');
    setMotherId('');
    setRelationshipToHead('');
    setChiBranch('Chi Cả');
    setBirthPlace('');
    setRestingPlace('');
    setContact('');
    setStory('');
    setEducation('');
    setJob('');
    setLunarConversionNotice('');
    
    setEditingMemberId(null);
    setShowMemberForm(false);
  };

  // Submit Thành Viên (Thêm hoặc Cập nhật)
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Vui lòng nhập họ tên thành viên.', 'error');
      return;
    }

    const mData: Member = {
      id: editingMemberId || `mem-${Date.now()}`,
      fullName,
      generation,
      gender,
      isDeceased,
      birthDate: birthDate || undefined,
      deathDate: isDeceased ? (deathDate || undefined) : undefined,
      deathAnniversaryLunar: isDeceased ? (deathAnniversaryLunar || undefined) : undefined,
      spouses: formSpouses,
      spouseName: formSpouses.map(s => s.name).join(' & ') || undefined,
      spouseType: formSpouses.length > 0 ? (formSpouses[0].type || undefined) : undefined,
      parentId: parentId || undefined,
      motherId: motherId || undefined,
      relationshipToHead: relationshipToHead || undefined,
      chiBranch: chiBranch || undefined,
      birthPlace: birthPlace || undefined,
      restingPlace: isDeceased ? (restingPlace || undefined) : undefined,
      contact: !isDeceased ? (contact || undefined) : undefined,
      story: story || undefined,
      education: education || undefined,
      job: job || undefined
    };

    if (editingMemberId) {
      onUpdateMember(mData);
      if (shouldSyncRef.current && onSyncMembers) {
        setIsSyncing(true);
        const updatedMembers = members.map(m => m.id === mData.id ? mData : m);
        onSyncMembers(updatedMembers).then(res => {
          setIsSyncing(false);
          if (res) {
            showToast('Đã lưu cập nhật và đồng bộ lên đám mây thành công!');
          } else {
            showToast('Đã lưu cập nhật ở trình duyệt nhưng đồng bộ mây thất bại!', 'error');
          }
        });
      } else {
        showToast('Cập nhật thông tin thành viên thành công!');
      }
    } else {
      onAddMember(mData);
      if (shouldSyncRef.current && onSyncMembers) {
        setIsSyncing(true);
        const updatedMembers = [mData, ...members];
        onSyncMembers(updatedMembers).then(res => {
          setIsSyncing(false);
          if (res) {
            showToast('Đã thêm mới và đồng bộ lên đám mây thành công!');
          } else {
            showToast('Đã thêm ở trình duyệt nhưng đồng bộ mây thất bại!', 'error');
          }
        });
      } else {
        showToast('Thêm mới thành viên thành công!');
      }
    }

    shouldSyncRef.current = false;
    resetMemberForm();
  };

  const handleDeleteMemberClick = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" ra khỏi Gia Phả? Thao tác này không thể hoàn tác.`)) {
      onDeleteMember(id);
      showToast(`Đã xóa thành viên ${name}.`);
    }
  };

  // Mở Form sửa thông báo
  const handleEditAnnClick = (ann: Announcement) => {
    setAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnCategory(ann.category);
    setAnnDate(ann.date);
    setAnnImageUrl(ann.imageUrl || '');
    setAnnYoutubeUrl(ann.youtubeUrl || '');
    setAnnDriveUrl(ann.driveUrl || '');
    setShowAnnForm(true);
  };

  const resetAnnForm = () => {
    setAnnId('');
    setAnnTitle('');
    setAnnContent('');
    setAnnCategory('CẬP NHẬT');
    setAnnDate('');
    setAnnImageUrl('');
    setAnnYoutubeUrl('');
    setAnnDriveUrl('');
    setShowAnnForm(false);
  };

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.', 'error');
      return;
    }

    const annData: Announcement = {
      id: annId || `ann-${Date.now()}`,
      title: annTitle,
      content: annContent,
      category: annCategory,
      date: annDate || new Date().toISOString().split('T')[0],
      imageUrl: annImageUrl || undefined,
      youtubeUrl: annYoutubeUrl || undefined,
      driveUrl: annDriveUrl || undefined
    };

    if (annId) {
      onUpdateAnnouncement(annData);
      showToast('Cập nhật thông báo thành công!');
    } else {
      onAddAnnouncement(annData);
      showToast('Đăng thông báo mới thành công!');
    }

    resetAnnForm();
  };

  const handleDeleteAnnClick = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thông báo "${title}"?`)) {
      onDeleteAnnouncement(id);
      showToast('Đã xóa thông báo.');
    }
  };

  // Phục vụ sửa chữa nhanh từ bên ngoài (nếu gọi editMemberId)
  if (editingMemberId && !showMemberForm) {
    const mem = members.find(m => m.id === editingMemberId);
    if (mem) {
      handleEditMemberClick(mem);
    }
  }

  // Tải biểu mẫu Word (.docx)
  const downloadWordTemplate = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <title>Bieu mau dang ky thanh vien gia pha</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; line-height: 1.6; padding: 20px; }
          h1 { text-align: center; color: #6b4724; font-size: 20pt; text-transform: uppercase; margin-bottom: 5px; }
          h2 { text-align: center; font-size: 14pt; font-style: italic; font-weight: normal; margin-top: 0; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #333333; padding: 8px; text-align: left; font-size: 11pt; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .section-title { font-weight: bold; font-size: 12pt; text-transform: uppercase; margin-top: 20px; color: #3e2a16; }
          .note { font-style: italic; font-size: 10pt; color: #555; margin-top: 15px; }
        </style>
      </head>
      <body>
        <h1>PHIẾU ĐĂNG KÝ THÀNH VIÊN GIA PHẢ</h1>
        <h2 style="text-align: center;">GIA TỘC NGHIÊM GIA - GIA PHẢ SỐ HÓA</h2>
        
        <p>Kính gửi Hội đồng gia tộc Nghiêm Gia, dưới đây là thông tin thành viên đề xuất bổ sung vào hệ thống phả hệ:</p>
        
        <table>
          <tr>
            <th colspan="2" style="background-color: #eadecb; text-align: center; font-size: 12pt; color: #4a3219;">THÔNG TIN THÀNH VIÊN CHÍNH</th>
          </tr>
          <tr>
            <td style="width: 35%; font-weight: bold;">Họ và tên thành viên (*):</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Thế hệ (Đời thứ mấy) (*):</td>
            <td>Đời thứ: ......... (ví dụ: Đời thứ 18, 19, 20...)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Giới tính (*):</td>
            <td>[  ] Nam   /   [  ] Nữ</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Tình trạng (*):</td>
            <td>[  ] Còn sống  /  [  ] Đã mất (Kính Tế)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Cấp Trên Trong Họ (Cha/Mẹ) (*):</td>
            <td>Họ tên Cha: ....................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Chi / Ngành trực thuộc:</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Mối quan hệ với Tổ:</td>
            <td>(ví dụ: Con trai cả, Cháu nội đích tôn, Con gái...) ....................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Năm sinh (Dương lịch) (*):</td>
            <td>........................ (Tính toán Ngày âm lịch: .......................................)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Họ tên Bạn đời (Vợ/Chồng):</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Bên ngoại tộc:</td>
            <td>(ví dụ: Cụ bà Chính thất, Trắc thất, Vợ cả, Vợ hai, Bên ngoại cụ, Bên ngoại ông...) ....................................</td>
          </tr>
          <tr>
            <th colspan="2" style="background-color: #eadecb; text-align: center; font-size: 11pt; color: #4a3219;">THÔNG TIN THÊM (NẾU CÒN SỐNG)</th>
          </tr>
          <tr>
            <td style="font-weight: bold;">Số điện thoại liên hệ:</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Nghề nghiệp hiện tại:</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Trình độ học vấn:</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <th colspan="2" style="background-color: #eadecb; text-align: center; font-size: 11pt; color: #4a3219;">THÔNG TIN THÊM (NẾU ĐÃ KHUẤT)</th>
          </tr>
          <tr>
            <td style="font-weight: bold;">Năm mất (Dương lịch):</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Ngày giỗ âm lịch (*):</td>
            <td>Ngày: ...... Tháng: ...... (ví dụ: ngày 12 tháng 3 âm lịch)</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Nơi an táng (Mộ phần):</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <th colspan="2" style="background-color: #eadecb; text-align: center; font-size: 11pt; color: #4a3219;">QUÊ QUÁN & TIỂU SỬ</th>
          </tr>
          <tr>
            <td style="font-weight: bold;">Nơi sinh / Quê quán:</td>
            <td>....................................................................................................</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Tiểu sử cuộc đời:</td>
            <td style="height: 120px; vertical-align: top;">....................................................................................................<br><br>....................................................................................................</td>
          </tr>
        </table>
        
        <p class="note">(*) Các trường bắt buộc phải điền đầy đủ để Hội đồng gia tộc cập nhật phả hệ điện tử chính xác nhất.</p>
        
        <div style="margin-top: 40px; float: right; width: 250px; text-align: center;">
          <p>......, Ngày ...... Tháng ...... Năm 20...</p>
          <p style="font-weight: bold; margin-top: 5px;">Thành viên kê khai</p>
          <p style="font-style: italic; margin-top: 50px;">(Ký và ghi rõ họ tên)</p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Phieu_Dang_Ky_Thanh_Vien_Nghiem_Gia.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tải biểu mẫu Excel (.xlsx chính xác, chất lượng cao không lỗi bảng)
  const downloadExcelTemplate = () => {
    const excelData = [
      ['DANH SÁCH ĐĂNG KÝ THÀNH VIÊN GIA PHẢ - NGHIÊM GIA', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Hướng dẫn: Hãy điền thông tin của các thành viên dòng họ vào bảng dưới đây theo mẫu để Hội đồng gia tộc cập nhật.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      [
        'Họ và Tên (*)',
        'Thế Hệ (*)',
        'Giới Tính (*)',
        'Tình Trạng (*)',
        'Họ tên Cha (*)',
        'Chi/Ngành',
        'Vai Vế Với Tổ',
        'Năm Sinh (Dương lịch)',
        'Họ tên Bạn đời',
        'Bên ngoại tộc',
        'Số điện thoại',
        'Nghề nghiệp',
        'Học vấn',
        'Năm Mất (Dương lịch)',
        'Ngày Giỗ Âm Lịch',
        'Nơi An Táng',
        'Nơi Sinh / Quê Quán',
        'Tiểu Sử Cuộc Đời'
      ],
      [
        'Nghiêm Xuân Sơn',
        '18',
        'Nam',
        'Còn sống',
        'Nghiêm Văn Cung',
        'Chi Cả',
        'Anh cả',
        '15-08-1985',
        'Nguyễn Thị Mai',
        'Bà cả',
        '0912345678',
        'Bác sĩ',
        'Thạc sĩ Y khoa',
        '',
        '',
        '',
        'Hòa Xá, Ứng Hòa, Hà Nội',
        'Đóng góp tích cực cho quỹ khuyến học dòng họ.'
      ],
      [
        'Nghiêm Thị Lan',
        '18',
        'Nữ',
        'Còn sống',
        'Nghiêm Văn Cung',
        'Chi Cả',
        'Con gái',
        '1988',
        'Trần Văn Hùng',
        'Chồng',
        '0987654321',
        'Giáo viên',
        'Cử nhân sư phạm',
        '',
        '',
        '',
        'Hòa Xá, Ứng Hòa, Hà Nội',
        ''
      ],
      [
        'Nghiêm Văn A',
        '17',
        'Nam',
        'Đã mất',
        'Nghiêm Cụ Tổ',
        'Chi Cả',
        'Cụ đời thứ 17',
        '1920',
        'Đặng Thị B',
        'Cụ bà Chính thất',
        '',
        '',
        '',
        '1995',
        '12 tháng 3',
        'Nghĩa trang Đồng Vông',
        'Hòa Xá, Ứng Hòa, Hà Nội',
        'Hương khói phụng thờ chu đáo.'
      ]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set auto widths or fixed generous widths
    ws['!cols'] = [
      { wch: 22 }, // Họ và Tên
      { wch: 10 }, // Thế Hệ
      { wch: 12 }, // Giới Tính
      { wch: 12 }, // Tình Trạng
      { wch: 22 }, // Họ tên Cha
      { wch: 12 }, // Chi/Ngành
      { wch: 18 }, // Vai Vế Với Tổ
      { wch: 20 }, // Năm Sinh (Dương lịch)
      { wch: 22 }, // Bạn đời
      { wch: 18 }, // Bên ngoại tộc
      { wch: 15 }, // Số điện thoại
      { wch: 15 }, // Nghề nghiệp
      { wch: 18 }, // Học vấn
      { wch: 20 }, // Năm Mất (Dương lịch)
      { wch: 18 }, // Ngày Giỗ Âm Lịch
      { wch: 25 }, // Nơi An Táng
      { wch: 30 }, // Nơi Sinh / Quê Quán
      { wch: 40 }  // Tiểu Sử Cuộc Đời
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nghiem_Gia');
    XLSX.writeFile(wb, 'Mau_Dang_Ky_Thanh_Vien_Nghiem_Gia.xlsx');
  };

  // Local state for account management form
  const [showAccForm, setShowAccForm] = useState(false);
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [accFullName, setAccFullName] = useState('');
  const [accUsername, setAccUsername] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accRole, setAccRole] = useState<'admin' | 'user'>('user');

  const resetAccForm = () => {
    setEditingAccId(null);
    setAccFullName('');
    setAccUsername('');
    setAccPassword('');
    setAccRole('user');
    setShowAccForm(false);
  };

  const handleAccSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accFullName.trim() || !accUsername.trim() || !accPassword.trim()) {
      showToast('Vui lòng điền đầy đủ tất cả các trường dữ liệu!', 'error');
      return;
    }

    if (editingAccId) {
      // Cập nhật tài khoản
      const updatedAcc: UserAccount = {
        id: editingAccId,
        fullName: accFullName.trim(),
        username: accUsername.trim(),
        password: accPassword.trim(),
        role: accRole
      };
      onUpdateAccount?.(updatedAcc);
      showToast('Cập nhật tài khoản thành công!');
    } else {
      // Check if username already exists
      const usernameExists = accounts.some(acc => acc.username.toLowerCase() === accUsername.trim().toLowerCase());
      if (usernameExists) {
        showToast('Tên đăng nhập này đã tồn tại! Vui lòng chọn tên khác.', 'error');
        return;
      }

      // Thêm mới tài khoản
      const newAcc: UserAccount = {
        id: `acc-${Date.now()}`,
        fullName: accFullName.trim(),
        username: accUsername.trim(),
        password: accPassword.trim(),
        role: accRole
      };
      onAddAccount?.(newAcc);
      showToast('Thêm mới tài khoản thành công!');
    }
    resetAccForm();
  };

  const handleEditAccClick = (acc: UserAccount) => {
    setEditingAccId(acc.id);
    setAccFullName(acc.fullName);
    setAccUsername(acc.username);
    setAccPassword(acc.password || (acc.id === 'admin' ? 'admin' : acc.id === 'user-phac' ? '123' : ''));
    setAccRole(acc.role);
    setShowAccForm(true);
  };

  const handleDeleteAccClick = (id: string, name: string) => {
    if (id === 'admin') {
      showToast('Không thể xóa tài khoản Quản trị viên tối cao (admin)!', 'error');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}"? Thao tác này có thể hoàn tác ngay sau đó.`)) {
      onDeleteAccount?.(id);
      showToast(`Đã xóa tài khoản "${name}" thành công!`);
    }
  };

  return (
    <div id="admin-view" className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-[200] p-4 rounded-lg shadow-xl flex items-center gap-2 border text-sm font-semibold animate-bounce ${
          toastType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER ROW */}
      <div className="bg-white rounded-lg shadow-sm border border-[#eadecb] p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#6b4724] font-playfair flex items-center gap-2 uppercase tracking-wider">
          <KeyRound className="w-6 h-6 text-[#b8956b]" /> Bàn Làm Việc Hội Đồng Quản Trị
        </h2>
        <p className="text-xs text-[#8b7355] mt-1 font-sans">
          Cập nhật hồ sơ phả hệ, đăng thông báo chi tộc và theo dõi danh sách thành viên truy cập hệ thống.
        </p>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-[#eadecb] mt-6 gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-4 text-xs font-bold uppercase transition flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'members' 
                ? 'border-b-2 border-[#b8956b] text-[#6b4724]' 
                : 'text-gray-400 hover:text-[#6b4724]'
            }`}
          >
            <Users className="w-4 h-4" /> Quản lý Thành Viên
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`py-2 px-4 text-xs font-bold uppercase transition flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'announcements' 
                ? 'border-b-2 border-[#b8956b] text-[#6b4724]' 
                : 'text-gray-400 hover:text-[#6b4724]'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Bản tin Thông Báo
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-2 px-4 text-xs font-bold uppercase transition flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'accounts' 
                ? 'border-b-2 border-[#b8956b] text-[#6b4724]' 
                : 'text-gray-400 hover:text-[#6b4724]'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Tài khoản Quản trị
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-4 text-xs font-bold uppercase transition flex items-center gap-1.5 focus:outline-none cursor-pointer ${
              activeTab === 'settings' 
                ? 'border-b-2 border-[#b8956b] text-[#6b4724]' 
                : 'text-gray-400 hover:text-[#6b4724]'
            }`}
          >
            <Settings className="w-4 h-4" /> Cấu hình hệ thống
          </button>
        </div>
      </div>

      {/* 1. TAB: QUẢN LÝ THÀNH VIÊN */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          
          {/* Nút Thêm mới và Thanh thống kê */}
          {!showMemberForm && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-[#eadecb] gap-3">
              <span className="text-xs font-semibold text-[#8b7355]">
                Đang có <strong className="text-[#6b4724] font-mono">{members.length}</strong> nhân khẩu trong dòng họ
              </span>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {onUndoMembers && canUndoMembers && (
                  <button
                    onClick={onUndoMembers}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 py-2 px-3.5 rounded text-xs border border-amber-300 font-bold flex items-center gap-1.5 cursor-pointer focus:outline-none transition shadow-xs"
                    title="Hoàn tác thao tác vừa thực hiện (Thêm, Sửa, Xóa)"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin-reverse" /> Hoàn Tác
                  </button>
                )}
                
                {onClearAllMembers && members.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa tất cả thành viên ra khỏi Gia Phả? Thao tác này sẽ xóa sạch danh sách thành viên hiện tại nhưng bạn có thể 'Hoàn Tác' ngay sau đó nếu cần.")) {
                        onClearAllMembers();
                        showToast("Đã xóa toàn bộ danh sách thành viên thành công!");
                      }
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3.5 rounded text-xs border border-red-200 font-bold flex items-center gap-1.5 cursor-pointer focus:outline-none transition shadow-xs"
                    title="Xóa tất cả thành viên khỏi danh sách"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Xóa Tất Cả
                  </button>
                )}

                {onSyncMembers && (
                  <button
                    onClick={async () => {
                      setIsSyncing(true);
                      const res = await onSyncMembers();
                      setIsSyncing(false);
                      if (res) {
                        showToast("Đã đồng bộ toàn bộ danh sách thành viên lên đám mây thành công!");
                      } else {
                        showToast("Đồng bộ lên đám mây thất bại. Vui lòng kiểm tra lại kết nối!", "error");
                      }
                    }}
                    disabled={isSyncing}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2 px-3.5 rounded text-xs border border-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer focus:outline-none transition shadow-xs disabled:opacity-50"
                    title="Đồng bộ thủ công toàn bộ danh sách thành viên hiện tại lên đám mây Supabase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} /> 
                    {isSyncing ? 'Đang đồng bộ...' : 'Lưu Đồng Bộ Lên Mây'}
                  </button>
                )}

                <button
                  onClick={() => { resetMemberForm(); setShowMemberForm(true); }}
                  className="bg-[#b8956b] hover:bg-[#8b7355] text-white py-2 px-4 rounded text-xs font-bold flex items-center gap-1 cursor-pointer focus:outline-none"
                >
                  <Plus className="w-4 h-4" /> Thêm Thành Viên Mới
                </button>
              </div>
            </div>
          )}

          {/* Form Thêm/Sửa Thành Viên */}
          {showMemberForm && (
            <div className="bg-[#faf8f2] rounded-lg border-2 border-[#b8956b] p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#eadecb] pb-3 mb-5 gap-3">
                <h3 className="text-lg font-bold text-[#6b4724] font-playfair flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-[#b8956b]" />
                  {editingMemberId ? 'Cập Nhật Hồ Sơ Thành Viên' : 'Thêm Thành Viên Mới Vào Gia Phả'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  {/* Hidden file input for CSV/Excel/Word/PDF import */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv, .xlsx, .xls, .docx, .doc, .pdf"
                    className="hidden"
                  />
                  {/* Upload list */}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    title="Tải lên tệp biểu mẫu từ máy tính (.csv, .xlsx, .xls, .docx, .doc, .pdf)"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition text-[10px] font-bold focus:outline-none cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> Tải Lên Biểu Mẫu (Excel, Word, PDF, CSV)
                  </button>
                  {/* Word Template download */}
                  <button
                    type="button"
                    onClick={downloadWordTemplate}
                    title="Tải biểu mẫu Word (.docx)"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-[10px] font-bold focus:outline-none cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Biểu mẫu Word (.docx)
                  </button>
                  {/* Excel Template download */}
                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    title="Tải biểu mẫu Excel (.xlsx) chuẩn chỉnh không lỗi bảng"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition text-[10px] font-bold focus:outline-none cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Biểu mẫu Excel (.xlsx)
                  </button>
                  <button 
                    type="button"
                    onClick={resetMemberForm}
                    className="text-gray-400 hover:text-[#6b4724] p-1.5 focus:outline-none cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleMemberSubmit} className="space-y-4 text-xs">
                
                {/* Dòng 1: Họ tên + Thế hệ + Giới tính */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Họ và Tên *</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập đầy đủ tên (ví dụ: Nghiêm Xuân Sơn)"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#b8956b]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Thế Hệ (Đời thứ mấy) *</label>
                    <select
                      value={generation}
                      onChange={(e) => setGeneration(Number(e.target.value))}
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#b8956b]"
                    >
                      <option value={15}>Đời Thứ 15 (Cụ Tổ Điều/Mai)</option>
                      <option value={16}>Đời Thứ 16 (Cụ Cung)</option>
                      <option value={17}>Đời Thứ 17 (Bố, Cô, Bác)</option>
                      <option value={18}>Đời Thứ 18 (Anh, Chị, Em)</option>
                      <option value={19}>Đời Thứ 19 (Con, Cháu)</option>
                      <option value={20}>Đời Thứ 20</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Giới Tính *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium">
                        <input 
                          type="radio" 
                          name="gender" 
                          checked={gender === 'Nam'}
                          onChange={() => setGender('Nam')}
                          className="text-[#b8956b] focus:ring-[#b8956b]"
                        /> Nam
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium">
                        <input 
                          type="radio" 
                          name="gender" 
                          checked={gender === 'Nữ'}
                          onChange={() => setGender('Nữ')}
                          className="text-[#b8956b] focus:ring-[#b8956b]"
                        /> Nữ
                      </label>
                    </div>
                  </div>
                </div>

                {/* Dòng 2: Trạng thái Sống/Mất + Cha mẹ (parentId) + Chi nhánh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Tình Trạng Bản Thân *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium">
                        <input 
                          type="radio" 
                          name="isDeceased" 
                          checked={!isDeceased}
                          onChange={() => setIsDeceased(false)}
                          className="text-[#b8956b]"
                        /> Còn Sống
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium">
                        <input 
                          type="radio" 
                          name="isDeceased" 
                          checked={isDeceased}
                          onChange={() => setIsDeceased(true)}
                          className="text-[#b8956b]"
                        /> Đã Khuất / Kính Tế
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Cấp Trên Trong Họ (Chọn Cha/Mẹ)</label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#b8956b]"
                    >
                      <option value="">-- Là Cấp Tổ / Không chọn --</option>
                      {members.filter(m => m.gender === 'Nam').map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} (Đời {p.generation})</option>
                      ))}
                    </select>

                    {/* Ô Chọn Mẹ dưới Cấp Trên */}
                    <div className="mt-2.5 p-2 bg-red-50/50 border border-red-200 rounded">
                      <label className="block text-red-800 font-bold mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Mẹ (Chọn Mẹ dưới cấp trên trong họ)
                      </label>
                      <select
                        value={motherId}
                        onChange={(e) => setMotherId(e.target.value)}
                        className="w-full p-2 border border-red-200 rounded bg-white text-xs text-[#6b4724] font-medium focus:outline-none focus:ring-1 focus:ring-red-400"
                      >
                        <option value="">-- Không chọn Mẹ --</option>
                        {getAvailableMothers().map(p => (
                          <option key={p.id} value={p.id}>{p.fullName} (Đời {p.generation}){p.spouseName ? ` [Bạn đời: ${p.spouseName}]` : ''}</option>
                        ))}
                      </select>
                      {parentId && members.find(m => m.id === parentId)?.spouseName && (
                        <div className="text-[9px] text-amber-800/80 mt-1.5 italic font-medium">
                          Bạn đời đăng ký của Cha: <strong className="text-red-700">{members.find(m => m.id === parentId)?.spouseName}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Chi / Ngành Trực Thuộc</label>
                    <input 
                      type="text" 
                      value={chiBranch}
                      onChange={(e) => setChiBranch(e.target.value)}
                      placeholder="ví dụ: Nhánh Cụ Bà Hai, Chi Cả..."
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dòng 3: Năm sinh + Bạn đời (spouse) + Chức danh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Năm Sinh (Dương lịch hoặc khoảng năm)</label>
                    <input 
                      type="text" 
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      placeholder="ví dụ: 1985 hoặc 15-08-1985"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                    />
                    
                    {/* RED BOX: Tra cứu Âm lịch & Tuổi */}
                    <div className="mt-2 p-3 bg-red-50 border-2 border-red-500 rounded-md text-xs space-y-1.5 shadow-xs">
                      <div className="text-red-800 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                        Đặc trưng Âm Lịch & Tuổi Gia Tộc
                      </div>
                      {birthDate ? (
                        <div className="space-y-1 font-sans">
                          <div>
                            <span className="text-gray-500 font-medium">Âm lịch quy đổi:</span>{' '}
                            <strong className="text-red-900 font-bold bg-red-100/60 px-1.5 py-0.5 rounded text-[11px] block sm:inline-block mt-0.5 sm:mt-0">
                              {parseAndCalculateAges(birthDate, isDeceased, deathDate, gender).lunarDateText || 'Đang phân tích...'}
                            </strong>
                          </div>
                          <div className="pt-0.5">
                            <span className="text-gray-500 font-medium">Chi tiết thọ mệnh:</span>{' '}
                            <strong className="text-red-900 font-bold block sm:inline-block mt-0.5 sm:mt-0">
                              {parseAndCalculateAges(birthDate, isDeceased, deathDate, gender).ageText}
                            </strong>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-700/60 italic text-[11px]">Vui lòng nhập năm sinh ở trên để tự động suy luận...</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Bạn Đời (Vợ / Chồng) - Có thể chọn nhiều</label>
                    
                    {/* Danh sách bạn đời đã được thêm */}
                    {formSpouses.length > 0 ? (
                      <div className="mb-2.5 p-2 bg-amber-50/50 border border-[#d6b583] rounded space-y-1.5 max-h-[140px] overflow-y-auto">
                        {formSpouses.map((spouse) => (
                          <div key={spouse.id} className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-gray-100 text-xs shadow-2xs">
                            <div>
                              <span className="font-bold text-gray-800">{spouse.name}</span>
                              <span className="ml-1.5 text-[10px] text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-bold uppercase">
                                {spouse.type || 'Chưa phân loại'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpouseFromList(spouse.id)}
                              className="text-red-600 hover:text-red-800 font-bold px-1 py-0.5 rounded transition cursor-pointer text-[10px]"
                              title="Xóa bạn đời này"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-2.5 text-xs text-gray-500 italic p-2.5 bg-gray-50 rounded border border-gray-200">
                        Chưa có bạn đời nào được thêm. Vui lòng nhập thông tin phía dưới để thêm.
                      </div>
                    )}

                    {/* Form nhập để thêm bạn đời mới */}
                    <div className="p-3 bg-red-50 border-2 border-red-500 rounded-md shadow-xs space-y-2">
                      <div className="text-red-800 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                        Thêm Bạn Đời Mới
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input 
                            type="text" 
                            value={tempSpouseName}
                            onChange={(e) => setTempSpouseName(e.target.value)}
                            placeholder="Tên vợ/chồng..."
                            className="w-full p-2 border border-[#d6b583] rounded bg-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={tempSpouseType}
                            onChange={(e) => setTempSpouseType(e.target.value)}
                            list="spouse-types-list"
                            placeholder="Phân loại..."
                            className="w-full p-2 border border-[#d6b583] rounded bg-white text-xs text-[#6b4724] font-bold focus:outline-none"
                          />
                        </div>
                      </div>

                      <datalist id="spouse-types-list">
                        <option value="Cụ bà Chính thất">Cụ bà Chính thất</option>
                        <option value="Cụ bà Trắc thất">Cụ bà Trắc thất</option>
                        <option value="Cụ bà Thứ thất">Cụ bà Thứ thất</option>
                        <option value="Vợ cả">Vợ cả</option>
                        <option value="Vợ hai">Vợ hai</option>
                        <option value="Chồng">Chồng</option>
                      </datalist>

                      {/* Gợi ý phân loại bấm nhanh */}
                      <div className="flex flex-wrap gap-1">
                        {['Cụ bà Chính thất', 'Cụ bà Trắc thất', 'Vợ cả', 'Vợ hai', 'Chồng'].map((suggested) => (
                          <button
                            key={suggested}
                            type="button"
                            onClick={() => setTempSpouseType(suggested)}
                            className="px-1.5 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[9px] font-bold transition cursor-pointer"
                          >
                            + {suggested}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (tempSpouseName.trim()) {
                            handleAddSpouseToList(tempSpouseName, tempSpouseType || 'Vợ cả');
                            setTempSpouseName('');
                            setTempSpouseType('');
                          } else {
                            alert('Vui lòng điền họ tên bạn đời trước.');
                          }
                        }}
                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-1.5 px-3 rounded text-xs transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        + Thêm bạn đời vào danh sách
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Mối Quan Hệ Với Tổ (Xác định vai vế)</label>
                    <input 
                      type="text" 
                      value={relationshipToHead}
                      onChange={(e) => setRelationshipToHead(e.target.value)}
                      placeholder="ví dụ: Con trai cả, Cháu nội trưởng..."
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dòng 4: Nếu đã mất (Năm mất + Ngày giỗ âm + Nơi an táng) */}
                {isDeceased && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50/50 p-4 rounded border border-amber-100"
                  >
                    <div>
                      <label className="block text-amber-900 font-bold mb-1 flex justify-between items-center">
                        <span>Ngày/Năm Mất (Dương lịch)</span>
                        <span className="text-[10px] text-amber-700 font-normal italic">Chọn lịch hoặc nhập tay</span>
                      </label>
                      <div className="flex gap-1">
                        <input 
                          type="text" 
                          value={deathDate}
                          onChange={(e) => handleDeathDateChange(e.target.value)}
                          placeholder="ví dụ: 15-08-2021 hoặc 2021"
                          className="flex-1 p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                        />
                        <input
                          type="date"
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              const formatted = `${d}-${m}-${y}`;
                              handleDeathDateChange(formatted);
                            }
                          }}
                          className="p-1.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none w-10 cursor-pointer"
                          title="Chọn từ lịch Dương lịch"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-amber-900 font-bold mb-1">Ngày Giỗ Âm Lịch (Bắt buộc) *</label>
                      <input 
                        type="text" 
                        value={deathAnniversaryLunar}
                        onChange={(e) => {
                          setDeathAnniversaryLunar(e.target.value);
                          setLunarConversionNotice('');
                        }}
                        placeholder="ví dụ: 12 tháng 3 hoặc 02 tháng 9"
                        className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                      />
                      {lunarConversionNotice && (
                        <div className="mt-1 text-[11px] text-green-700 bg-green-50 border border-green-200 rounded p-1.5 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          <span>{lunarConversionNotice}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-amber-900 font-bold mb-1">Nơi An Táng (Mộ phần)</label>
                      <input 
                        type="text" 
                        value={restingPlace}
                        onChange={(e) => setRestingPlace(e.target.value)}
                        placeholder="ví dụ: Nghĩa trang Đồng Vông, Hòa Xá"
                        className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Dòng 5: Nếu còn sống (SĐT + Quê quán + Nghề nghiệp) */}
                {!isDeceased && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Số Điện Thoại Liên Hệ</label>
                      <input 
                        type="text" 
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="ví dụ: 0912.345.678"
                        className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Nghề Nghiệp Hiện Tại</label>
                      <input 
                        type="text" 
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                        placeholder="ví dụ: Bác sĩ, Giáo viên, Doanh nhân..."
                        className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">Học vấn / Trình độ</label>
                      <input 
                        type="text" 
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="ví dụ: Thạc sĩ, Cử nhân Bách Khoa..."
                        className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Quê quán */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nơi Sinh / Quê Quán</label>
                  <input 
                    type="text" 
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="ví dụ: Hòa Xá, Ứng Hòa, Hà Nội"
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                  />
                </div>

                {/* Tiểu sử */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Tiểu Sử / Biểu Sử Cuộc Đời</label>
                  <textarea 
                    rows={4}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Nhập những ghi chú về cuộc đời, đóng góp xây dựng họ hàng của thành viên..."
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none resize-none"
                  ></textarea>
                </div>

                {/* Submit buttons */}
                <div className="flex gap-2 justify-end pt-3">
                  {onSyncMembers && (
                    <button
                      type="submit"
                      onClick={() => { shouldSyncRef.current = true; }}
                      disabled={isSyncing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded text-sm transition flex items-center gap-1.5 cursor-pointer focus:outline-none disabled:opacity-50"
                      title="Lưu thông tin thành viên này và đồng bộ tức thời lên cơ sở dữ liệu đám mây Supabase"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Đang đồng bộ...' : editingMemberId ? 'Lưu & Đồng Bộ' : 'Thêm & Đồng Bộ'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetMemberForm}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded text-sm transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold py-2 px-6 rounded text-sm transition flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> {editingMemberId ? 'Lưu cập nhật' : 'Thêm vào Gia Phả'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* BẢNG LIỆT KÊ DANH SÁCH THÀNH VIÊN */}
          <div className="bg-white rounded-lg border border-[#eadecb] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f4ecd8] text-[#6b4724] border-b-2 border-[#d6b583] font-bold">
                    <th className="p-3.5">Họ và Tên</th>
                    <th className="p-3.5">Giới Tính</th>
                    <th className="p-3.5">Thế Hệ</th>
                    <th className="p-3.5">Tình Trạng</th>
                    <th className="p-3.5">Mối Quan Hệ</th>
                    <th className="p-3.5">Chi Nhánh</th>
                    <th className="p-3.5 text-right">Chức Năng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#faf5eb]">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-[#faf8f2] transition duration-150">
                      <td className="p-3.5 font-bold text-[#6b4724] uppercase">{member.fullName}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          member.gender === 'Nam' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {member.gender}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-semibold">Đời thứ {member.generation}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          member.isDeceased ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {member.isDeceased ? 'Tưởng Niệm' : 'Còn sống'}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-500 font-medium">{member.relationshipToHead || 'Con cháu'}</td>
                      <td className="p-3.5 text-gray-500">{member.chiBranch || 'Chi Cả'}</td>
                      <td className="p-3.5 text-right flex justify-end gap-1">
                        <button
                          onClick={() => handleEditMemberClick(member)}
                          className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white p-1.5 rounded transition cursor-pointer border border-blue-200"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMemberClick(member.id, member.fullName)}
                          className="bg-red-50 hover:bg-red-600 text-red-700 hover:text-white p-1.5 rounded transition cursor-pointer border border-red-200"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 2. TAB: QUẢN LÝ THÔNG BÁO */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          
          {/* Nút đăng tin */}
          {!showAnnForm && (
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-[#eadecb]">
              <span className="text-xs font-semibold text-[#8b7355]">
                Đang có <strong className="text-[#6b4724] font-mono">{announcements.length}</strong> thông báo công bố trên bảng tin
              </span>
              <button
                onClick={() => { resetAnnForm(); setShowAnnForm(true); }}
                className="bg-[#b8956b] hover:bg-[#8b7355] text-white py-2 px-4 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Đăng Thông Báo Mới
              </button>
            </div>
          )}

          {/* Form đăng thông báo */}
          {showAnnForm && (
            <div className="bg-[#faf8f2] rounded-lg border-2 border-[#b8956b] p-6">
              <div className="flex justify-between items-center border-b border-[#eadecb] pb-3 mb-5">
                <h3 className="text-lg font-bold text-[#6b4724] font-playfair flex items-center gap-1.5">
                  <Megaphone className="w-5 h-5 text-[#b8956b]" />
                  {annId ? 'Cập Nhật Bản Tin' : 'Đăng Thông Báo Gia Tộc Mới'}
                </h3>
                <button onClick={resetAnnForm} className="text-gray-400 hover:text-[#6b4724] p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAnnSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Tiêu Đề Bản Tin *</label>
                    <input 
                      type="text" 
                      required
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="ví dụ: Họp chi ngành chuẩn bị chạt mộ Tổ tiên"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Phân Nhóm Thông Báo *</label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value as any)}
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm"
                    >
                      <option value="QUAN TRỌNG">QUAN TRỌNG</option>
                      <option value="CẬP NHẬT">CẬP NHẬT</option>
                      <option value="TIN BUỒN">TIN BUỒN</option>
                      <option value="TIN VUI">TIN VUI</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Nội dung thông báo phát hành *</label>
                  <textarea 
                    rows={5}
                    required
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Nhập nội dung đầy đủ của thông báo dòng họ..."
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-dashed border-[#eadecb] pt-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-amber-600" /> Đường dẫn Hình ảnh (Link/URL)
                    </label>
                    <input 
                      type="url" 
                      value={annImageUrl}
                      onChange={(e) => setAnnImageUrl(e.target.value)}
                      placeholder="Dán link ảnh (Unsplash, Drive public...)"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-red-600" /> Video từ YouTube (URL)
                    </label>
                    <input 
                      type="url" 
                      value={annYoutubeUrl}
                      onChange={(e) => setAnnYoutubeUrl(e.target.value)}
                      placeholder="ví dụ: https://www.youtube.com/watch?v=..."
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" /> Link File/Biểu mẫu Google Drive
                    </label>
                    <input 
                      type="url" 
                      value={annDriveUrl}
                      onChange={(e) => setAnnDriveUrl(e.target.value)}
                      placeholder="Dán link tài liệu từ Google Drive..."
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={resetAnnForm}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded text-sm cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold py-2 px-6 rounded text-sm cursor-pointer"
                  >
                    Lưu tin đăng
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BẢNG LIỆT KÊ THÔNG BÁO */}
          <div className="bg-white rounded-lg border border-[#eadecb] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f4ecd8] text-[#6b4724] border-b-2 border-[#d6b583] font-bold">
                    <th className="p-3.5" style={{ width: '15%' }}>Thể Loại</th>
                    <th className="p-3.5" style={{ width: '30%' }}>Tiêu Đề Bản Tin</th>
                    <th className="p-3.5" style={{ width: '40%' }}>Nội Dung Tóm Tắt</th>
                    <th className="p-3.5 text-right" style={{ width: '15%' }}>Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#faf5eb]">
                  {announcements.map(ann => (
                    <tr key={ann.id} className="hover:bg-[#faf8f2] transition duration-150">
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                          ann.category === 'QUAN TRỌNG' ? 'bg-red-100 text-red-700' :
                          ann.category === 'CẬP NHẬT' ? 'bg-blue-100 text-blue-700' :
                          ann.category === 'TIN BUỒN' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-700'
                        }`}>
                          {ann.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#6b4724]">{ann.title}</td>
                      <td className="p-3.5 text-gray-500 line-clamp-2 max-w-[350px]">{ann.content}</td>
                      <td className="p-3.5 text-right flex justify-end gap-1">
                        <button
                          onClick={() => handleEditAnnClick(ann)}
                          className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white p-1.5 rounded border border-blue-200 cursor-pointer"
                          title="Sửa bản tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnClick(ann.id, ann.title)}
                          className="bg-red-50 hover:bg-red-600 text-red-700 hover:text-white p-1.5 rounded border border-red-200 cursor-pointer"
                          title="Xóa bản tin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3. TAB: TÀI KHOẢN HỆ THỐNG */}
      {activeTab === 'accounts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Nút tác vụ và Thống kê */}
          {!showAccForm && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-[#eadecb] gap-3">
              <span className="text-xs font-semibold text-[#8b7355]">
                Đang có <strong className="text-[#6b4724] font-mono">{accounts.length}</strong> tài khoản được phân quyền truy cập hệ thống
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onUndoAccounts && canUndoAccounts && (
                  <button
                    onClick={() => {
                      onUndoAccounts();
                      showToast("Hoàn tác thao tác quản lý tài khoản thành công!");
                    }}
                    className="bg-[#faf8f2] hover:bg-[#eadecb] text-[#6b4724] py-2 px-3.5 rounded text-xs border border-[#d6b583] font-bold flex items-center gap-1.5 cursor-pointer focus:outline-none transition shadow-xs"
                    title="Hoàn tác thao tác vừa thực hiện trên tài khoản"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#b8956b] animate-spin-reverse" /> Hoàn Tác
                  </button>
                )}
                <button
                  onClick={() => { resetAccForm(); setShowAccForm(true); }}
                  className="bg-[#b8956b] hover:bg-[#8b7355] text-white py-2 px-4 rounded text-xs font-bold flex items-center gap-1 cursor-pointer focus:outline-none"
                >
                  <Plus className="w-4 h-4" /> Thêm Tài Khoản Mới
                </button>
              </div>
            </div>
          )}

          {/* Form Thêm/Sửa Tài Khoản */}
          {showAccForm && (
            <div className="bg-[#faf8f2] rounded-lg border-2 border-[#b8956b] p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-[#eadecb] pb-3 mb-5">
                <h3 className="text-lg font-bold text-[#6b4724] font-playfair flex items-center gap-1.5">
                  <KeyRound className="w-5 h-5 text-[#b8956b]" />
                  {editingAccId ? 'Cập Nhật Tài Khoản Được Phân Quyền' : 'Thêm Tài Khoản Truy Cập Mới'}
                </h3>
                <button 
                  type="button"
                  onClick={resetAccForm}
                  className="text-gray-400 hover:text-[#6b4724] p-1.5 focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAccSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Họ và Tên Người Dùng *</label>
                    <input 
                      type="text" 
                      required
                      value={accFullName}
                      onChange={(e) => setAccFullName(e.target.value)}
                      placeholder="Nhập tên thật (ví dụ: Bác Nghiêm Sơn)"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#b8956b]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Vai Trò / Phân Quyền *</label>
                    <select
                      value={accRole}
                      onChange={(e) => setAccRole(e.target.value as 'admin' | 'user')}
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                    >
                      <option value="user">Thành Viên Đọc (User) - Chỉ xem Gia phả</option>
                      <option value="admin">Hội Đồng Gia Tộc (Admin) - Toàn quyền quản trị</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Tên Đăng Nhập (Username) *</label>
                    <input 
                      type="text" 
                      required
                      disabled={editingAccId === 'admin'}
                      value={accUsername}
                      onChange={(e) => setAccUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="Nhập tên đăng nhập viết liền không dấu (ví dụ: nghiemson)"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Mật Khẩu Truy Cập *</label>
                    <input 
                      type="text" 
                      required
                      value={accPassword}
                      onChange={(e) => setAccPassword(e.target.value)}
                      placeholder="Nhập mật khẩu truy cập"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={resetAccForm}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-5 rounded text-sm transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold py-2 px-6 rounded text-sm transition flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> {editingAccId ? 'Lưu cập nhật' : 'Tạo tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BẢNG LIỆT KÊ DANH SÁCH TÀI KHOẢN */}
          <div className="bg-white rounded-lg border border-[#eadecb] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f4ecd8] text-[#6b4724] border-b-2 border-[#d6b583] font-bold">
                    <th className="p-3.5">Họ và Tên Tài Khoản</th>
                    <th className="p-3.5">Tên Đăng Nhập</th>
                    <th className="p-3.5">Vai Trò / Phân Quyền</th>
                    <th className="p-3.5">Mật Khẩu</th>
                    <th className="p-3.5">Tình trạng phiên</th>
                    <th className="p-3.5 text-right">Chức Năng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#faf5eb]">
                  {accounts.map(acc => {
                    const displayPassword = acc.password || (acc.id === 'admin' ? 'admin' : acc.id === 'user-phac' ? '123' : '(chưa đặt)');
                    return (
                      <tr key={acc.id} className="hover:bg-[#faf8f2] transition duration-150">
                        <td className="p-3.5 font-bold text-[#6b4724]">{acc.fullName}</td>
                        <td className="p-3.5 font-mono text-sm font-semibold text-gray-500">{acc.username}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                            acc.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {acc.role === 'admin' ? 'Hội Đồng Gia Tộc (Admin)' : 'Thành Viên Đọc (User)'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-xs text-amber-800 font-semibold">{displayPassword}</td>
                        <td className="p-3.5">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-700">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Đang hoạt động
                          </span>
                        </td>
                        <td className="p-3.5 text-right flex justify-end gap-1">
                          <button
                            onClick={() => handleEditAccClick(acc)}
                            className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white p-1.5 rounded transition cursor-pointer border border-blue-200"
                            title="Sửa thông tin tài khoản"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccClick(acc.id, acc.fullName)}
                            disabled={acc.id === 'admin'}
                            className={`p-1.5 rounded transition border focus:outline-none ${
                              acc.id === 'admin'
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border-red-200 cursor-pointer'
                            }`}
                            title={acc.id === 'admin' ? 'Không thể xóa tài khoản hệ thống mặc định' : 'Xóa tài khoản này'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: CẤU HÌNH HỆ THỐNG */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
          {/* Form cấu hình */}
          <div className="bg-white rounded-lg border border-[#eadecb] p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#6b4724] font-playfair border-b border-dashed border-[#eadecb] pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Settings className="w-5 h-5 text-[#b8956b]" /> Cấu hình Nội dung Trang chủ
              </h3>
              <p className="text-xs text-[#8b7355] mt-1 font-sans">
                Thay đổi Banner chính, Tổng quan dòng họ, hình ảnh, khẩu hiệu một cách trực quan, đồng bộ lên cơ sở dữ liệu đám mây.
              </p>
            </div>

            <div className="space-y-5 text-xs">
              {/* PHẦN 1: BANNER HERO */}
              <div className="bg-[#faf8f2] p-4 rounded-lg border border-[#eadecb] space-y-4">
                <h4 className="font-bold text-[#6b4724] uppercase tracking-wide flex items-center gap-1.5 text-[11px]">
                  <Layout className="w-4 h-4 text-[#b8956b]" /> 1. Khung Banner Đầu Trang (Hero)
                </h4>
                
                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Tiêu Đề Lớn Banner (Banner Title)</label>
                    <input 
                      type="text" 
                      value={settings?.banner_title || "GIA PHẢ CHI NGHIÊM GIA"}
                      onChange={(e) => onUpdateSetting?.('banner_title', e.target.value)}
                      placeholder="ví dụ: GIA PHẢ CHI NGHIÊM GIA"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Tiêu Đề Phụ / Câu Châm Ngôn (Banner Subtitle)</label>
                    <input 
                      type="text" 
                      value={settings?.banner_subtitle || "Uống Nước Nhớ Nguồn - Kính Tổ Trọng Tông"}
                      onChange={(e) => onUpdateSetting?.('banner_subtitle', e.target.value)}
                      placeholder="ví dụ: Uống Nước Nhớ Nguồn..."
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Hình nền Banner (Nhập URL hình ảnh công khai)</label>
                    <input 
                      type="text" 
                      value={settings?.banner_image || "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&q=80&w=2000"}
                      onChange={(e) => onUpdateSetting?.('banner_image', e.target.value)}
                      placeholder="Nhập đường dẫn URL ảnh (Unsplash, Imgur, Drive public...)"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:ring-1 focus:ring-[#b8956b] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 2: TỔNG QUAN GIA TỘC */}
              <div className="bg-[#faf8f2] p-4 rounded-lg border border-[#eadecb] space-y-4">
                <h4 className="font-bold text-[#6b4724] uppercase tracking-wide flex items-center gap-1.5 text-[11px]">
                  <Globe className="w-4 h-4 text-[#b8956b]" /> 2. Phần Tổng Quan Gia Tộc (Home Section)
                </h4>

                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Tiêu Đề Tổng Quan</label>
                    <input 
                      type="text" 
                      value={settings?.clan_title || "TỔNG QUAN DÒNG HỌ NGHIÊM GIA CHI TRƯỞNG"}
                      onChange={(e) => onUpdateSetting?.('clan_title', e.target.value)}
                      placeholder="ví dụ: TỔNG QUAN DÒNG HỌ NGHIÊM GIA CHI TRƯỞNG"
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 flex justify-between items-center">
                      <span>Nội Dung Giới Thiệu (Hỗ trợ định dạng in đậm: **chữ in đậm**)</span>
                      <span className="text-[10px] text-gray-400 font-normal">Xuống dòng để tạo đoạn mới</span>
                    </label>
                    <textarea 
                      rows={10}
                      value={settings?.clan_content || ""}
                      onChange={(e) => onUpdateSetting?.('clan_content', e.target.value)}
                      placeholder="Nhập lịch sử sơ lược dòng họ, nguồn gốc tổ tiên, di huấn của các cụ..."
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white text-sm focus:ring-1 focus:ring-[#b8956b] focus:outline-none font-sans leading-relaxed resize-y"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2 font-sans">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-normal">
                  <strong>Hệ thống lưu tự động:</strong> Mỗi thay đổi trên các trường nhập liệu phía trên được đồng bộ trực tiếp lên cơ sở dữ liệu đám mây trực tuyến Supabase. Sự thay đổi sẽ xuất hiện ngay lập tức trên trang chủ của người truy cập.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Đã đồng bộ toàn bộ cấu hình hệ thống thành công!");
                  }}
                  className="bg-[#6b4724] hover:bg-[#3e2a16] text-white font-bold py-2.5 px-6 rounded text-xs transition uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
                >
                  <CheckCircle className="w-4 h-4 text-[#d6b583]" /> Hoàn Tất Cấu Hình
                </button>
              </div>

            </div>
          </div>

          {/* Khung Xem Trước Trực Quan (Live Preview Canvas) */}
          <div className="bg-[#faf8f2] rounded-lg border border-[#eadecb] p-6 shadow-xs flex flex-col space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#6b4724] font-playfair border-b border-dashed border-[#eadecb] pb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <Eye className="w-4 h-4 text-[#b8956b]" /> Bản Xem Trước Trực Quan (Live Preview)
              </h3>
              <p className="text-[11px] text-[#8b7355] mt-1 font-sans">
                Đây là giao diện thực tế mà người dùng sẽ thấy ngay lập tức sau khi bạn cập nhật nội dung.
              </p>
            </div>

            {/* Simulated Hero preview */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-gray-400 font-bold">PREVIEW BANNER HERO:</span>
              <div 
                className="relative h-44 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-4 bg-cover bg-center shadow-md border border-[#eadecb]"
                style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${settings?.banner_image || 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&q=80&w=2000'})` }}
              >
                <h1 className="text-base md:text-xl font-bold font-playfair text-[#fdfbf7] uppercase tracking-widest drop-shadow-md">
                  {settings?.banner_title || "GIA PHẢ CHI NGHIÊM GIA"}
                </h1>
                <div className="w-16 h-[1.5px] bg-[#b8956b] my-2"></div>
                <p className="text-xs italic text-[#eadecb] max-w-sm font-sans drop-shadow-xs leading-normal">
                  {settings?.banner_subtitle || "Uống Nước Nhớ Nguồn - Kính Tổ Trọng Tông"}
                </p>
              </div>
            </div>

            {/* Simulated Clan Overview preview */}
            <div className="space-y-2 flex-1 flex flex-col">
              <span className="font-mono text-[10px] text-gray-400 font-bold">PREVIEW TỔNG QUAN DÒNG HỌ:</span>
              <div className="bg-white border border-[#eadecb] rounded-lg p-5 flex-1 shadow-inner overflow-y-auto space-y-4 max-h-[350px]">
                <h2 className="text-sm md:text-base font-bold text-[#6b4724] font-playfair border-b-2 border-[#b8956b]/30 pb-1.5 uppercase tracking-wide text-center leading-normal">
                  {settings?.clan_title || "TỔNG QUAN DÒNG HỌ NGHIÊM GIA CHI TRƯỞNG"}
                </h2>
                
                <div className="text-xs text-[#5c4021] leading-relaxed text-justify space-y-3 whitespace-pre-line font-sans">
                  {(settings?.clan_content || "").split('\n\n').map((para, idx) => {
                    // Simple inline bold parser **text** -> <strong>text</strong>
                    const parts = para.split('**');
                    return (
                      <p key={idx} className="indent-4">
                        {parts.map((part, i) => (i % 2 === 1) ? <strong key={i} className="text-[#3e2a16] font-bold">{part}</strong> : part)}
                      </p>
                    );
                  })}
                  {!(settings?.clan_content) && (
                    <p className="text-gray-400 italic text-center py-8">Chưa có nội dung giới thiệu dòng họ...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
