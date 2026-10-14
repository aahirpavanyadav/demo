import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertTriangle, AlertCircle, Info, Search } from 'lucide-react';

// Toast System
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: Date.now().toString(), message, type };
  toastListeners.forEach(fn => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 4000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  const colors = {
    success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
    error: 'bg-red-900/90 border-red-500 text-red-100',
    warning: 'bg-amber-900/90 border-amber-500 text-amber-100',
    info: 'bg-cyan-900/90 border-cyan-500 text-cyan-100',
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id} className={`${colors[toast.type]} border px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm animate-slide-in flex items-center gap-2 min-w-[280px]`}>
          {toast.type === 'success' && <Check className="w-4 h-4" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
          {toast.type === 'info' && <Info className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white focus:ring-violet-500 shadow-lg shadow-violet-600/20',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500 border border-slate-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 focus:ring-slate-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

// Card
export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`} {...props}>{children}</div>;
}

// Badge
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    success: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
    warning: 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
    danger: 'bg-red-900/50 text-red-300 border border-red-700/50',
    info: 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50',
    purple: 'bg-violet-900/50 text-violet-300 border border-violet-700/50',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${sizes[size]} w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Confirm Dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
      </div>
    </Modal>
  );
}

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <input className={`w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <select className={`w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${className}`} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <textarea className={`w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none ${className}`} {...props} />
    </div>
  );
}

// Search Input
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
      />
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-slate-500 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// Tabs
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-700 mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? 'text-violet-300 border-b-2 border-violet-500 bg-violet-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-700">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'red';
}

export function StatCard({ title, value, icon, trend, color = 'violet' }: StatCardProps) {
  const colors = {
    violet: 'from-violet-600/20 to-violet-800/10 border-violet-700/30',
    cyan: 'from-cyan-600/20 to-cyan-800/10 border-cyan-700/30',
    emerald: 'from-emerald-600/20 to-emerald-800/10 border-emerald-700/30',
    amber: 'from-amber-600/20 to-amber-800/10 border-amber-700/30',
    red: 'from-red-600/20 to-red-800/10 border-red-700/30',
  };
  const iconColors = {
    violet: 'text-violet-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };
  return (
    <Card className={`p-5 bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className={iconColors[color]}>{icon}</div>}
      </div>
    </Card>
  );
}

// Table
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends Record<string, any>>({ columns, data, keyField, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map(col => (
              <th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {data.map(item => (
            <tr key={item[keyField]} className={`hover:bg-slate-700/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(item)}>
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm text-slate-300">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">No data available</div>
      )}
    </div>
  );
}

// Progress Bar
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'red';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 100, color = 'violet', showLabel = true, size = 'md' }: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const colors = {
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  const heights = { sm: 'h-1.5', md: 'h-2.5' };
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-slate-700 rounded-full ${heights[size]} overflow-hidden`}>
        <div className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className="text-xs text-slate-400 min-w-[36px] text-right">{percentage}%</span>}
    </div>
  );
}

// Rating Stars
interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
}

export function Rating({ value, onChange, max = 5 }: RatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          className={`text-xl transition-colors ${i < value ? 'text-amber-400' : 'text-slate-600'} ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          disabled={!onChange}
        >
          ★
        </button>
      ))}
    </div>
  );
}
