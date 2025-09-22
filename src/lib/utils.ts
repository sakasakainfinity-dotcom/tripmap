import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatVisitedDate = (date: string | null) => {
  if (!date) return "日付未設定";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(
    new Date(date)
  );
};
