import { getCookie } from "cookies-next";

export async function api(url: string, options: any = {}) {
  const token = getCookie("token");

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
