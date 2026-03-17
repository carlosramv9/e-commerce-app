import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-white/40 animate-pulse rounded-xl dark:bg-white/4", className)}
      {...props}
    />
  )
}

export { Skeleton }
