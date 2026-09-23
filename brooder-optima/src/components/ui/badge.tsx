import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-zinc-50 text-zinc-900",
        secondary: "border-transparent bg-zinc-800 text-zinc-300",
        outline: "border-zinc-700 text-zinc-300 bg-transparent",
        destructive: "border-transparent bg-red-900/40 text-red-400 border-red-800/50",
        success: "border-transparent bg-emerald-900/40 text-emerald-400 border-emerald-800/50",
        warning: "border-transparent bg-amber-900/40 text-amber-400 border-amber-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
