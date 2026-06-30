export type HomePage = 'dashboard' | 'upload' | 'reports' | 'ai-insights';
export type DefaultDocumentView = 'grid' | 'table';
export type ResponseTone = 'concise' | 'balanced' | 'detailed';
export type SummaryLength = 'short' | 'medium' | 'long';
export type DigestFrequency = 'instant' | 'daily' | 'weekly';
export type SessionTimeout = '30m' | '2h' | '8h' | 'never';

export interface AppSettings {
  displayName: string;
  homePage: HomePage;
  compactMode: boolean;
  workspaceName: string;
  defaultDocumentView: DefaultDocumentView;
  autoOpenUploadedDocument: boolean;
  showActivityTimestamps: boolean;
  responseTone: ResponseTone;
  summaryLength: SummaryLength;
  autoSuggestActions: boolean;
  strictExtraction: boolean;
  usageAlerts: boolean;
  usageAlertThreshold: number;
  monthlyUsageReport: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  digestFrequency: DigestFrequency;
  sessionTimeout: SessionTimeout;
  requireReauthForDanger: boolean;
  hideSensitivePreviews: boolean;
  keepSignedIn: boolean;
}

const STORAGE_KEY = 'docflow.settings.v1';

const DEFAULT_SETTINGS: AppSettings = {
  displayName: '',
  homePage: 'dashboard',
  compactMode: false,
  workspaceName: 'DocFlow Workspace',
  defaultDocumentView: 'grid',
  autoOpenUploadedDocument: true,
  showActivityTimestamps: true,
  responseTone: 'balanced',
  summaryLength: 'medium',
  autoSuggestActions: true,
  strictExtraction: true,
  usageAlerts: true,
  usageAlertThreshold: 80,
  monthlyUsageReport: true,
  emailNotifications: true,
  desktopNotifications: true,
  digestFrequency: 'daily',
  sessionTimeout: '8h',
  requireReauthForDanger: true,
  hideSensitivePreviews: true,
  keepSignedIn: true,
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function parseBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function parseString<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function parseNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) {
    return DEFAULT_SETTINGS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const settings: AppSettings = {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : DEFAULT_SETTINGS.displayName,
      homePage: parseString(parsed.homePage, ['dashboard', 'upload', 'reports', 'ai-insights'] as const, DEFAULT_SETTINGS.homePage),
      compactMode: parseBoolean(parsed.compactMode, DEFAULT_SETTINGS.compactMode),
      workspaceName: typeof parsed.workspaceName === 'string' && parsed.workspaceName.trim() ? parsed.workspaceName : DEFAULT_SETTINGS.workspaceName,
      defaultDocumentView: parseString(parsed.defaultDocumentView, ['grid', 'table'] as const, DEFAULT_SETTINGS.defaultDocumentView),
      autoOpenUploadedDocument: parseBoolean(parsed.autoOpenUploadedDocument, DEFAULT_SETTINGS.autoOpenUploadedDocument),
      showActivityTimestamps: parseBoolean(parsed.showActivityTimestamps, DEFAULT_SETTINGS.showActivityTimestamps),
      responseTone: parseString(parsed.responseTone, ['concise', 'balanced', 'detailed'] as const, DEFAULT_SETTINGS.responseTone),
      summaryLength: parseString(parsed.summaryLength, ['short', 'medium', 'long'] as const, DEFAULT_SETTINGS.summaryLength),
      autoSuggestActions: parseBoolean(parsed.autoSuggestActions, DEFAULT_SETTINGS.autoSuggestActions),
      strictExtraction: parseBoolean(parsed.strictExtraction, DEFAULT_SETTINGS.strictExtraction),
      usageAlerts: parseBoolean(parsed.usageAlerts, DEFAULT_SETTINGS.usageAlerts),
      usageAlertThreshold: parseNumber(parsed.usageAlertThreshold, DEFAULT_SETTINGS.usageAlertThreshold, 50, 100),
      monthlyUsageReport: parseBoolean(parsed.monthlyUsageReport, DEFAULT_SETTINGS.monthlyUsageReport),
      emailNotifications: parseBoolean(parsed.emailNotifications, DEFAULT_SETTINGS.emailNotifications),
      desktopNotifications: parseBoolean(parsed.desktopNotifications, DEFAULT_SETTINGS.desktopNotifications),
      digestFrequency: parseString(parsed.digestFrequency, ['instant', 'daily', 'weekly'] as const, DEFAULT_SETTINGS.digestFrequency),
      sessionTimeout: parseString(parsed.sessionTimeout, ['30m', '2h', '8h', 'never'] as const, DEFAULT_SETTINGS.sessionTimeout),
      requireReauthForDanger: parseBoolean(parsed.requireReauthForDanger, DEFAULT_SETTINGS.requireReauthForDanger),
      hideSensitivePreviews: parseBoolean(parsed.hideSensitivePreviews, DEFAULT_SETTINGS.hideSensitivePreviews),
      keepSignedIn: parseBoolean(parsed.keepSignedIn, DEFAULT_SETTINGS.keepSignedIn),
    };

    return settings;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  return settings;
}

export function getDefaultSettings() {
  return DEFAULT_SETTINGS;
}
