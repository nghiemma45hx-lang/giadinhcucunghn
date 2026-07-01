import { createClient } from '@supabase/supabase-js';
import { Member, Announcement, MemoryWall } from './types';
import { INITIAL_MEMBERS, INITIAL_ANNOUNCEMENTS, INITIAL_MEMORIES } from './initialData';

// Fallback to credentials provided by user in case environment variables are missing
const env = (import.meta as any).env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://ovcgqweqcrfwtjtojids.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Y2dxd2VxY3Jmd3RqdG9qaWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTcxMDksImV4cCI6MjA5ODM5MzEwOX0.dSefHL6xeLOuxO1Kh5sWvpMjWYitE050PsLzGIcBTUM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL script to create tables in Supabase (for the user's convenience)
export const SUPABASE_SQL_SETUP = `-- 1. Tạo bảng members (Thành viên gia tộc)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  generation INTEGER NOT NULL,
  gender TEXT NOT NULL,
  "birthDate" TEXT,
  "deathDate" TEXT,
  "deathAnniversaryLunar" TEXT,
  "isDeceased" BOOLEAN NOT NULL DEFAULT false,
  "spouseName" TEXT,
  "spouseType" TEXT,
  "parentId" TEXT,
  "motherId" TEXT,
  "relationshipToHead" TEXT,
  "chiBranch" TEXT,
  "birthPlace" TEXT,
  "restingPlace" TEXT,
  "contact" TEXT,
  story TEXT,
  education TEXT,
  job TEXT,
  spouses TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động thêm cột nếu bảng members đã tồn tại trước đó
ALTER TABLE members ADD COLUMN IF NOT EXISTS "motherId" TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS spouses TEXT;

-- 2. Tạo bảng announcements (Thông báo gia tộc)
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  "imageUrl" TEXT,
  "youtubeUrl" TEXT,
  "driveUrl" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động thêm cột nếu bảng announcements đã tồn tại trước đó
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS "driveUrl" TEXT;

-- 3. Tạo bảng memories (Bức tường tưởng nhớ)
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  "targetMemberId" TEXT NOT NULL,
  "targetMemberName" TEXT NOT NULL,
  relationship TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  "candleLit" BOOLEAN NOT NULL DEFAULT false,
  "incenseBurned" BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tạo bảng settings (Cấu hình hệ thống)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động thêm cấu hình mặc định nếu chưa có
INSERT INTO settings (key, value) VALUES
  ('banner_title', 'Gia Phả Gia Đình'),
  ('banner_subtitle', 'Cụ Nghiêm Cung'),
  ('banner_image', 'https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop'),
  ('clan_overview_title', 'Tổng Quan Gia Tộc'),
  ('clan_overview_content', 'Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Gia phả gia đình Cụ **Nghiêm Cung** được lập ra nhằm ghi chép lại nguồn cội, công đức tổ tiên, ghi nhận bước phát triển qua các thế hệ dòng họ để làm gương sáng cho đời sau.\n\nKhởi nguồn từ cụ cố **Nghiêm Điều (Chu)** và cụ bà **Lê Thị Mai** ở đất Ứng Hòa, Hà Nội, trải qua nhiều thăng trầm lịch sử, con cháu Nghiêm gia luôn luôn giữ vững nền nếp gia phong, hiếu học, đoàn kết, đóng góp tích cực cho đất nước và gìn giữ văn hóa gia đình tốt đẹp.\n\nHệ thống Gia phả số hóa này là sợi dây liên kết vô hình giữa quá khứ và hiện tại, giúp từng thành viên tìm về cội nguồn linh thiêng, gắn kết tình thân chi ngành bền chặt hơn bao giờ hết.')
ON CONFLICT (key) DO NOTHING;

-- Bật phân quyền public đọc ghi (Disable RLS để truy cập nhanh từ app client)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
`;

// Helper to check if an error is due to missing tables
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const code = error.code;
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    msg.includes('could not find the table') ||
    (msg.includes('relation') && (msg.includes('does not exist') || msg.includes('not found')))
  );
}

/**
 * 1. QUẢN LÝ THÀNH VIÊN (MEMBERS)
 */
export async function dbGetMembers(): Promise<{ data: Member[]; needsSetup: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('generation', { ascending: true });

    if (error) {
      if (isTableMissingError(error)) {
        return { data: [], needsSetup: true };
      }
      throw error;
    }

    // Nếu bảng tồn tại nhưng rỗng, thực hiện seed dữ liệu ban đầu
    if (!data || data.length === 0) {
      console.log('Bảng members trống, tự động seed dữ liệu ban đầu...');
      const seedData = INITIAL_MEMBERS.map(member => {
        const dbMember = { ...member };
        if (member.spouses) {
          (dbMember as any).spouses = JSON.stringify(member.spouses);
        } else if (member.spouseName) {
          const spousesArr = [{ id: 'default-' + member.id, name: member.spouseName, type: member.spouseType || '' }];
          (dbMember as any).spouses = JSON.stringify(spousesArr);
        }
        return dbMember;
      });
      const { error: seedError } = await supabase.from('members').insert(seedData);
      if (!seedError) {
        return { data: INITIAL_MEMBERS, needsSetup: false };
      }
    }

    const normalizedData = (data || []).map((item: any) => {
      let spousesArr = [];
      if (item.spouses) {
        if (typeof item.spouses === 'string') {
          try {
            spousesArr = JSON.parse(item.spouses);
          } catch (e) {
            console.error('Lỗi parse spouses:', e);
          }
        } else if (Array.isArray(item.spouses)) {
          spousesArr = item.spouses;
        }
      } else if (item.spouseName) {
        // Cố gắng tách nếu có dấu & hoặc và
        if (item.spouseName.includes('&')) {
          spousesArr = item.spouseName.split('&').map((s: string, idx: number) => ({
            id: `default-${item.id}-${idx}`,
            name: s.trim(),
            type: idx === 0 ? 'Vợ cả' : 'Vợ hai'
          }));
        } else {
          spousesArr = [{ id: 'default-' + item.id, name: item.spouseName, type: item.spouseType || '' }];
        }
      }
      return {
        ...item,
        spouses: spousesArr
      } as Member;
    });

    return { data: normalizedData, needsSetup: false };
  } catch (err: any) {
    console.error('Lỗi khi lấy danh sách thành viên từ Supabase:', err);
    return { data: [], needsSetup: false, error: err.message };
  }
}

