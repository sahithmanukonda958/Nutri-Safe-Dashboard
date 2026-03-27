import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValue(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null) return "--";
  return value.toFixed(decimals);
}
