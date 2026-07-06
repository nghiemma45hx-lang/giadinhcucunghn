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
  const code = String(error.code || '');
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' || // PostgreSQL undefined_table code
    msg.includes('could not find the table') ||
    msg.includes('does not exist') ||
    msg.includes('not found') ||
    msg.includes('no schema cache') ||
    (msg.includes('relation') && (msg.includes('does not exist') || msg.includes('not found')))
  );
}

// Biến lưu cấu trúc cột phát hiện được từ database
let useLowercaseColumnsForMembers = false;
let useLowercaseColumnsForAnnouncements = false;
let useLowercaseColumnsForMemories = false;

// Helper to check if an error is due to missing columns
function isColumnMissingError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = (error.message || '').toLowerCase();
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    (msg.includes('column') && (msg.includes('does not exist') || msg.includes('schema cache') || msg.includes('not find')))
  );
}

// Helper to check if an error is due to Row-Level Security
function isRlsError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = (error.message || '').toLowerCase();
  return code === '42501' || msg.includes('row-level security') || msg.includes('violates');
}

// Helper to get missing column name from PostgREST error
function getMissingColumnName(error: any): string | null {
  if (!error) return null;
  const msg = error.message || '';
  
  // Pattern 1: Could not find the 'spouses' column of 'members' in the schema cache
  const m1 = msg.match(/Could not find the '([^']+)' column/);
  if (m1 && m1[1]) return m1[1];
  
  // Pattern 2: column "spouses" of relation "members" does not exist
  const m2 = msg.match(/column "([^"]+)"/);
  if (m2 && m2[1]) return m2[1];

  // Pattern 3: general column name in single quotes
  const m3 = msg.match(/column '([^']+)'/);
  if (m3 && m3[1]) return m3[1];

  return null;
}

