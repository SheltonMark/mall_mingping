import { PartnershipService } from './partnership.service';
import { CreatePartnershipDto, UpdatePartnershipDto } from './dto/partnership.dto';
export declare class PartnershipController {
    private readonly partnershipService;
    constructor(partnershipService: PartnershipService);
    create(createPartnershipDto: CreatePartnershipDto): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        message: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        notes: string | null;
        company: string | null;
    }>;
    findAll(status?: string, search?: string, page?: string, limit?: string): Promise<{
        data: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            message: string | null;
            phone: string | null;
            status: import("@prisma/client").$Enums.PartnershipStatus;
            notes: string | null;
            company: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStatistics(): Promise<{
        total: number;
        pending: number;
        contacted: number;
        partnered: number;
        rejected: number;
    }>;
    findOne(id: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        message: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        notes: string | null;
        company: string | null;
    }>;
    update(id: string, updatePartnershipDto: UpdatePartnershipDto): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        message: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        notes: string | null;
        company: string | null;
    }>;
    remove(id: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        message: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        notes: string | null;
        company: string | null;
    }>;
}
