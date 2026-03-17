import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Light
        // "bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5 rounded-3xl text-card-foreground flex flex-col gap-6 py-6",
        `rounded-3xl flex flex-col gap-6 py-6 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.03)_100%)] backdrop-blur-[10px] shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-800 ease-cubic-bezier(0.4,0,0.2,1) border border-white/30`,
        // Dark — Glassmorphism: slate-900/65, blur(20px) saturate(160%), border white/12, shadow 4px 30px
        // "dark:bg-[rgba(15,23,42,0.65)] dark:backdrop-blur-[20px] dark:backdrop-saturate-[160%] dark:border-white/[0.12] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]",
        `dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.2)_100%)]`,
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-base text-slate-800 dark:text-slate-200", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-slate-400 dark:text-slate-500", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
