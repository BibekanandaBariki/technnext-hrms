import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const premiumButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] text-white hover:shadow-[0_0_30px_rgba(102,126,234,0.6)] hover:scale-105 active:scale-95",
                outline:
                    "border-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40",
                ghost: "hover:bg-white/10 text-white",
            },
            size: {
                default: "h-12 px-6 py-3",
                sm: "h-10 px-4 py-2",
                lg: "h-14 px-8 py-4 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface PremiumButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
    asChild?: boolean
    loading?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(premiumButtonVariants({ variant, size, className }))}
                ref={ref}
                disabled={loading || props.disabled}
                {...props}
            >
                {/* Gradient overlay on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                {/* Content */}
                <span className="relative flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {children}
                </span>
            </Comp>
        )
    }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton, premiumButtonVariants }
