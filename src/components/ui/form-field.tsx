import * as React from "react"
import { DangerIcon } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils/cn"

// Label + control + hint + error, wired for screen readers.
// The control must use `id={id}` and spread `describedBy` into aria-describedby.
function FormField({
  id,
  label,
  hint,
  error,
  status,
  className,
  children,
}: {
  id: string
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string | null
  status?: React.ReactNode
  className?: string
  children: (describedBy: string | undefined) => React.ReactNode
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {status}
      </div>
      {children(describedBy)}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-rose-deep">
          <DangerIcon weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  )
}

export { FormField }
