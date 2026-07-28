import { apiClient } from "./client";

/** Miroir de UserImageResponse (backend) - GET/POST /api/images, DELETE /api/images/{id}. */
export interface UserImageResponse {
  id: string;
  url: string;
  name: string;
  sizeBytes: number;
  createdAt: string;
}

export async function listMyImages(): Promise<UserImageResponse[]> {
  const { data } = await apiClient.get<UserImageResponse[]>("/api/images");
  return data;
}

export async function uploadImage(file: File): Promise<UserImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<UserImageResponse>("/api/images", formData);
  return data;
}

export async function deleteImage(imageId: string): Promise<void> {
  await apiClient.delete(`/api/images/${imageId}`);
}
