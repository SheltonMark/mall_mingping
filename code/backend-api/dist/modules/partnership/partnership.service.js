"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnershipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let PartnershipService = class PartnershipService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPartnershipDto) {
        return this.prisma.partnershipApplication.create({
            data: createPartnershipDto,
        });
    }
    async findAll(query) {
        const { status, search, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { company: { contains: search } },
                { email: { contains: search } },
            ];
        }
        const [applications, total] = await Promise.all([
            this.prisma.partnershipApplication.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.partnershipApplication.count({ where }),
        ]);
        return {
            data: applications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const application = await this.prisma.partnershipApplication.findUnique({
            where: { id },
        });
        if (!application) {
            throw new common_1.NotFoundException('Partnership application not found');
        }
        return application;
    }
    async update(id, updatePartnershipDto) {
        const application = await this.prisma.partnershipApplication.findUnique({
            where: { id },
        });
        if (!application) {
            throw new common_1.NotFoundException('Partnership application not found');
        }
        return this.prisma.partnershipApplication.update({
            where: { id },
            data: updatePartnershipDto,
        });
    }
    async remove(id) {
        const application = await this.prisma.partnershipApplication.findUnique({
            where: { id },
        });
        if (!application) {
            throw new common_1.NotFoundException('Partnership application not found');
        }
        return this.prisma.partnershipApplication.delete({
            where: { id },
        });
    }
    async getStatistics() {
        const [total, pending, contacted, partnered, rejected] = await Promise.all([
            this.prisma.partnershipApplication.count(),
            this.prisma.partnershipApplication.count({ where: { status: 'PENDING' } }),
            this.prisma.partnershipApplication.count({ where: { status: 'CONTACTED' } }),
            this.prisma.partnershipApplication.count({ where: { status: 'PARTNERED' } }),
            this.prisma.partnershipApplication.count({ where: { status: 'REJECTED' } }),
        ]);
        return {
            total,
            pending,
            contacted,
            partnered,
            rejected,
        };
    }
};
exports.PartnershipService = PartnershipService;
exports.PartnershipService = PartnershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartnershipService);
//# sourceMappingURL=partnership.service.js.map