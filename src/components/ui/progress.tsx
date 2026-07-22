import * as React from "react"

import { cn } from "@/lib/utils"

function Progress({ className, ...props }: React.ComponentProps<"progress">) {
  return (
    <progress
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-primary/20 [&::-webkit-progress-bar]:bg-primary/20 [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary",
        className
      )}
      {...props}
    />
  )
}

export { Progress }
