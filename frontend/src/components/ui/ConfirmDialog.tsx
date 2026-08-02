import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={danger ? 'flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger' : 'flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary'}>
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h3 className="font-semibold text-text">{title}</h3>
          <p className="mt-1 text-sm text-text-secondary">{message}</p>
        </div>
      </div>
    </Modal>
  )
}
