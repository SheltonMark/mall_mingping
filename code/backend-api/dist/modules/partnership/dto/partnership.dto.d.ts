export declare enum PartnershipStatus {
    PENDING = "PENDING",
    CONTACTED = "CONTACTED",
    PARTNERED = "PARTNERED",
    REJECTED = "REJECTED"
}
export declare class CreatePartnershipDto {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    message?: string;
}
export declare class UpdatePartnershipDto {
    status?: PartnershipStatus;
    notes?: string;
}
