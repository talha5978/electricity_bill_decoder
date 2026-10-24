import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-primary bg-primary text-primary-foreground shadow-sm hover:bg-[#1d4b37]",
  secondary:
    "border border-secondary bg-secondary text-secondary-foreground hover:bg-[#dce7dc]",
  outline:
    "border border-border bg-card text-foreground hover:border-[#b7c5b9] hover:bg-[#f8faf6]",
  ghost: "border border-transparent bg-transparent text-muted-foreground hover:bg-muted",
};

export function Button({
  className = "",
  variant = "primary",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`cursor-pointer inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      type={type}
      {...props}
    />
  );
}
