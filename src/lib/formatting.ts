import type { CrosswordClue } from "./types";

export function formatDate(publicationDate: string): string {
  return new Date(publicationDate + "T00:00:00")
    .toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    .replace(/\b(\d{1,2})\b/, (match) => {
      const suffix = ["th", "st", "nd", "rd"];
      const day = parseInt(match, 10);
      const value = day % 100;
      return day + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
    });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function decodeFormatted(input: string): string {
  let s = input;
  try {
    s = JSON.parse(`"${s.replace(/"/g, '\\"')}"`);
  } catch {}

  const textarea = document.createElement("textarea");
  textarea.innerHTML = s;
  s = textarea.value;

  return s;
}

export function renderClue(clue: CrosswordClue): string {
  if (!clue) return "";
  return clue.text
    .map((part) => {
      if (part.formatted) {
        return decodeFormatted(part.formatted);
      } else {
        return part.plain;
      }
    })
    .join("");
}

function formatMonthStart(year: number, monthIndex: number) {
  return `${year}-${(monthIndex + 1).toString().padStart(2, "0")}-01`;
}

export function getMonthFilter(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = formatMonthStart(year, month);
  const end = month === 11 ? formatMonthStart(year + 1, 0) : formatMonthStart(year, month + 1);
  return `publication_date >= "${start}" && publication_date < "${end}"`;
}

export function getButtonText(state: string) {
  if (state === "completed") {
    return "Admire Puzzle";
  }
  if (state === "incomplete") {
    return "Continue Solving";
  }
  return "Start Solving";
}
