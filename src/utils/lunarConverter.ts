// Standalone, highly efficient Vietnamese Lunar Calendar converter
// Uses standard hex-encoded lunar year mappings (years 1900-2030)

const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x01655, 0x056a0, 0x09ad0, 0x055d2, // 1900 - 1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x0d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x01497, // 1910 - 1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x01ab4, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920 - 1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x086e3, 0x092e0, 0x0c8d7, 0x0c950, // 1930 - 1939
  0x0d4a0, 0x0d8a6, 0x0b550, 0x056a0, 0x0a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940 - 1949
  0x06ca0, 0x0b550, 0x05355, 0x04da0, 0x0a5d0, 0x04573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950 - 1959
  0x0aec6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960 - 1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x0195a, // 1970 - 1979
  0x095b0, 0x049b0, 0x0a4b6, 0x0a4b0, 0x0b270, 0x06a55, 0x06d40, 0x0ab60, 0x02572, 0x09570, // 1980 - 1989
  0x052f7, 0x04970, 0x06560, 0x0d6a3, 0x0ea50, 0x06b20, 0x05ad4, 0x02b60, 0x086e3, 0x092e0, // 1990 - 1999
  0x0c967, 0x0c950, 0x0d4a0, 0x0da53, 0x0d550, 0x05aa0, 0x0a5b5, 0x049b0, 0x0a4d0, 0x0a4b4, // 2000 - 2009
  0x0ab50, 0x06b50, 0x05a73, 0x05270, 0x05267, 0x0d930, 0x074d0, 0x0d4a4, 0x0cd50, 0x05aa0, // 2010 - 2019
  0x0a5b4, 0x04ae0, 0x0a560, 0x0a575, 0x05260, 0x0e930, 0x06da3, 0x095d0, 0x04ad7, 0x04ad0, // 2020 - 2029
  0x0a4d0                                                                                   // 2030
];

const BASE_YEAR = 1900;
// Jan 31, 1900 is Lunar New Year (01-01-1900)
const BASE_DATE = new Date(1900, 0, 31);

// Helper to get Can Chi name of a year
export function getCanChiYear(year: number): string {
  const cans = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
  const chis = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
  return `${cans[year % 10]} ${chis[year % 12]}`;
}

// Helper to get number of days in a lunar year
function getLunarYearDays(year: number): number {
  let sum = 348; // 12 months * 29 days = 348
  const info = LUNAR_INFO[year - BASE_YEAR];
  
  // Add 1 day for each big month (30 days instead of 29)
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    if ((info & i) !== 0) sum += 1;
  }
  
  // Add days for leap month if exists
  const leapMonth = info & 0xf;
  if (leapMonth !== 0) {
    sum += (info & 0x10000) !== 0 ? 30 : 29;
  }
  return sum;
}

// Get leap month of a lunar year (0 if none)
function getLeapMonth(year: number): number {
  return LUNAR_INFO[year - BASE_YEAR] & 0xf;
}

// Get number of days of a specific lunar month
function getLunarMonthDays(year: number, month: number, isLeap = false): number {
  const info = LUNAR_INFO[year - BASE_YEAR];
  if (isLeap) {
    return (info & 0x10000) !== 0 ? 30 : 29;
  }
  return (info & (0x10000 >> month)) !== 0 ? 30 : 29;
}

export interface LunarDate {
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  canChiYear: string;
  isLeap: boolean;
}

// Main function to convert Solar Date to Lunar Date
export function convertSolarToLunar(day: number, month: number, year: number): LunarDate | null {
  if (year < 1900 || year > 2030) return null;
  
  const solarDate = new Date(year, month - 1, day);
  let offset = Math.floor((solarDate.getTime() - BASE_DATE.getTime()) / (24 * 60 * 60 * 1000));
  
  if (offset < 0) return null;
  
  let lunarYear = BASE_YEAR;
  let yearDays = getLunarYearDays(lunarYear);
  
  // Subtract years
  while (offset >= yearDays) {
    offset -= yearDays;
    lunarYear++;
    if (lunarYear > 2030) return null;
    yearDays = getLunarYearDays(lunarYear);
  }
  
  const leapMonth = getLeapMonth(lunarYear);
  let lunarMonth = 1;
  let isLeap = false;
  
  // Subtract months
  for (let m = 1; m <= 12; m++) {
    // Normal month
    let monthDays = getLunarMonthDays(lunarYear, m);
    if (offset < monthDays) {
      lunarMonth = m;
      break;
    }
    offset -= monthDays;
    
    // Check if leap month exists and is after this month
    if (leapMonth !== 0 && leapMonth === m) {
      monthDays = getLunarMonthDays(lunarYear, m, true);
      if (offset < monthDays) {
        lunarMonth = m;
        isLeap = true;
        break;
      }
      offset -= monthDays;
    }
  }
  
  const lunarDay = offset + 1;
  const canChiYear = getCanChiYear(lunarYear);
  
  return {
    lunarDay,
    lunarMonth,
    lunarYear,
    canChiYear,
    isLeap
  };
}

