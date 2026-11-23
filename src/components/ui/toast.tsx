"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

function Toast({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Root> & {
  variant?: "default" | "destructive"
}) {
  return (
    <ToastPrimitives.Root
      data-slot="toast"
      className={cn(
        "group pointer-events-auto relative flex data-[state=modified]:hidden w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full mt-4 data-[state=open]:sm:slide-in-from-bottom-full last:mt-0",
        variant === "destructive"
          ? "destructive group border-red-600 bg-red-600 text-white shadow-red-900/30"
          : "group border bg-background text-foreground shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Close>) {
  return (
    <ToastPrimitives.Close
      data-slot="toast-close"
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 group-[.destructive]:text-white/80 group-[.destructive]:hover:text-white",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="size-4" />
    </ToastPrimitives.Close>
  )
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Title>) {
  return (
    <ToastPrimitives.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold [&+div]:text-xs", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Description>) {
  return (
    <ToastPrimitives.Description
      data-slot="toast-description"
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Viewport>) {
  return (
    <ToastPrimitives.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
}

type ToastProps = React.ComponentProps<typeof Toast>

type ToastActionElement = React.ReactElement<
  React.ComponentProps<typeof ToastPrimitives.Action>
>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
}
