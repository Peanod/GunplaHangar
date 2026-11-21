// Menangkap tawaran install PWA sejak aplikasi dimuat,
// supaya tombol "Install" di halaman mana pun bisa memakainya.

let deferred = null;
let installed =
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(display-mode: standalone)').matches;
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    emit();
  });
}

export const canInstall = () => deferred !== null;
export const isInstalled = () => installed;

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

// Hasil: 'accepted' | 'dismissed' | 'unavailable' | 'error'
export async function promptInstall() {
  if (!deferred) return 'unavailable';
  const evt = deferred;
  deferred = null;          // tawaran hanya bisa dipakai sekali
  emit();
  try {
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    return outcome;         // 'accepted' atau 'dismissed'
  } catch {
    return 'error';         // mis. sudah dipakai oleh bar "Pasang"
  }
}