export async function dbAddMember(member: Member): Promise<boolean> {
  try {
    const dbMember = { ...member };
    if (member.spouses && member.spouses.length > 0) {
      dbMember.spouseName = member.spouses.map(s => s.name).join(' & ');
      dbMember.spouseType = member.spouses[0].type || '';
      (dbMember as any).spouses = JSON.stringify(member.spouses);
    } else {
      (dbMember as any).spouses = null;
    }
    const { error } = await supabase.from('members').insert(dbMember);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi thêm thành viên vào Supabase:', err);
    return false;
  }
}

export async function dbUpdateMember(member: Member): Promise<boolean> {
  try {
    const dbMember = { ...member };
    if (member.spouses && member.spouses.length > 0) {
      dbMember.spouseName = member.spouses.map(s => s.name).join(' & ');
      dbMember.spouseType = member.spouses[0].type || '';
      (dbMember as any).spouses = JSON.stringify(member.spouses);
    } else {
      (dbMember as any).spouses = null;
    }
    const { error } = await supabase
      .from('members')
      .update(dbMember)
      .eq('id', member.id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi cập nhật thành viên trong Supabase:', err);
    return false;
  }
}

export async function dbDeleteMember(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa thành viên khỏi Supabase:', err);
    return false;
  }
}

/**
 * 2. QUẢN LÝ THÔNG BÁO (ANNOUNCEMENTS)
 */
export async function dbGetAnnouncements(): Promise<{ data: Announcement[]; needsSetup: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        return { data: [], needsSetup: true };
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('Bảng announcements trống, tự động seed dữ liệu...');
      const { error: seedError } = await supabase.from('announcements').insert(INITIAL_ANNOUNCEMENTS);
      if (!seedError) {
        return { data: INITIAL_ANNOUNCEMENTS, needsSetup: false };
      }
    }

    return { data: data || [], needsSetup: false };
  } catch (err: any) {
    console.error('Lỗi khi lấy thông báo từ Supabase:', err);
    return { data: [], needsSetup: false, error: err.message };
  }
}

export async function dbAddAnnouncement(ann: Announcement): Promise<boolean> {
  try {
    const { error } = await supabase.from('announcements').insert(ann);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi thêm thông báo vào Supabase:', err);
    return false;
  }
}

export async function dbUpdateAnnouncement(ann: Announcement): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('announcements')
      .update(ann)
      .eq('id', ann.id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi cập nhật thông báo trong Supabase:', err);
    return false;
  }
}

export async function dbDeleteAnnouncement(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa thông báo khỏi Supabase:', err);
    return false;
  }
}

/**
 * 3. QUẢN LÝ LỜI TƯỞNG NHỚ (MEMORIES)
 */
export async function dbGetMemories(): Promise<{ data: MemoryWall[]; needsSetup: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        return { data: [], needsSetup: true };
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('Bảng memories trống, tự động seed dữ liệu...');
      const { error: seedError } = await supabase.from('memories').insert(INITIAL_MEMORIES);
      if (!seedError) {
        return { data: INITIAL_MEMORIES, needsSetup: false };
      }
    }

    return { data: data || [], needsSetup: false };
  } catch (err: any) {
    console.error('Lỗi khi lấy lời tưởng nhớ từ Supabase:', err);
    return { data: [], needsSetup: false, error: err.message };
  }
}

export async function dbAddMemory(mem: MemoryWall): Promise<boolean> {
  try {
    const { error } = await supabase.from('memories').insert(mem);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi thêm lời tưởng nhớ vào Supabase:', err);
    return false;
  }
}

/**
 * 4. QUẢN LÝ CẤU HÌNH HỆ THỐNG (SETTINGS)
 */
export async function dbGetSettings(): Promise<{ data: Record<string, string>; needsSetup: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) {
      if (isTableMissingError(error)) {
        return { data: {}, needsSetup: true };
      }
      throw error;
    }

    const settingsMap: Record<string, string> = {};
    if (data) {
      data.forEach((item: any) => {
        settingsMap[item.key] = item.value;
      });
    }

    return { data: settingsMap, needsSetup: false };
  } catch (err: any) {
    console.error('Lỗi khi lấy cấu hình từ Supabase:', err);
    return { data: {}, needsSetup: false, error: err.message };
  }
}

export async function dbSaveSetting(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Lỗi khi lưu cấu hình ${key} vào Supabase:`, err);
    return false;
  }
}

