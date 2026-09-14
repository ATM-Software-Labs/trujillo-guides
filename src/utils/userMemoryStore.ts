/**
 * User & Local Memory Store for ATM Savings
 * Permite a los usuarios identificarse con su nombre (o cuenta Trujillo AI)
 * y guardar múltiples auditorías / escenarios en memoria local (Zero-Knowledge, 100% cliente).
 */
import { ParseResult } from '../types';

export interface SavedGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface SavedAudit {
  id: string;
  name: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  totalLiquidity: number;
  parseResults: ParseResult[];
  notes?: string;
  goals?: SavedGoal[];
  stressParameters?: {
    incomeReductionPercent: number;
    unexpectedExpenseAmount: number;
    inflationExpensePercent: number;
  };
}

const VAULT_STORAGE_KEY = 'atm_savings_vault';
const GUEST_NAME_KEY = 'atm_guest_name';
const AUTH_TOKEN_KEY = 'trujillo_ai_token';

export function getStoredUserName(): string {
  try {
    return (localStorage.getItem(GUEST_NAME_KEY) || '').trim();
  } catch (e) {
    return '';
  }
}

export function setStoredUserName(name: string): string {
  const clean = String(name || '').trim().slice(0, 40);
  try {
    if (clean) {
      localStorage.setItem(GUEST_NAME_KEY, clean);
    } else {
      localStorage.removeItem(GUEST_NAME_KEY);
    }
  } catch (e) {}
  return clean;
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(GUEST_NAME_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('achievements_') || k.startsWith('atm_achievements') || k.startsWith('atm_used_langs') || k === 'achievements_guest')) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {}
}

export function getInitialLetter(name: string): string {
  const n = String(name || '').trim();
  if (!n) return 'U';
  return n.charAt(0).toUpperCase();
}

export function getFirstName(fullName: string): string {
  const s = String(fullName || '').trim();
  if (!s) return '';
  if (s.startsWith('@')) return s.slice(1).split(/\s+/)[0];
  if (s.includes('@') && !s.includes(' ')) return s.split('@')[0];
  return s.split(/\s+/)[0];
}

export function loadAllSavedAudits(): SavedAudit[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error loading saved audits from local vault:', e);
    return [];
  }
}

export function saveAuditToVault(
  name: string,
  totalLiquidity: number,
  parseResults: ParseResult[],
  goals?: SavedGoal[],
  stressParameters?: {
    incomeReductionPercent: number;
    unexpectedExpenseAmount: number;
    inflationExpensePercent: number;
  },
  existingId?: string
): SavedAudit {
  const audits = loadAllSavedAudits();
  const userName = getStoredUserName() || 'Usuario';
  const now = new Date().toISOString();

  if (existingId) {
    const idx = audits.findIndex((a) => a.id === existingId);
    if (idx !== -1) {
      audits[idx] = {
        ...audits[idx],
        name: name.trim() || audits[idx].name,
        totalLiquidity,
        parseResults,
        updatedAt: now,
        goals,
        stressParameters
      };
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(audits));
      return audits[idx];
    }
  }

  const newAudit: SavedAudit = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim() || `Auditoría ${new Date().toLocaleDateString()}`,
    userName,
    createdAt: now,
    updatedAt: now,
    totalLiquidity,
    parseResults,
    goals,
    stressParameters
  };

  audits.unshift(newAudit);
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(audits));
  } catch (e) {
    console.error('Failed to write audit to localStorage:', e);
  }
  return newAudit;
}

export function deleteAuditFromVault(id: string): void {
  try {
    const audits = loadAllSavedAudits().filter((a) => a.id !== id);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(audits));
  } catch (e) {}
}

export function exportVaultToJson(): void {
  const audits = loadAllSavedAudits();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(audits, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `atm-savings-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importVaultFromJson(jsonString: string): { count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      return { count: 0, error: 'El archivo debe contener una lista de auditorías válida.' };
    }
    const current = loadAllSavedAudits();
    const existingIds = new Set(current.map((a) => a.id));
    let added = 0;

    for (const item of data) {
      if (item && item.id && item.totalLiquidity !== undefined && Array.isArray(item.parseResults)) {
        if (!existingIds.has(item.id)) {
          current.push(item);
          added++;
        }
      }
    }

    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(current));
    return { count: added };
  } catch (e) {
    return { count: 0, error: 'El archivo JSON está dañado o no tiene el formato esperado.' };
  }
}
