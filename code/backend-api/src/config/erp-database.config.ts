/**
 * ERP 数据库配置 (SQL Server)
 * 用于连接 ERP 系统 DB_MP01 数据库
 */
export interface ErpDatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    enableArithAbort: boolean;
    useUTC: boolean;
  };
}

export const getErpDatabaseConfig = (): ErpDatabaseConfig => ({
  host: process.env.ERP_DB_HOST || 'MSSQL',
  port: parseInt(process.env.ERP_DB_PORT || '1433', 10),
  user: process.env.ERP_DB_USER || 'sa',
  password: process.env.ERP_DB_PASSWORD || '1q!',
  database: process.env.ERP_DB_NAME || 'DB_MP01',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    useUTC: false,
  },
});

// ERP 同步配置
export interface ErpSyncConfig {
  enabled: boolean;
  defaultWarehouse: string;
  defaultSendMethod: string;
  taxRate: number;
}

export const getErpSyncConfig = (): ErpSyncConfig => ({
  enabled: process.env.ERP_SYNC_ENABLED === 'true',
  defaultWarehouse: process.env.ERP_DEFAULT_WAREHOUSE || '01',
  defaultSendMethod: process.env.ERP_DEFAULT_SEND_METHOD || '1',
  taxRate: parseFloat(process.env.ERP_TAX_RATE || '0.13'),
});
