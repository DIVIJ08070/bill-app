export const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  bg: '#f1f5f9',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  successBg: '#dcfce7',
  warningBg: '#fef3c7',
  dangerBg: '#fee2e2',
  inputBg: '#f8fafc',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export function money(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function statusColor(status: string): { fg: string; bg: string } {
  switch (status) {
    case 'paid':
      return { fg: colors.success, bg: colors.successBg };
    case 'partial':
      return { fg: colors.warning, bg: colors.warningBg };
    default:
      return { fg: colors.danger, bg: colors.dangerBg };
  }
}
