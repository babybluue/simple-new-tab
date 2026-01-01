/**
 * 农历转换工具
 * 基于公历日期转换为农历日期
 * 数据表格式：低4位表示闰月月份，5-16位表示12个月的大小，17位表示闰月大小
 */

// 农历数据表（1900-2100年）
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520,
]

// 农历月份名称
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

// 农历日期名称
const LUNAR_DAYS = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
]

// 天干
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 生肖
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

/**
 * 获取农历年份的天干地支
 */
function getGanZhi(year: number): string {
  let ganIndex = (year - 4) % 10
  let zhiIndex = (year - 4) % 12
  if (ganIndex < 0) ganIndex += 10
  if (zhiIndex < 0) zhiIndex += 12
  return `${GAN[ganIndex]}${ZHI[zhiIndex]}`
}

/**
 * 获取农历年份的生肖
 */
function getZodiac(year: number): string {
  let index = (year - 4) % 12
  if (index < 0) index += 12
  return ZODIAC[index]
}

/**
 * 计算农历日期
 */
export interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  ganZhi: string
  zodiac: string
}

/**
 * 获取闰月月份（低4位，0表示无闰月）
 */
function getLeapMonth(yearInfo: number): number {
  return yearInfo & 0xf
}

/**
 * 获取农历月份的天数
 * 从第17位开始，每一位表示一个月份的大小（1=大月30天，0=小月29天）
 * 月份从1开始，对应位从16开始（第17位是闰月大小标志）
 */
function getMonthDays(yearInfo: number, month: number): number {
  // 月份1对应位16，月份2对应位15，以此类推
  return (yearInfo & (0x10000 >> month)) ? 30 : 29
}

/**
 * 获取闰月的天数（第17位表示闰月大小）
 */
function getLeapMonthDays(yearInfo: number): number {
  return (yearInfo & 0x10000) ? 30 : 29
}

/**
 * 获取农历年份的总天数
 */
function getYearDays(yearInfo: number): number {
  let total = 0
  // 计算12个正常月份的天数
  for (let i = 1; i <= 12; i++) {
    total += getMonthDays(yearInfo, i)
  }
  // 如果有闰月，加上闰月的天数
  const leapMonth = getLeapMonth(yearInfo)
  if (leapMonth > 0) {
    total += getLeapMonthDays(yearInfo)
  }
  return total
}

/**
 * 将公历日期转换为农历日期
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  // 1900年1月31日为农历1900年正月初一
  const baseDate = new Date(1900, 0, 31)
  const targetDate = new Date(year, month - 1, day)
  
  // 计算从基准日期到目标日期的天数差
  let offset = Math.floor((targetDate.getTime() - baseDate.getTime()) / 86400000)

  // 如果日期在基准日期之前，返回1900年正月初一
  if (offset < 0) {
    return {
      year: 1900,
      month: 1,
      day: 1,
      isLeapMonth: false,
      ganZhi: getGanZhi(1900),
      zodiac: getZodiac(1900),
    }
  }

  // 如果超出数据表范围，返回最后一年
  if (year > 2099) {
    year = 2099
  }

  let lunarYear = 1900
  let lunarMonth = 1
  let lunarDay = 1
  let isLeapMonth = false

  // 计算农历年份
  for (let i = 0; i < 200 && i < LUNAR_INFO.length; i++) {
    const yearInfo = LUNAR_INFO[i]
    const yearDays = getYearDays(yearInfo)

    if (offset < yearDays) {
      lunarYear = 1900 + i
      break
    }
    offset -= yearDays
  }

  // 计算农历月份和日期
  const yearInfo = LUNAR_INFO[lunarYear - 1900]
  const leapMonth = getLeapMonth(yearInfo)

  // 遍历12个月，查找对应的月份
  // 闰月插入在正常月份之后，例如：正月、二月、三月、闰三月、四月...
  for (let i = 1; i <= 12; i++) {
    const monthDays = getMonthDays(yearInfo, i)
    
    // 先检查是否在当前正常月份内
    if (offset < monthDays) {
      lunarMonth = i
      lunarDay = offset + 1
      isLeapMonth = false
      break
    }
    // 减去当前正常月份的天数
    offset -= monthDays

    // 如果当前月份是闰月月份，检查是否在闰月内
    // 闰月紧跟在正常月份之后
    if (leapMonth > 0 && i === leapMonth) {
      const leapMonthDays = getLeapMonthDays(yearInfo)
      if (offset < leapMonthDays) {
        // 在闰月内
        lunarMonth = i
        isLeapMonth = true
        lunarDay = offset + 1
        break
      }
      // 减去闰月天数，继续下一个月份
      offset -= leapMonthDays
    }
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth,
    ganZhi: getGanZhi(lunarYear),
    zodiac: getZodiac(lunarYear),
  }
}

/**
 * 格式化农历日期为字符串
 */
export function formatLunarDate(lunar: LunarDate, locale: 'zh_CN' | 'zh_TW' = 'zh_CN'): string {
  const monthName = LUNAR_MONTHS[lunar.month - 1]
  const dayName = LUNAR_DAYS[lunar.day - 1]
  const leapPrefix = lunar.isLeapMonth ? '闰' : ''
  return `${leapPrefix}${monthName}月${dayName}`
}
