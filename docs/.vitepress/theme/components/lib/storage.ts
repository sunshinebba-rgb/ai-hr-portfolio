/**
 * 本地存储 - 人才盘点数据持久化
 */
import type { TalentRecord } from '../types';

const STORAGE_KEY = 'talent-review-records';

export function loadRecords(): TalentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecords(records: TalentRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(record: TalentRecord): TalentRecord[] {
  const records = loadRecords();
  const exists = records.findIndex(r => r.employee.id === record.employee.id);
  const next = [...records];
  if (exists >= 0) next[exists] = record;
  else next.push(record);
  saveRecords(next);
  return next;
}

export function deleteRecord(id: string): TalentRecord[] {
  const records = loadRecords().filter(r => r.employee.id !== id);
  saveRecords(records);
  return records;
}

export function updateRecord(id: string, updater: (r: TalentRecord) => TalentRecord): TalentRecord[] {
  const records = loadRecords();
  const idx = records.findIndex(r => r.employee.id === id);
  if (idx < 0) return records;
  records[idx] = updater(records[idx]);
  saveRecords(records);
  return records;
}
