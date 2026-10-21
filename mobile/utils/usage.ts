import { ProjectBrief } from "../types";

export const FREE_MONTHLY_LIMIT = 3;

/** Number of generations + audio reads the user created in the current calendar month. */
export function countThisMonth(briefs: ProjectBrief[]): number {
  const now = new Date();
  return briefs.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
}
