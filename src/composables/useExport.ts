import { ref, computed } from 'vue';
import type { HistoryRecord } from '../types';
import {
  filterByDateRange,
  buildCsv,
  downloadCsvFile,
  buildExportFilename,
} from '../lib/export-excel';
import {
  buildTextReport,
  buildTextFilename,
  downloadTextFile,
} from '../lib/export-text';

const todayStr = (): string => {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const daysAgoStr = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const pad = (x: number) => (x < 10 ? '0' + x : String(x));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const tsToDateStr = (ts: number): string => {
  const d = new Date(ts);
  const pad = (x: number) => (x < 10 ? '0' + x : String(x));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const recordTs = (r: HistoryRecord): number | null => {
  if (typeof r.ts === 'number' && Number.isFinite(r.ts)) return r.ts;
  if (typeof r.ts === 'string') {
    const n = Number(r.ts);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const oldestRecordTs = (records: HistoryRecord[]): number | null => {
  let oldest: number | null = null;
  for (const r of records) {
    const ts = recordTs(r);
    if (ts === null) continue;
    if (oldest === null || ts < oldest) oldest = ts;
  }
  return oldest;
};

const oldestRecordDateStr = (records: HistoryRecord[]): string => {
  const oldest = oldestRecordTs(records);
  return oldest !== null ? tsToDateStr(oldest) : daysAgoStr(7);
};

interface ShowToastFn {
  (title: string): void;
}

export function useExport({ historyListRef, showToast }: {
  historyListRef: { value: HistoryRecord[] };
  showToast?: ShowToastFn;
}) {
  const showExport = ref(false);
  const exportFormat = ref<'csv' | 'text'>('csv');
  const exportStart = ref(oldestRecordDateStr(historyListRef.value));
  const exportEnd = ref(todayStr());

  const filteredRecords = computed(() =>
    filterByDateRange(historyListRef.value, exportStart.value, exportEnd.value),
  );

  const filteredCount = computed(() => filteredRecords.value.length);
  const totalCount = computed(() => historyListRef.value.length);

  const openExport = () => { showExport.value = true; };
  const closeExport = () => { showExport.value = false; };
  const setExportFormat = (f: 'csv' | 'text') => { exportFormat.value = f; };

  const selectAllRange = () => {
    exportStart.value = oldestRecordDateStr(historyListRef.value);
    exportEnd.value = todayStr();
  };

  const doExport = () => {
    if (exportStart.value && exportEnd.value && exportStart.value > exportEnd.value) {
      showToast && showToast('起始日期不能晚于结束日期');
      return;
    }
    const records = filteredRecords.value;
    if (records.length === 0) {
      showToast && showToast('所选时间段无记录');
      return;
    }
    if (exportFormat.value === 'text') {
      const text = buildTextReport(records, exportStart.value, exportEnd.value);
      const filename = buildTextFilename(exportStart.value, exportEnd.value);
      downloadTextFile(filename, text);
    } else {
      const csv = buildCsv(records);
      const filename = buildExportFilename(exportStart.value, exportEnd.value);
      downloadCsvFile(filename, csv);
    }
    showToast && showToast(`已导出 ${records.length} 条`);
  };

  return {
    showExport,
    exportFormat,
    exportStart,
    exportEnd,
    filteredCount,
    totalCount,
    openExport,
    closeExport,
    setExportFormat,
    selectAllRange,
    doExport,
  };
}
