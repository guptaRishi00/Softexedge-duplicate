"use client";

import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";

interface DynamicButtonProps {
  text?: string;
  href?: string;
  target?: "_blank" | "_self";
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  showIcon?: boolean;
  instantHover?: boolean;

  glowColors?: {
    from: string;
    to: string;
  };

  onClick?: () => void;
}

export default function DynamicButton({
  text = "Explore Our Work",
  href,
  target = "_self",
  className = "",
  textClassName = "",
  iconClassName = "",
  showIcon = true,
  instantHover = false,

  glowColors = {
    from: "#2E5BFF",
    to: "#149CCB",
  },

  onClick,
}: DynamicButtonProps) {
  const Component = href ? Link : "button";

  return (
    <Component
      href={href || ""}
      target={href ? target : undefined}
      onClick={onClick}
      className={cn(
        "group relative flex w-fit cursor-pointer hover:border-transparent items-center gap-3 overflow-hidden rounded-xl bg-white px-6 py-4 text-sm font-medium text-black transition-all",
        instantHover && "duration-0",
        className,
      )}
    >
      <div
        // `rounded-[inherit]`, not a fixed radius: this overlay was a SQUARE
        // rect relying purely on the parent's `overflow-hidden` to round it,
        // and the antialiased pixels along that clip let the button's white
        // background bleed through as a hairline on hover. It must match the
        // button's ACTUAL radius, which call sites override via `className`
        // (the navbar's Get in Touch resolves to 10px, not the base 14px), so
        // hard-coding any value re-creates the mismatch elsewhere.
        className={cn(
          "absolute inset-0 rounded-[inherit] opacity-0 transition-opacity group-hover:opacity-100",
          instantHover ? "duration-0" : "duration-500",
        )}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${glowColors.from}, ${glowColors.to})`,
          }}
        />

        <div
          className="absolute inset-0 opacity-60 blur-2xl"
          style={{
            background: `linear-gradient(to right, ${glowColors.from}, ${glowColors.to})`,
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <div
          className={cn(
            "absolute left-[-120%] top-0 h-full w-[60%] rotate-12 bg-white/40 blur-xl transition-all group-hover:left-[140%]",
            instantHover ? "duration-0" : "duration-1000",
          )}
        />
      </div>

      <span className={cn("relative z-10 flex font-bold", textClassName)}>
        <span
          className={cn(
            "opacity-100 transition-opacity group-hover:opacity-0",
            instantHover && "duration-0",
          )}
        >
          {text}
        </span>

        <span
          className="absolute left-0 top-0 flex text-white"
          aria-hidden="true"
        >
          {text.split("").map((char, index) => (
            <span
              key={index}
              className={cn(
                "opacity-0 transition-opacity group-hover:opacity-100",
                instantHover && "duration-0",
              )}
              style={{
                transitionDelay: instantHover ? "0s" : `${index * 0.03}s`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>

      {showIcon && (
        <span
          className={cn(
            "relative z-10 flex h-6 w-6 items-center justify-center overflow-hidden text-black transition-colors group-hover:text-white",
            iconClassName,
          )}
        >
          <MdKeyboardArrowRight
            size={24}
            className={cn(
              "absolute left-0 top-0 h-full w-full transition-transform ease-in-out group-hover:translate-x-[150%]",
              instantHover ? "duration-0" : "duration-300",
            )}
          />

          <MdKeyboardArrowRight
            size={24}
            className={cn(
              "absolute left-0 top-0 h-full w-full translate-x-[-150%] transition-transform ease-in-out group-hover:translate-x-0",
              instantHover ? "duration-0" : "duration-300",
            )}
          />
        </span>
      )}
    </Component>
  );
}
