import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return '';

    let str = '';

    if (Array.isArray(value)) {
      str = value.join(' | ');
    } else if (typeof value === 'object') {
      str = JSON.stringify(value);
    } else {
      str = String(value);
    }

    // Remove quebras de linha que podem quebrar a estrutura do CSV
    str = str.replace(/\r?\n|\r/g, ' ');

    // Escapa aspas duplas
    str = str.replace(/"/g, '""');

    return `"${str}"`;
  };

  const separator = ';';

  const csvContent = [
    headers.map(formatValue).join(separator),
    ...data.map((row) =>
      headers.map((header) => formatValue(row[header])).join(separator)
    ),
  ].join('\r\n');

  // BOM ajuda o Excel a reconhecer UTF-8 com acentos
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();

  URL.revokeObjectURL(link.href);
}