// Helper to clean payload from undefined properties
function cleanPayload<T extends Record<string, any>>(obj: T): any {
  const cleaned: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// Robust insert with retry that automatically prunes missing columns from payload
async function safeInsertWithRetry(table: string, payloads: any | any[]): Promise<{ data: any; error: any }> {
  let currentPayloads = Array.isArray(payloads) ? [...payloads] : [payloads];
  let attempts = 0;
  const maxAttempts = 5;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    const { data, error } = await supabase.from(table).insert(currentPayloads);
    if (!error) {
      return { data, error: null };
    }

    lastError = error;
    if (isColumnMissingError(error)) {
      const missingCol = getMissingColumnName(error);
      if (missingCol) {
        console.warn(`[Supabase] Bỏ qua cột '${missingCol}' không có trong cache/schema của bảng '${table}'`);
        currentPayloads = currentPayloads.map(p => {
          const copy = { ...p };
          delete copy[missingCol];
          // Also try removing its casing variations
          const lowerCol = missingCol.toLowerCase();
          for (const key of Object.keys(copy)) {
            if (key.toLowerCase() === lowerCol) {
              delete copy[key];
            }
          }
          return copy;
        });
        attempts++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return { data: null, error: lastError };
}

// Robust update with retry that automatically prunes missing columns from payload
async function safeUpdateWithRetry(table: string, payload: any, eqKey: string, eqVal: any): Promise<{ data: any; error: any }> {
  let currentPayload = { ...payload };
  let attempts = 0;
  const maxAttempts = 5;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    const { data, error } = await supabase
      .from(table)
      .update(currentPayload)
      .eq(eqKey, eqVal);
    if (!error) {
      return { data, error: null };
    }

    lastError = error;
    if (isColumnMissingError(error)) {
      const missingCol = getMissingColumnName(error);
      if (missingCol) {
        console.warn(`[Supabase] Bỏ qua cột '${missingCol}' không có trong cache/schema của bảng '${table}' khi cập nhật`);
        delete currentPayload[missingCol];
        const lowerCol = missingCol.toLowerCase();
        for (const key of Object.keys(currentPayload)) {
          if (key.toLowerCase() === lowerCol) {
            delete currentPayload[key];
          }
        }
        attempts++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return { data: null, error: lastError };
}

// Robust upsert with retry that automatically prunes missing columns from payload
async function safeUpsertWithRetry(table: string, payload: any): Promise<{ data: any; error: any }> {
  let currentPayloads = Array.isArray(payload) ? [...payload] : [payload];
  let attempts = 0;
  const maxAttempts = 5;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    const { data, error } = await supabase.from(table).upsert(currentPayloads);
    if (!error) {
      return { data, error: null };
    }

    lastError = error;
    if (isColumnMissingError(error)) {
      const missingCol = getMissingColumnName(error);
      if (missingCol) {
        console.warn(`[Supabase] Bỏ qua cột '${missingCol}' không có trong cache/schema của bảng '${table}' khi upsert`);
        currentPayloads = currentPayloads.map(p => {
          const copy = { ...p };
          delete copy[missingCol];
          const lowerCol = missingCol.toLowerCase();
          for (const key of Object.keys(copy)) {
            if (key.toLowerCase() === lowerCol) {
              delete copy[key];
            }
          }
          return copy;
        });
        attempts++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return { data: null, error: lastError };
}

function mapToCamelCase(row: any): Member {
  const m: any = {};
  
  const keysMapping: Record<string, string> = {
    id: 'id',
    fullname: 'fullName',
    fullName: 'fullName',
    generation: 'generation',
    gender: 'gender',
    birthdate: 'birthDate',
    birthDate: 'birthDate',
    deathdate: 'deathDate',
    deathDate: 'deathDate',
    deathanniversarylunar: 'deathAnniversaryLunar',
    deathAnniversaryLunar: 'deathAnniversaryLunar',
    isdeceased: 'isDeceased',
    isDeceased: 'isDeceased',
    spousename: 'spouseName',
    spouseName: 'spouseName',
    spousetype: 'spouseType',
    spouseType: 'spouseType',
    parentid: 'parentId',
    parentId: 'parentId',
    motherid: 'motherId',
    motherId: 'motherId',
    relationshiptohead: 'relationshipToHead',
    relationshipToHead: 'relationshipToHead',
    chibranch: 'chiBranch',
    chiBranch: 'chiBranch',
    birthplace: 'birthPlace',
    birthPlace: 'birthPlace',
    restingplace: 'restingPlace',
    restingPlace: 'restingPlace',
    contact: 'contact',
    story: 'story',
    education: 'education',
    job: 'job',
    spouses: 'spouses'
  };

  for (const [key, val] of Object.entries(row)) {
    const lowerKey = key.toLowerCase();
    const mappedKey = keysMapping[key] || keysMapping[lowerKey] || key;
    m[mappedKey] = val;
  }

  if (m.isDeceased !== undefined) {
    m.isDeceased = String(m.isDeceased) === 'true' || m.isDeceased === true;
  }

  return m as Member;
}

function mapToDatabaseCasing(member: Member, useLowercase: boolean): any {
  if (!useLowercase) {
    return member;
  }
  
  const dbObj: any = {};
  const mapping: Record<string, string> = {
    id: 'id',
    fullName: 'fullname',
    generation: 'generation',
    gender: 'gender',
    birthDate: 'birthdate',
    deathDate: 'deathdate',
    deathAnniversaryLunar: 'deathanniversarylunar',
    isDeceased: 'isdeceased',
    spouseName: 'spousename',
    spouseType: 'spousetype',
    parentId: 'parentid',
    motherId: 'motherid',
    relationshipToHead: 'relationshiptohead',
    chiBranch: 'chibranch',
    birthPlace: 'birthplace',
    restingPlace: 'restingplace',
    contact: 'contact',
    story: 'story',
    education: 'education',
    job: 'job',
    spouses: 'spouses'
  };

  for (const [key, val] of Object.entries(member)) {
    const dbKey = mapping[key] || key;
    dbObj[dbKey] = val;
  }
  return dbObj;
}

function mapToCamelCaseAnn(row: any): Announcement {
  const a: any = {};
  const keysMapping: Record<string, string> = {
    id: 'id',
    title: 'title',
    content: 'content',
    date: 'date',
    category: 'category',
    imageurl: 'imageUrl',
    imageUrl: 'imageUrl',
    youtubeurl: 'youtubeUrl',
    youtubeUrl: 'youtubeUrl',
    driveurl: 'driveUrl',
    driveUrl: 'driveUrl'
  };

  for (const [key, val] of Object.entries(row)) {
    const lowerKey = key.toLowerCase();
    const mappedKey = keysMapping[key] || keysMapping[lowerKey] || key;
    a[mappedKey] = val;
  }
  return a as Announcement;
}

function mapToDatabaseCasingAnn(ann: Announcement, useLowercase: boolean): any {
  if (!useLowercase) {
    return ann;
  }
  const dbObj: any = {};
  const mapping: Record<string, string> = {
    id: 'id',
    title: 'title',
    content: 'content',
    date: 'date',
    category: 'category',
    imageUrl: 'imageurl',
    youtubeUrl: 'youtubeurl',
    driveUrl: 'driveurl'
  };

  for (const [key, val] of Object.entries(ann)) {
    const dbKey = mapping[key] || key;
    dbObj[dbKey] = val;
  }
  return dbObj;
}

function mapToCamelCaseMem(row: any): MemoryWall {
  const m: any = {};
  const keysMapping: Record<string, string> = {
    id: 'id',
    author: 'author',
    targetmemberid: 'targetMemberId',
    targetMemberId: 'targetMemberId',
    targetmembername: 'targetMemberName',
    targetMemberName: 'targetMemberName',
    relationship: 'relationship',
    content: 'content',
    timestamp: 'timestamp',
    candlelit: 'candleLit',
    candleLit: 'candleLit',
    incenseburned: 'incenseBurned',
    incenseBurned: 'incenseBurned'
  };

  for (const [key, val] of Object.entries(row)) {
    const lowerKey = key.toLowerCase();
    const mappedKey = keysMapping[key] || keysMapping[lowerKey] || key;
    m[mappedKey] = val;
  }
  
  if (m.candleLit !== undefined) {
    m.candleLit = String(m.candleLit) === 'true' || m.candleLit === true;
  }
  if (m.incenseBurned !== undefined) {
    m.incenseBurned = String(m.incenseBurned) === 'true' || m.incenseBurned === true;
  }
  
  return m as MemoryWall;
}

function mapToDatabaseCasingMem(mem: MemoryWall, useLowercase: boolean): any {
  if (!useLowercase) {
    return mem;
  }
  const dbObj: any = {};
  const mapping: Record<string, string> = {
    id: 'id',
    author: 'author',
    targetMemberId: 'targetmemberid',
    targetMemberName: 'targetmembername',
    relationship: 'relationship',
    content: 'content',
    timestamp: 'timestamp',
    candleLit: 'candlelit',
    incenseBurned: 'incenseburned'
  };

  for (const [key, val] of Object.entries(mem)) {
    const dbKey = mapping[key] || key;
    dbObj[dbKey] = val;
  }
  return dbObj;
}

/**
 * 1. QUẢN LÝ THÀNH VIÊN (MEMBERS)
 */
export async function dbGetMembers(localBackup?: Member[]): Promise<{ data: Member[]; needsSetup: boolean; error?: string }> {
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

    if (data && data.length > 0) {
      const firstRow = data[0];
      if ('fullname' in firstRow || 'birthdate' in firstRow) {
        useLowercaseColumnsForMembers = true;
      }
    }

    // Nếu bảng tồn tại nhưng rỗng, thực hiện seed dữ liệu ban đầu từ localBackup hoặc INITIAL_MEMBERS
    if (!data || data.length === 0) {
      console.log('Bảng members trống, tự động seed dữ liệu...');
      const seedSource = (localBackup && localBackup.length > 0) ? localBackup : INITIAL_MEMBERS;
      const prepareSeedPayloads = (useLower: boolean) => {
        return seedSource.map(member => {
          const dbMember = { ...member };
          if (member.spouses) {
            (dbMember as any).spouses = typeof member.spouses === 'string' ? member.spouses : JSON.stringify(member.spouses);
          } else if (member.spouseName) {
            const spousesArr = [{ id: 'default-' + member.id, name: member.spouseName, type: member.spouseType || '' }];
            (dbMember as any).spouses = JSON.stringify(spousesArr);
          }
          return cleanPayload(mapToDatabaseCasing(dbMember, useLower));
        });
      };

      const payloads1 = prepareSeedPayloads(useLowercaseColumnsForMembers);
      let { error: seedError } = await safeInsertWithRetry('members', payloads1);
      if (seedError) {
        if (isColumnMissingError(seedError)) {
          console.log('Phát hiện sai lệch casing cột khi seed, đang thử lại với casing khác...');
          useLowercaseColumnsForMembers = !useLowercaseColumnsForMembers;
          const payloads2 = prepareSeedPayloads(useLowercaseColumnsForMembers);
          const { error: seedError2 } = await safeInsertWithRetry('members', payloads2);
          seedError = seedError2;
        }
      }
      if (seedError) {
        console.warn('Không thể seed bảng members lên đám mây (do dính chính sách RLS hoặc sai lệch schema). Đang sử dụng dữ liệu offline:', seedError.message || seedError);
        return { data: seedSource, needsSetup: false };
      }
      return { data: seedSource, needsSetup: false };
    }

    const normalizedData = (data || []).map((item: any) => {
      const camelItem = mapToCamelCase(item);
      let spousesArr = [];
      if (camelItem.spouses) {
        if (typeof camelItem.spouses === 'string') {
          try {
            spousesArr = JSON.parse(camelItem.spouses);
          } catch (e) {
            console.error('Lỗi parse spouses:', e);
          }
        } else if (Array.isArray(camelItem.spouses)) {
          spousesArr = camelItem.spouses;
        }
      } else if (camelItem.spouseName) {
        // Cố gắng tách nếu có dấu & hoặc và
        if (camelItem.spouseName.includes('&')) {
          spousesArr = camelItem.spouseName.split('&').map((s: string, idx: number) => ({
            id: `default-${camelItem.id}-${idx}`,
            name: s.trim(),
            type: idx === 0 ? 'Vợ cả' : 'Vợ hai'
          }));
        } else {
          spousesArr = [{ id: 'default-' + camelItem.id, name: camelItem.spouseName, type: camelItem.spouseType || '' }];
        }
      }
      return {
        ...camelItem,
        spouses: spousesArr
      } as Member;
    });

    return { data: normalizedData, needsSetup: false };
  } catch (err: any) {
    console.warn('Lỗi khi lấy danh sách thành viên từ Supabase, đang dùng dữ liệu offline:', err.message || err);
    const fallback = (localBackup && localBackup.length > 0) ? localBackup : INITIAL_MEMBERS;
    return { data: fallback, needsSetup: false, error: err.message };
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

    const payload1 = cleanPayload(mapToDatabaseCasing(dbMember, useLowercaseColumnsForMembers));
    let { error: error1 } = await safeInsertWithRetry('members', payload1);
    
    if (error1) {
      if (isColumnMissingError(error1)) {
        console.log('Phát hiện sai lệch casing cột khi thêm, đang thử lại với casing khác...');
        useLowercaseColumnsForMembers = !useLowercaseColumnsForMembers;
        const payload2 = cleanPayload(mapToDatabaseCasing(dbMember, useLowercaseColumnsForMembers));
        const { error: error2 } = await safeInsertWithRetry('members', payload2);
        if (error2) throw error2;
        return true;
      }
      throw error1;
    }
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

    const payload1 = cleanPayload(mapToDatabaseCasing(dbMember, useLowercaseColumnsForMembers));
    let { error: error1 } = await safeUpdateWithRetry('members', payload1, 'id', member.id);

    if (error1) {
      if (isColumnMissingError(error1)) {
        console.log('Phát hiện sai lệch casing cột khi cập nhật, đang thử lại với casing khác...');
        useLowercaseColumnsForMembers = !useLowercaseColumnsForMembers;
        const payload2 = cleanPayload(mapToDatabaseCasing(dbMember, useLowercaseColumnsForMembers));
        const { error: error2 } = await safeUpdateWithRetry('members', payload2, 'id', member.id);
        if (error2) throw error2;
        return true;
      }
      throw error1;
    }
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

export async function dbSyncAllMembers(members: Member[]): Promise<boolean> {
  try {
    // Xóa tất cả các bản ghi cũ
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .neq('id', 'dummy_id_never_exists');
    if (deleteError) throw deleteError;

    // Chuẩn bị danh sách đồng bộ
    const preparePayloads = (useLower: boolean) => {
      return members.map(member => {
        const dbMember = { ...member };
        if (member.spouses && member.spouses.length > 0) {
          dbMember.spouseName = member.spouses.map(s => s.name).join(' & ');
          dbMember.spouseType = member.spouses[0].type || '';
          (dbMember as any).spouses = JSON.stringify(member.spouses);
        } else {
          (dbMember as any).spouses = null;
        }
        return cleanPayload(mapToDatabaseCasing(dbMember, useLower));
      });
    };

    if (members.length > 0) {
      const payloads1 = preparePayloads(useLowercaseColumnsForMembers);
      let { error: insertError } = await safeInsertWithRetry('members', payloads1);
      if (insertError) {
        if (isColumnMissingError(insertError)) {
          console.log('Phát hiện sai lệch casing cột khi đồng bộ, đang thử lại với casing khác...');
          useLowercaseColumnsForMembers = !useLowercaseColumnsForMembers;
          const payloads2 = preparePayloads(useLowercaseColumnsForMembers);
          const { error: insertError2 } = await safeInsertWithRetry('members', payloads2);
          if (insertError2) throw insertError2;
        } else {
          throw insertError;
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Lỗi khi đồng bộ toàn bộ thành viên lên Supabase:', err);
    return false;
  }
}

/**
 * 2. QUẢN LÝ THÔNG BÁO (ANNOUNCEMENTS)
 */
export async function dbGetAnnouncements(localBackup?: Announcement[]): Promise<{ data: Announcement[]; needsSetup: boolean; error?: string }> {
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

    if (data && data.length > 0) {
      const firstRow = data[0];
      if ('imageurl' in firstRow || 'youtubeurl' in firstRow) {
        useLowercaseColumnsForAnnouncements = true;
      }
    }

    if (!data || data.length === 0) {
      console.log('Bảng announcements trống, tự động seed dữ liệu...');
      const seedSource = (localBackup && localBackup.length > 0) ? localBackup : INITIAL_ANNOUNCEMENTS;
      const prepareSeedPayloads = (useLower: boolean) => {
        return seedSource.map(ann => cleanPayload(mapToDatabaseCasingAnn(ann, useLower)));
      };

      const payloads1 = prepareSeedPayloads(useLowercaseColumnsForAnnouncements);
      let { error: seedError } = await safeInsertWithRetry('announcements', payloads1);
      if (seedError) {
        if (isColumnMissingError(seedError)) {
          console.log('Phát hiện sai lệch casing cột khi seed thông báo, đang thử lại...');
          useLowercaseColumnsForAnnouncements = !useLowercaseColumnsForAnnouncements;
          const payloads2 = prepareSeedPayloads(useLowercaseColumnsForAnnouncements);
          const { error: seedError2 } = await safeInsertWithRetry('announcements', payloads2);
          seedError = seedError2;
        }
      }
      if (seedError) {
        console.warn('Không thể seed bảng announcements lên đám mây. Đang sử dụng dữ liệu offline:', seedError.message || seedError);
        return { data: seedSource, needsSetup: false };
      }
      return { data: seedSource, needsSetup: false };
    }

    const normalizedData = data.map(item => mapToCamelCaseAnn(item));
    return { data: normalizedData, needsSetup: false };
  } catch (err: any) {
    console.warn('Lỗi khi lấy thông báo từ Supabase, đang dùng dữ liệu offline:', err.message || err);
    const fallback = (localBackup && localBackup.length > 0) ? localBackup : INITIAL_ANNOUNCEMENTS;
    return { data: fallback, needsSetup: false, error: err.message };
  }
}

export async function dbAddAnnouncement(ann: Announcement): Promise<boolean> {
  try {
    const payload1 = cleanPayload(mapToDatabaseCasingAnn(ann, useLowercaseColumnsForAnnouncements));
    let { error: error1 } = await safeInsertWithRetry('announcements', payload1);
    
    if (error1) {
      if (isColumnMissingError(error1)) {
        console.log('Phát hiện sai lệch casing cột khi thêm thông báo, đang thử lại...');
        useLowercaseColumnsForAnnouncements = !useLowercaseColumnsForAnnouncements;
        const payload2 = cleanPayload(mapToDatabaseCasingAnn(ann, useLowercaseColumnsForAnnouncements));
        const { error: error2 } = await safeInsertWithRetry('announcements', payload2);
        if (error2) throw error2;
        return true;
      }
      throw error1;
    }
    return true;
  } catch (err) {
    console.error('Lỗi khi thêm thông báo vào Supabase:', err);
    return false;
  }
}

export async function dbUpdateAnnouncement(ann: Announcement): Promise<boolean> {
  try {
    const payload1 = cleanPayload(mapToDatabaseCasingAnn(ann, useLowercaseColumnsForAnnouncements));
    let { error: error1 } = await safeUpdateWithRetry('announcements', payload1, 'id', ann.id);

    if (error1) {
      if (isColumnMissingError(error1)) {
        console.log('Phát hiện sai lệch casing cột khi cập nhật thông báo, đang thử lại...');
        useLowercaseColumnsForAnnouncements = !useLowercaseColumnsForAnnouncements;
        const payload2 = cleanPayload(mapToDatabaseCasingAnn(ann, useLowercaseColumnsForAnnouncements));
        const { error: error2 } = await safeUpdateWithRetry('announcements', payload2, 'id', ann.id);
        if (error2) throw error2;
        return true;
      }
      throw error1;
    }
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
export async function dbGetMemories(localBackup?: MemoryWall[]): Promise<{ data: MemoryWall[]; needsSetup: boolean; error?: string }> {
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

    if (data && data.length > 0) {
      const firstRow = data[0];
      if ('targetmemberid' in firstRow || 'candlelit' in firstRow) {
        useLowercaseColumnsForMemories = true;
      }
    }

    if (!data || data.length === 0) {
      console.log('Bảng memories trống, tự động seed dữ liệu...');
      const seedSource = (localBackup && localBackup.length > 0) ? localBackup : INITIAL_MEMORIES;
      const prepareSeedPayloads = (useLower: boolean) => {
        return seedSource.map(mem => cleanPayload(mapToDatabaseCasingMem(mem, useLower)));
      };

      const payloads1 = prepareSeedPayloads(useLowercaseColumnsForMemories);
      let { error: seedError } = await safeInsertWithRetry('memories', payloads1);
      if (seedError) {
        if (isColumnMissingError(seedError)) {
          console.log('Phát hiện sai lệch casing cột khi seed lời tưởng nhớ, đang thử lại...');
          useLowercaseColumnsForMemories = !useLowercaseColumnsForMemories;
          const payloads2 = prepareSeedPayloads(useLowercaseColumnsForMemories);
          const { error: seedError2 } = await safeInsertWithRetry('memories', payloads2);
          seedError = seedError2;
        }
      }
      if (seedError) {
        console.warn('Không thể seed bảng memories lên đám mây. Đang sử dụng dữ liệu offline:', seedError.message || seedError);
        return { data: seedSource, needsSetup: false };
      }
      return { data: seedSource, needsSetup: false };
    }

    const normalizedData = data.map(item => mapToCamelCaseMem(item));
    return { data: normalizedData, needsSetup: false };
  } catch (err: any) {
    console.warn('Lỗi khi lấy lời tưởng nhớ từ Supabase, đang dùng dữ liệu offline:', err.message || err);
    const fallback = (localBackup && localBackup.length > 0) ? localBackup : INITIAL_MEMORIES;
    return { data: fallback, needsSetup: false, error: err.message };
  }
}

export async function dbAddMemory(mem: MemoryWall): Promise<boolean> {
  try {
    const payload1 = cleanPayload(mapToDatabaseCasingMem(mem, useLowercaseColumnsForMemories));
    let { error: error1 } = await safeInsertWithRetry('memories', payload1);

    if (error1) {
      if (isColumnMissingError(error1)) {
        console.log('Phát hiện sai lệch casing cột khi thêm lời tưởng nhớ, đang thử lại...');
        useLowercaseColumnsForMemories = !useLowercaseColumnsForMemories;
        const payload2 = cleanPayload(mapToDatabaseCasingMem(mem, useLowercaseColumnsForMemories));
        const { error: error2 } = await safeInsertWithRetry('memories', payload2);
        if (error2) throw error2;
        return true;
      }
      throw error1;
    }
    return true;
  } catch (err) {
    console.error('Lỗi khi thêm lời tưởng nhớ vào Supabase:', err);
    return false;
  }
}

/**
 * 4. QUẢN LÝ CẤU HÌNH HỆ THỐNG (SETTINGS)
 */
export async function dbGetSettings(localBackup?: Record<string, string>): Promise<{ data: Record<string, string>; needsSetup: boolean; error?: string }> {
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

    // Nếu có localBackup, hãy kiểm tra và bổ sung các cấu hình tùy chỉnh lên đám mây
    if (localBackup && typeof localBackup === 'object' && !Array.isArray(localBackup)) {
      let hasNewOrChanged = false;
      const promises: Promise<any>[] = [];

      for (const [key, val] of Object.entries(localBackup)) {
        if (val === undefined || val === null) continue;
        const isDbDefault = !data || data.length <= 5; // Có khả năng vừa chạy SQL setup mặc định
        const isDifferent = settingsMap[key] !== val;

        if (!(key in settingsMap) || (isDifferent && isDbDefault)) {
          hasNewOrChanged = true;
          promises.push((async () => {
            try {
              const { error: upsertErr } = await safeUpsertWithRetry('settings', { key, value: val });
              if (upsertErr) {
                if (isRlsError(upsertErr)) {
                  console.warn(`Không thể đồng bộ cấu hình ${key} lên đám mây do chính sách RLS.`);
                } else {
                  console.warn(`Không thể đồng bộ cấu hình ${key} lên đám mây:`, upsertErr.message);
                }
              }
            } catch (err) {
              console.warn(`Lỗi ngoại lệ khi đồng bộ cấu hình ${key}:`, err);
            }
          })());
          settingsMap[key] = val;
        }
      }

      if (hasNewOrChanged && promises.length > 0) {
        console.log('Đang đồng bộ cấu hình tùy chỉnh từ trình duyệt lên Supabase...');
        await Promise.all(promises);
      }
    }

    return { data: settingsMap, needsSetup: false };
  } catch (err: any) {
    console.warn('Lỗi khi lấy cấu hình từ Supabase, đang dùng cấu hình offline:', err.message || err);
    return { data: localBackup || {}, needsSetup: false, error: err.message };
  }
}

export async function dbSaveSetting(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await safeUpsertWithRetry('settings', { key, value });
    if (error) {
      if (isRlsError(error)) {
        console.warn(`Không thể lưu cấu hình ${key} vào Supabase do chính sách RLS.`);
        return false;
      }
      throw error;
    }
    return true;
  } catch (err) {
    console.error(`Lỗi khi lưu cấu hình ${key} vào Supabase:`, err);
    return false;
  }
}

