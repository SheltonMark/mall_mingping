import { PrismaService } from '../../prisma.service';
import { CreatePartnershipDto, UpdatePartnershipDto } from './dto/partnership.dto';
export declare class PartnershipService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPartnershipDto: CreatePartnershipDto): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        company: string | null;
        message: string | null;
        notes: string | null;
    }>;
    findAll(query?: {
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            status: import("@prisma/client").$Enums.PartnershipStatus;
            company: string | null;
            message: string | null;
            notes: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        company: string | null;
        message: string | null;
        notes: string | null;
    }>;
    update(id: string, updatePartnershipDto: UpdatePartnershipDto): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        company: string | null;
        message: string | null;
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.PartnershipStatus;
        company: string | null;
        message: string | null;
        notes: string | null;
    }>;
    getStatistics(): Promise<{
        total: number;
        pending: number;
        contacted: number;
        partnered: number;
        rejected: number;
    }>;
}
