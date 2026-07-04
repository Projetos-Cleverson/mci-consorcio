export const RESULT_CONTEXT_STORAGE_KEY = 'mci_consorcio_result_context_v1';

export interface ResultContext {
  leadId: string;
  partnerSlug: string;
  partnerDisplayName: string;
  contactWhatsapp: string;
  contactSource: 'partner' | 'epsa_temporary';
  savedAt: string;
}

export function saveResultContext(context: ResultContext) {
  window.sessionStorage.setItem(RESULT_CONTEXT_STORAGE_KEY, JSON.stringify(context));
}

export function readResultContext(): ResultContext | null {
  try {
    const stored = window.sessionStorage.getItem(RESULT_CONTEXT_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ResultContext;
  } catch {
    window.sessionStorage.removeItem(RESULT_CONTEXT_STORAGE_KEY);
    return null;
  }
}

export function clearResultContext() {
  window.sessionStorage.removeItem(RESULT_CONTEXT_STORAGE_KEY);
}
