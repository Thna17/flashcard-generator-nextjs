import { Eye, Lock } from "lucide-react";

import { pressStart } from "../../font";
import { cn } from "@/lib/utils";

type VisibilityOption = {
  label: string;
  value: string;
  icon?: "lock" | "eye";
};

export type StatsCardProps = {
  label: string;
  value: string | number;
  meta?: string;
  metaIcon?: "trophy" | "bolt";
  editable?: boolean;
  multiline?: boolean;
  fieldType?: "text" | "description" | "visibility";
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  options?: VisibilityOption[];
  className?: string;
};

export function StatsCard({
  label,
  value,
  meta,
  metaIcon,
  editable = false,
  multiline = false,
  fieldType = "text",
  name,
  placeholder,
  defaultValue,
  options,
  className,
}: StatsCardProps) {
  if (editable) {
    const resolvedName = name || label.toLowerCase().replace(/\s+/g, "-");
    const resolvedOptions =
      options && options.length > 0
        ? options
        : [
            { label: "PRIVATE", value: "private", icon: "lock" },
            { label: "PUBLIC", value: "public", icon: "eye" },
          ];

    return (
      <div
        className={cn(
          "flex h-full  flex-col gap-5 border-4 border-black bg-[#dedede] px-6 py-6 shadow-[10px_10px_0px_#000]",
          className,
        )}
      >
        <label
          className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.28em] text-[#101214]`}
        >
          {label}:
        </label>

        {fieldType === "visibility" ? (
          <div className="mt-auto grid gap-4 sm:grid-cols-2">
            {resolvedOptions.map((option) => (
              <label key={`${resolvedName}-${option.value}`} className="block">
                <input
                  type="radio"
                  name={resolvedName}
                  value={option.value}
                  defaultChecked={(defaultValue || resolvedOptions[0]?.value) === option.value}
                  className="peer sr-only"
                />
                <span
                  className={`${pressStart.className} flex w-full items-center justify-between border-4 border-black bg-[#b38763] px-4 py-4 text-[0.55rem] uppercase tracking-[0.14em] text-black shadow-[6px_6px_0px_#000] transition peer-checked:bg-[#f3c970]`}
                >
                  <span className="truncate">{option.label}</span>
                  <span className="ml-2 shrink-0">
                    {option.icon === "lock" ? <Lock className="h-4 w-4" /> : null}
                    {option.icon === "eye" ? <Eye className="h-4 w-4" /> : null}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : multiline || fieldType === "description" ? (
          <textarea
            name={resolvedName}
            defaultValue={typeof value === "string" ? value : String(value)}
            placeholder={placeholder || "[ CORE CONCEPTS.... ]"}
            className={`${pressStart.className}  min-h-[64px] w-full resize-none border-0 bg-transparent text-[0.6rem] tracking-[0.14em] text-[#3b4249] outline-none placeholder:text-[#3b4249]`}
          />
        ) : (
          <input
            name={resolvedName}
            defaultValue={typeof value === "string" ? value : String(value)}
            placeholder={placeholder || "[ REACTJS_INTERVIEW ]"}
            className={`${pressStart.className} w-full border-0 bg-transparent text-[0.6rem] tracking-[0.14em] text-[#3b4249] outline-none placeholder:text-[#3b4249]`}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "auth-card flex flex-col gap-2 rounded-none px-4 py-3 shadow-[8px_8px_0px_#000]",
        className,
      )}
    >
      <span
        className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.35em] text-amber-700`}
      >
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`${pressStart.className} text-[0.7rem] uppercase tracking-[0.2em] text-zinc-800`}
        >
          {value}
        </span>
        {meta ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
            <span>{meta}</span>
            {metaIcon === "trophy" ? (
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 2h12v2h3v3a5 5 0 0 1-5 5h-1.1a6 6 0 0 1-4.9 2.9V18h4v2H8v-2h4v-3.1A6 6 0 0 1 7.1 12H6a5 5 0 0 1-5-5V4h3V2Zm-2 4v1a3 3 0 0 0 3 3h.4A8 8 0 0 1 6 6H4Zm16 0h-2a8 8 0 0 1-1.4 4H17a3 3 0 0 0 3-3V6Z" />
              </svg>
            ) : null}
            {metaIcon === "bolt" ? (
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
              </svg>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
