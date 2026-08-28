import * as React from "react"
import { cn } from "@/lib/utils"

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("space-y-4", className)}
      {...props}
    />
  )
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FieldSeparator({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      className={cn("relative flex items-center gap-4 py-2", className)}
      {...props}
    >
      <div className="bg-border h-px flex-1" />
      {children && (
        <span data-slot="field-separator-content" className="text-muted-foreground text-xs">
          {children}
        </span>
      )}
      <div className="bg-border h-px flex-1" />
    </div>
  )
}

export { Field, FieldLabel, FieldGroup, FieldSeparator, FieldDescription }
