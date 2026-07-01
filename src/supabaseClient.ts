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
  "parentId" TEXT,
  "relationshipToHead" TEXT,
  "chiBranch" TEXT,
  "birthPlace" TEXT,
  "restingPlace" TEXT,
  "contact" TEXT,
  story TEXT,
  education TEXT,
  job TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tạo bảng announcements (Thông báo gia tộc)
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Bật phân quyền public đọc ghi (Disable RLS để truy cập nhanh từ app client)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;
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
      const { error: seedError } = await supabase.from('members').insert(INITIAL_MEMBERS);
      if (!seedError) {
        return { data: INITIAL_MEMBERS, needsSetup: false };
      }
    }

    return { data: data || [], needsSetup: false };
  } catch (err: any) {
    console.error('Lỗi khi lấy danh sách thành viên từ Supabase:', err);
    return { data: [], needsSetup: false, error: err.message };
  }
}

export async function dbAddMember(member: Member): Promise<boolean> {
  try {
    const { error } = await supabase.from('members').insert(member);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi thêm thành viên vào Supabase:', err);
    return false;
  }
}

export async function dbUpdateMember(member: Member): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('members')
      .update(member)
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
