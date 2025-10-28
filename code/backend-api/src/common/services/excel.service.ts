import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExcelService {
  // Parse Excel file and return data
  async parseExcelFile(buffer: Buffer): Promise<any[]> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new BadRequestException('Excel file is empty');
      }

      const data: any[] = [];
      const headers: string[] = [];

      // Get headers from first row
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString() || `column_${colNumber}`;
      });

      // Get data from remaining rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          rowData[header] = cell.value;
        });

        data.push(rowData);
      });

      return data;
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse Excel file: ${error.message}`,
      );
    }
  }

  // Create Excel file from data
  async createExcelFile(
    data: any[],
    columns: Array<{ header: string; key: string; width?: number }>,
    sheetName = 'Sheet1',
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set columns
    worksheet.columns = columns;

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (!column.width) {
        let maxLength = 10;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 10;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      }
    });

    return await workbook.xlsx.writeBuffer() as any as Buffer;
  }

  // Stream Excel file to response
  async streamExcelToResponse(
    res: Response,
    data: any[],
    columns: Array<{ header: string; key: string; width?: number }>,
    filename: string,
    sheetName = 'Sheet1',
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns;

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  // Create template Excel file
  async createTemplateFile(
    columns: Array<{ header: string; key: string; width?: number; example?: string }>,
    filename: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    // Set columns
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Add example row if provided
    if (columns.some((col) => col.example)) {
      const exampleRow: any = {};
      columns.forEach((col) => {
        if (col.example) {
          exampleRow[col.key] = col.example;
        }
      });
      worksheet.addRow(exampleRow);

      // Style example row
      worksheet.getRow(2).font = { italic: true, color: { argb: 'FF999999' } };
    }

    return await workbook.xlsx.writeBuffer() as any as Buffer;
  }

  // Validate Excel data structure
  validateExcelData(
    data: any[],
    requiredFields: string[],
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || data.length === 0) {
      errors.push('Excel file contains no data');
      return { valid: false, errors };
    }

    // Check for required fields
    const firstRow = data[0];
    const availableFields = Object.keys(firstRow);

    requiredFields.forEach((field) => {
      if (!availableFields.includes(field)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate each row
    data.forEach((row, index) => {
      requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push(`Row ${index + 2}: Missing value for ${field}`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
