import { apiClient } from "./client";

export async function subscribeNewsletter(email: string, source: string) {
  await apiClient.post("/api/newsletter/subscribe", { email, source });
}
