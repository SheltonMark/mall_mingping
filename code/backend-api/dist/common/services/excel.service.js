"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
let ExcelService = class ExcelService {
    async parseExcelFile(buffer) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                throw new common_1.BadRequestException('Excel file is empty');
            }
            const data = [];
            const headers = [];
            worksheet.getRow(1).eachCell((cell, colNumber) => {
                headers[colNumber - 1] = cell.value?.toString() || `column_${colNumber}`;
            });
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1)
                    return;
                const rowData = {};
                row.eachCell((cell, colNumber) => {
                    const header = headers[colNumber - 1];
                    rowData[header] = cell.value;
                });
                data.push(rowData);
            });
            return data;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to parse Excel file: ${error.message}`);
        }
    }
    async createExcelFile(data, columns, sheetName = 'Sheet1') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.columns = columns;
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        data.forEach((item) => {
            worksheet.addRow(item);
        });
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
        return await workbook.xlsx.writeBuffer();
    }
    async streamExcelToResponse(res, data, columns, filename, sheetName = 'Sheet1') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.columns = columns;
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        data.forEach((item) => {
            worksheet.addRow(item);
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async createTemplateFile(columns, filename) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template');
        worksheet.columns = columns.map((col) => ({
            header: col.header,
            key: col.key,
            width: col.width || 15,
        }));
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        if (columns.some((col) => col.example)) {
            const exampleRow = {};
            columns.forEach((col) => {
                if (col.example) {
                    exampleRow[col.key] = col.example;
                }
            });
            worksheet.addRow(exampleRow);
            worksheet.getRow(2).font = { italic: true, color: { argb: 'FF999999' } };
        }
        return await workbook.xlsx.writeBuffer();
    }
    validateExcelData(data, requiredFields) {
        const errors = [];
        if (!data || data.length === 0) {
            errors.push('Excel file contains no data');
            return { valid: false, errors };
        }
        const firstRow = data[0];
        const availableFields = Object.keys(firstRow);
        requiredFields.forEach((field) => {
            if (!availableFields.includes(field)) {
                errors.push(`Missing required field: ${field}`);
            }
        });
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
};
exports.ExcelService = ExcelService;
exports.ExcelService = ExcelService = __decorate([
    (0, common_1.Injectable)()
], ExcelService);
//# sourceMappingURL=excel.service.js.map