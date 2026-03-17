"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"
import { Slot as SlotPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "17rem"
const SIDEBAR_WIDTH_ICON = "3.5rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// ─────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────
type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

// ─────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value: boolean | ((v: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(next)
      } else {
        _setOpen(next)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open],
  )

  const toggleSidebar = React.useCallback(() => setOpen((v) => !v), [setOpen])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const ctx = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, toggleSidebar }),
    [state, open, setOpen, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={ctx}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn("group/sidebar-wrapper flex", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// ─────────────────────────────────────────────
//  Sidebar
// ─────────────────────────────────────────────
function Sidebar({
  collapsible = "icon",
  className,
  children,
  ...props
}: React.ComponentProps<"aside"> & {
  collapsible?: "icon" | "none"
}) {
  const { state } = useSidebar()

  return (
    <aside
      data-slot="sidebar"
      data-state={state}
      data-collapsible={collapsible}
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-[#FAFBFD] dark:bg-slate-900 dark:border-slate-800 transition-[width] duration-200 ease-linear",
        collapsible === "icon"
          ? state === "expanded"
            ? "w-(--sidebar-width)"
            : "w-(--sidebar-width-icon)"
          : "w-(--sidebar-width)",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

// ─────────────────────────────────────────────
//  Trigger
// ─────────────────────────────────────────────
function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-slot="sidebar-trigger"
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150",
        className,
      )}
      {...props}
    >
      <PanelLeftIcon className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

// ─────────────────────────────────────────────
//  Layout sections
// ─────────────────────────────────────────────
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("flex flex-col gap-1 p-2", className)} {...props} />
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr data-slot="sidebar-separator" className={cn("border-slate-200 mx-2", className)} {...props} />
}

// ─────────────────────────────────────────────
//  Menu
// ─────────────────────────────────────────────
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("flex flex-col gap-0.5", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("relative", className)} {...props} />
}

// ─────────────────────────────────────────────
//  Menu Button
// ─────────────────────────────────────────────
const sidebarMenuButtonVariants = cva(
  "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-slate-700 hover:text-slate-800 hover:bg-slate-100",
        active: "bg-slate-100 text-slate-800",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

interface SidebarMenuButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  variant,
  className,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const { state } = useSidebar()
  const Comp = asChild ? SlotPrimitive.Slot : "button"
  const resolvedVariant = isActive ? "active" : (variant ?? "default")

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-slate-400" />
      )}
      {children}
    </Comp>
  )

  if (!tooltip || state === "expanded") return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-800 text-slate-200 border border-slate-700 text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

// ─────────────────────────────────────────────
//  Menu Badge
// ─────────────────────────────────────────────
function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      className={cn(
        "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold px-1.5 border border-slate-200",
        className,
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
