import { apiClient } from "./client";
import { ResellerFormData, ResellerResponse } from "./types";

export async function createReseller(
  payload: ResellerFormData
): Promise<ResellerResponse> {
  const formData = new FormData();

  console.log(payload)
  // 1. DTO envoyé sous forme de Blob application/json pour @RequestPart("request")
  const requestDto = {
    userId: payload.userId,
    companyName: payload.companyName,
    registrationNumber: payload.registrationNumber,
    contactName: payload.contactName,
    email: payload.email,
    phone: payload.phone,
    city: payload.city,
    country: payload.country,
    description: payload.description,
  };

  formData.append(
    "request",
    new Blob([JSON.stringify(requestDto)], { type: "application/json" })
  );

  // 2. Fichier envoyé séparément pour @RequestPart("logo")
  if (payload.logo) {
    formData.append("logo", payload.logo);
  }
  console.log(formData)

  // 3. Envoi vers l'endpoint Spring Boot
  const { data } = await apiClient.post<ResellerResponse>(
    `/api/resellers/register-with-logo`,
    formData
  );

  return data;
}