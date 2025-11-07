import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOrderFormDto } from './dto/order-form.dto';

@Injectable()
export class OrderFormService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique form number
   * Format: OF-YYYYMMDD-XXXX
   */
  private async generateFormNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `OF-${year}${month}${day}`;

    // Get today's count
    const count = await this.prisma.orderForm.count({
      where: {
        formNumber: {
          startsWith: datePrefix,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `${datePrefix}-${sequence}`;
  }

  /**
   * Submit order form (inquiry)
   */
  async create(customerId: string, createDto: CreateOrderFormDto) {
    const { contactName, phone, email, address, notes, items, totalAmount } = createDto;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Generate form number
    const formNumber = await this.generateFormNumber();

    // Create order form
    const orderForm = await this.prisma.orderForm.create({
      data: {
        formNumber,
        customerId,
        contactName,
        phone,
        email,
        address,
        notes,
        items: JSON.stringify(items),
        totalAmount,
        status: 'submitted',
        submittedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            contactPerson: true,
          },
        },
      },
    });

    // Parse items back to JSON for response
    return {
      ...orderForm,
      items: JSON.parse(orderForm.items as string),
    };
  }

  /**
   * Get all order forms for a customer
   */
  async findAllByCustomer(customerId: string) {
    const orderForms = await this.prisma.orderForm.findMany({
      where: {
        customerId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Parse items JSON for each form
    return orderForms.map((form) => ({
      ...form,
      items: JSON.parse(form.items as string),
    }));
  }

  /**
   * Get single order form by ID
   */
  async findOne(id: string, customerId: string) {
    const orderForm = await this.prisma.orderForm.findFirst({
      where: {
        id,
        customerId, // Ensure customer can only view their own forms
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            contactPerson: true,
          },
        },
      },
    });

    if (!orderForm) {
      throw new NotFoundException('Order form not found');
    }

    // Parse items JSON
    return {
      ...orderForm,
      items: JSON.parse(orderForm.items as string),
    };
  }

  /**
   * Get all order forms (for admin - not used in external site)
   */
  async findAll() {
    const orderForms = await this.prisma.orderForm.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            contactPerson: true,
          },
        },
      },
    });

    return orderForms.map((form) => ({
      ...form,
      items: JSON.parse(form.items as string),
    }));
  }

  /**
   * Get order form statistics for a customer
   */
  async getStats(customerId: string) {
    const totalForms = await this.prisma.orderForm.count({
      where: { customerId },
    });

    const recentForm = await this.prisma.orderForm.findFirst({
      where: { customerId },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      totalForms,
      recentForm: recentForm
        ? {
            ...recentForm,
            items: JSON.parse(recentForm.items as string),
          }
        : null,
    };
  }
}
