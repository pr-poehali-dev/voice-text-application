const STORAGE_KEY = 'voiceDemoUsage';

export interface DemoUsage {
  generate: number;
  translate: number;
  download: number;
}

function getBrowserFingerprint(): string {
  const parts = [
    navigator.language,
    navigator.platform,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
    navigator.userAgent.replace(/\d+/g, ''),
  ];
  let hash = 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getStorageKey(): string {
  const fp = getBrowserFingerprint();
  return `${STORAGE_KEY}_${fp}`;
}

export function loadDemoUsage(): DemoUsage {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as DemoUsage;
  } catch {
    // ignore
  }
  return { generate: 0, translate: 0, download: 0 };
}

export function saveDemoUsage(usage: DemoUsage): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(usage));
  } catch {
    // ignore
  }
}
