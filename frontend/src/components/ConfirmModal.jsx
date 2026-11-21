// Dialog konfirmasi untuk aksi yang tidak bisa dibatalkan (hapus data)
export default function ConfirmModal({
  open, title, message, confirmLabel = 'Hapus', loading = false, onConfirm, onCancel,
}) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-box"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-msg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-msg">{message}</p>
        <div className="modal-actions">
          <button className="ghost" onClick={onCancel} disabled={loading}>Batal</button>
          <button className="danger solid" onClick={onConfirm} disabled={loading}>
            {loading ? 'Memproses…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
