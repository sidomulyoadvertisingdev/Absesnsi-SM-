import { apiFetch } from "./api";

export function sendAttendance(payload) {
  return apiFetch("/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAttendanceHistory() {
  return apiFetch("/attendance/history", {
    method: "GET",
  });
}

export function getWorkSchedule() {
  return apiFetch("/me/work-schedule", {
    method: "GET",
  });
}
