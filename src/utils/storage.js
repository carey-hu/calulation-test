const STORAGE_KEY = 'calc_history'
const MAX_RECORDS = 5000

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveHistory(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addRecord(list, record) {
  const newList = [record, ...list]
  if (newList.length > MAX_RECORDS) {
    newList.length = MAX_RECORDS
  }
  saveHistory(newList)
  return newList
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

export function clearOldestRecords(list, count) {
  const newList = list.slice(0, -count)
  saveHistory(newList)
  return newList
}
