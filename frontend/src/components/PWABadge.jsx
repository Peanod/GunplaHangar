import { useEffect, useState } from 'react'

// Ajakan pasang aplikasi (install prompt) + penanda saat perangkat offline
export default function PWABadge() {
  const [prompt, setPrompt] = useState(null)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPrompt(e) }
    const onInstalled = () => setPrompt(null)
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const install = async () => {
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  return (
    <>
      {offline && (
        <div className="pwa-bar offline" role="status">
          Kamu sedang offline. Yang tampil adalah data terakhir yang tersimpan.
        </div>
      )}
      {prompt && !hidden && (
        <div className="pwa-bar">
          <span>Pasang GunplaHangar di perangkatmu</span>
          <button onClick={install}>Pasang</button>
          <button className="x" onClick={() => setHidden(true)} aria-label="Tutup">✕</button>
        </div>
      )}
    </>
  )
}
