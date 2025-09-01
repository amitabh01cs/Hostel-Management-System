import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function truncateText(text: string, length: number): string {
  if (!text) return "";
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (["active", "success", "approved", "available", "resolved", "present"].includes(statusLower)) {
    return "status-badge-success";
  }
  if (["pending", "in progress", "partial", "partially occupied"].includes(statusLower)) {
    return "status-badge-warning";
  }
  if (["inactive", "failed", "rejected", "unavailable", "full", "occupied", "absent", "closed"].includes(statusLower)) {
    return "status-badge-error";
  }
  if (["new", "open"].includes(statusLower)) {
    return "status-badge-info";
  }
  return "status-badge-neutral";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
