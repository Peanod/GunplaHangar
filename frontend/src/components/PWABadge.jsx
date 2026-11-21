import { useEffect, useState } from 'react'
import { canInstall, isInstalled, promptInstall, subscribe } from '../pwaInstall.js'

// Ajakan pasang aplikasi + penanda saat perangkat offline.
// Memakai pwaInstall.js (satu-satunya penangkap beforeinstallprompt) supaya tidak bentrok
// dengan tombol Install di halaman Profil.
export default function PWABadge() {
  const [offline, setOffline] = useState(!navigator.onLine)
  const [hidden, setHidden] = useState(false)
  const [, rerender] = useState(0)

  useEffect(() => {
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    const unsubscribe = subscribe(() => rerender((n) => n + 1))
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      unsubscribe()
    }
  }, [])

  const showInstall = canInstall() && !isInstalled() && !hidden

  return (
    <>
      {offline && (
        <div className="pwa-bar offline" role="status">
          Kamu sedang offline. Yang tampil adalah data terakhir yang tersimpan.
        </div>
      )}
      {showInstall && (
        <div className="pwa-bar">
          <span>Pasang GunplaHangar di perangkatmu</span>
          <button onClick={() => promptInstall()}>Pasang</button>
          <button className="x" onClick={() => setHidden(true)} aria-label="Tutup">✕</button>
        </div>
      )}
    </>
  )
}
