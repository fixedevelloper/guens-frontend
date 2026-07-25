export type PartnerType = "AIRLINE" | "HOTEL" | "CAR_RENTAL" | "FURNISHED_RENTAL";
export type PartnerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface PartnerRegistrationRequest {
    partnerType: PartnerType;
    companyName: string;
    registrationNumber: string;
    contactName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    fleetOrRoomsCount?: string;
    description?: string;
}

export interface PartnerResponse {
    id: string;
    partnerType: PartnerType;
    companyName: string;
    registrationNumber: string;
    contactName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    fleetOrRoomsCount?: string;
    description?: string;
    status: PartnerStatus;
    createdAt: string;
}

export interface SpringPage<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}