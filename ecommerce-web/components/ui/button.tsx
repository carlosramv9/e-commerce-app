import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 rounded-xl dark:bg-indigo-500/80 dark:hover:bg-indigo-500 dark:shadow-indigo-500/30",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 rounded-xl focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-red-500/80 dark:hover:bg-red-500",
        outline:
          "bg-white/60 border border-slate-200/80 text-slate-700 hover:bg-white shadow-sm rounded-xl dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white",
        secondary:
          "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 rounded-xl dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
        ghost:
          "text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded-xl dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
