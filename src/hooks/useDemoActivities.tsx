import { useSyncExternalStore } from "react";
import {
  DEMO_INITIAL_ACTIVITIES,
  type DemoActivity,
  type DemoActivityResponse,
} from "@/data/demoData";

const STORAGE_KEY = "bookquest_demo_activities";

const listeners = new Set<() => void>();
let activities: DemoActivity[] = load();

function load(): DemoActivity[] {
  if (typeof window === "undefined") return [...DEMO_INITIAL_ACTIVITIES];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEMO_INITIAL_ACTIVITIES];
    const parsed = JSON.parse(raw) as DemoActivity[];
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEMO_INITIAL_ACTIVITIES];
  } catch {
    return [...DEMO_INITIAL_ACTIVITIES];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch {
    // noop
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const demoActivitiesStore = {
  list(): DemoActivity[] {
    return activities;
  },
  get(id: string): DemoActivity | undefined {
    return activities.find((a) => a.id === id);
  },
  create(input: Omit<DemoActivity, "id" | "createdAt" | "responses">) {
    const newActivity: DemoActivity = {
      ...input,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
      responses: [],
    };
    activities = [newActivity, ...activities];
    persist();
    emit();
    return newActivity;
  },
  update(id: string, patch: Partial<DemoActivity>) {
    activities = activities.map((a) => (a.id === id ? { ...a, ...patch } : a));
    persist();
    emit();
  },
  remove(id: string) {
    activities = activities.filter((a) => a.id !== id);
    persist();
    emit();
  },
  toggleClosed(id: string) {
    activities = activities.map((a) =>
      a.id === id ? { ...a, closedManually: !a.closedManually } : a,
    );
    persist();
    emit();
  },
  markReviewed(activityId: string, studentId: string, feedback?: string) {
    activities = activities.map((a) => {
      if (a.id !== activityId) return a;
      return {
        ...a,
        responses: a.responses.map((r) =>
          r.studentId === studentId ? { ...r, reviewed: true, feedback } : r,
        ),
      };
    });
    persist();
    emit();
  },
  addResponse(activityId: string, response: DemoActivityResponse) {
    activities = activities.map((a) => {
      if (a.id !== activityId) return a;
      const existing = a.responses.findIndex((r) => r.studentId === response.studentId);
      if (existing >= 0) {
        const next = [...a.responses];
        next[existing] = response;
        return { ...a, responses: next };
      }
      return { ...a, responses: [...a.responses, response] };
    });
    persist();
    emit();
  },
  reset() {
    activities = [...DEMO_INITIAL_ACTIVITIES];
    persist();
    emit();
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return activities;
}

export function useDemoActivities() {
  return useSyncExternalStore(subscribe, getSnapshot, () => activities);
}

export function isActivityClosed(a: DemoActivity): boolean {
  if (a.closedManually) return true;
  if (!a.deadline) return false;
  return new Date(a.deadline).getTime() < Date.now();
}

export function activityStatusLabel(a: DemoActivity): "active" | "closed" | "no_deadline" {
  if (isActivityClosed(a)) return "closed";
  if (!a.deadline) return "no_deadline";
  return "active";
}