// Comprehensive date and string parser to retrieve Can Chi & Ages
export interface MemberAgeDetails {
  parsedBirthYear?: number;
  lunarYearCanChi?: string;
  lunarDateText?: string;
  solarAge?: number;
  lunarAge?: number; // Tuổi mụ
  ageAtDeathSolar?: number;
  ageAtDeathLunar?: number;
  ageText: string;
}

export function parseAndCalculateAges(
  birthDateStr: string,
  isDeceased: boolean,
  deathDateStr?: string,
  gender?: 'Nam' | 'Nữ'
): MemberAgeDetails {
  const result: MemberAgeDetails = { ageText: '' };
  if (!birthDateStr) return result;
  
  // Extract year of birth (first 4-digit number)
  const birthYearMatch = birthDateStr.match(/\b\d{4}\b/);
  if (!birthYearMatch) return result;
  
  const birthYear = parseInt(birthYearMatch[0], 10);
  result.parsedBirthYear = birthYear;
  result.lunarYearCanChi = getCanChiYear(birthYear);
  
  // Attempt to parse full solar date to get Lunar day and month
  // Formats: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD
  let day = 1;
  let month = 1;
  let hasFullDate = false;
  
  // Check DD-MM-YYYY or DD/MM/YYYY
  const dmMatch = birthDateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmMatch) {
    day = parseInt(dmMatch[1], 10);
    month = parseInt(dmMatch[2], 10);
    hasFullDate = true;
  } else {
    // Check YYYY-MM-DD
    const ymdMatch = birthDateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdMatch) {
      day = parseInt(ymdMatch[3], 10);
      month = parseInt(ymdMatch[2], 10);
      hasFullDate = true;
    }
  }
  
  if (hasFullDate && birthYear >= 1900 && birthYear <= 2030) {
    const lDate = convertSolarToLunar(day, month, birthYear);
    if (lDate) {
      result.lunarDateText = `Ngày ${lDate.lunarDay} tháng ${lDate.lunarMonth}${lDate.isLeap ? ' (Nhuận)' : ''} năm ${lDate.canChiYear}`;
    }
  } else {
    result.lunarDateText = `Năm ${result.lunarYearCanChi}`;
  }
  
  // Calculate current date or death date
  // For standard production year 2026 as per target local time
  const currentYear = 2026;
  
  if (!isDeceased) {
    // Alive
    result.solarAge = currentYear - birthYear;
    result.lunarAge = result.solarAge + 1; // Tuổi mụ
    
    if (result.solarAge < 0) {
      result.ageText = `Chưa sinh (Dự kiến năm ${birthYear})`;
    } else {
      result.ageText = `${result.solarAge} tuổi (Tuổi mụ: ${result.lunarAge} tuổi)`;
    }
  } else {
    // Deceased
    if (deathDateStr) {
      const deathYearMatch = deathDateStr.match(/\b\d{4}\b/);
      if (deathYearMatch) {
        const deathYear = parseInt(deathYearMatch[0], 10);
        result.ageAtDeathSolar = deathYear - birthYear;
        result.ageAtDeathLunar = result.ageAtDeathSolar + 1;
        
        const isOld = result.ageAtDeathSolar >= 60;
        const term = isOld ? 'Hưởng thọ' : 'Hưởng dương';
        
        result.ageText = `${term}: ${result.ageAtDeathSolar} tuổi (Tuổi mụ: ${result.ageAtDeathLunar} tuổi)`;
      } else {
        result.ageText = `Đã mất (Chưa rõ năm mất để tính tuổi thọ)`;
      }
    } else {
      result.ageText = `Đã mất (Chưa rõ năm mất để tính tuổi thọ)`;
    }
  }
  
  return result;
}
