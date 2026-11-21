// Memanaskan cache offline.
// Request pertama setelah service worker terpasang belum lewat service worker, jadi data
// dan foto belum tersimpan. Di sini kita ambil ulang daftar kit/log/grade dan muat foto-fotonya
// setelah service worker mengontrol halaman, sehingga kunjungan online pertama sudah cukup
// untuk memakai aplikasi offline.
import kitService from './services/kitService.js'
import logService from './services/logService.js'
import gradeService from './services/gradeService.js'
import { photoEntries } from './util.js'

const preloadImage = (url) => {
  if (!url) return
  const img = new Image() // destination "image" -> ikut masuk image-cache
  img.src = url
}

async function warm() {
  if (!navigator.onLine) return
  const [kits] = await Promise.allSettled([
    kitService.getAll(),
    logService.getAll(),
    gradeService.getAll(),
  ])
  if (kits.status !== 'fulfilled' || !Array.isArray(kits.value)) return
  kits.value.forEach((k) => {
    preloadImage(k.image_url)
    photoEntries(k.progress_photos).forEach((p) => preloadImage(p.url))
  })
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    if (navigator.serviceWorker.controller) warm()
    else navigator.serviceWorker.addEventListener('controllerchange', () => warm(), { once: true })
  })
}
