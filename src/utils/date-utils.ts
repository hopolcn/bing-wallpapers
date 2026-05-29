export function formatDate(date: Date, _timezone = "Asia/Shanghai"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function getYear(dateStr: string): string {
  return dateStr.slice(0, 4);
}

export function getMonth(dateStr: string): string {
  return dateStr.slice(5, 7);
}

export function today(): string {
  return formatDate(new Date());
}
