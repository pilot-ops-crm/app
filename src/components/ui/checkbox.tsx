"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const CheckboxContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    checked?: boolean;
  }
>(({ className, checked, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-all",
      checked
        ? "border-primary bg-primary/10"
        : "border-border hover:border-muted-foreground",
      className
    )}
    {...props}
  />
))
CheckboxContainer.displayName = "CheckboxContainer"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer w-5 h-5 shrink-0 flex items-center justify-center rounded border border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="w-3 h-3 text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, CheckboxContainer }