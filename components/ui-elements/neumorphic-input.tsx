import * as React from "react"
import { cn } from "@/lib/utils"

interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const NeumorphicInput = React.forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ className, icon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">{icon}</div>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            className,
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>}
      </div>
    )
  },
)
NeumorphicInput.displayName = "NeumorphicInput"

export { NeumorphicInput }
