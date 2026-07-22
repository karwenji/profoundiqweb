import * as React from "react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | undefined>(undefined)

function Dialog({ open, onOpenChange, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode; className?: string }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
          <div className={cn("relative z-10 bg-white rounded-lg shadow-lg", className)}>
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

function DialogContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
}

function DialogHeader({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  )
}

function DialogTitle({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-xl font-semibold", className)} {...props}>
      {children}
    </h2>
  )
}

function DialogDescription({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-gray-500", className)} {...props}>
      {children}
    </p>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }
