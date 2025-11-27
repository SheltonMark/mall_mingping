import * as sql from 'mssql';

const config: sql.config = {
  server: 'MSSQL',
  port: 1433,
  user: 'sa',
  password: '1q!',
  database: 'DB_MP01',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  }
};

async function queryErpOrder() {
  try {
    console.log('正在连接 ERP 数据库...\n');
    await sql.connect(config);
    console.log('✅ 连接成功！\n');

    // 查询订单主表 MF_POS
    console.log('='.repeat(80));
    console.log('📋 订单主表 (MF_POS) - 最新1条订单 SO202511051');
    console.log('='.repeat(80));
    const posResult = await sql.query`
      SELECT TOP 1 *
      FROM MF_POS
      WHERE OS_ID='SO' AND OS_NO='SO202511051'
      ORDER BY RECORD_DD DESC
    `;

    if (posResult.recordset.length > 0) {
      const record = posResult.recordset[0];
      console.log('订单号:', record.OS_NO);
      console.log('订单日期:', record.OS_DD);
      console.log('客户编号:', record.CUS_NO);
      console.log('业务员:', record.SAL_NO);
      console.log('含税金额:', record.AMTN_INT);
      console.log('备注:', record.RMK);

      // 打印所有非空字段
      console.log('\n所有非空字段:');
      for (const [key, value] of Object.entries(record)) {
        if (value !== null && value !== '' && value !== undefined) {
          console.log(`  ${key}:`, value);
        }
      }
    }

    // 查询订单明细表 TF_POS
    console.log('\n' + '='.repeat(80));
    console.log('📦 订单明细表 (TF_POS) - SO202511051 的明细');
    console.log('='.repeat(80));
    const tfPosResult = await sql.query`
      SELECT TOP 1 *
      FROM TF_POS
      WHERE OS_ID='SO' AND OS_NO='SO202511051'
      ORDER BY RECORD_DD DESC
    `;

    if (tfPosResult.recordset.length > 0) {
      const record = tfPosResult.recordset[0];
      console.log('订单号:', record.OS_NO);
      console.log('品号:', record.PRD_NO);
      console.log('数量:', record.QTY);
      console.log('单价:', record.PRC);
      console.log('金额:', record.AMT);

      // 打印所有非空字段
      console.log('\n所有非空字段:');
      for (const [key, value] of Object.entries(record)) {
        if (value !== null && value !== '' && value !== undefined) {
          console.log(`  ${key}:`, value);
        }
      }
    }

    // 查询订单明细扩展表 TF_POS_Z (包含7个包装字段)
    console.log('\n' + '='.repeat(80));
    console.log('📦 订单明细扩展表 (TF_POS_Z) - SO202511051，包含7个包装字段');
    console.log('='.repeat(80));
    const tfPosZResult = await sql.query`
      SELECT TOP 1 *
      FROM TF_POS_Z
      WHERE OS_ID='SO' AND OS_NO='SO202511051'
      ORDER BY RECORD_DD DESC
    `;

    if (tfPosZResult.recordset.length > 0) {
      const record = tfPosZResult.recordset[0];
      console.log('订单号:', record.OS_NO);
      console.log('品号:', record.PRD_NO);
      console.log('\n📦 包装字段:');
      console.log('  箱规 (USR_FLD_01):', record.USR_FLD_01);
      console.log('  体积 (USR_FLD_02):', record.USR_FLD_02);
      console.log('  件数 (USR_FLD_03):', record.USR_FLD_03);
      console.log('  毛重 (USR_FLD_04):', record.USR_FLD_04);
      console.log('  净重 (USR_FLD_05):', record.USR_FLD_05);
      console.log('  装柜数 (USR_FLD_06):', record.USR_FLD_06);
      console.log('  发货方式 (USR_FLD_07):', record.USR_FLD_07);

      // 打印所有非空字段
      console.log('\n所有非空字段:');
      for (const [key, value] of Object.entries(record)) {
        if (value !== null && value !== '' && value !== undefined) {
          console.log(`  ${key}:`, value);
        }
      }
    }

    await sql.close();
    console.log('\n✅ 查询完成！');
  } catch (err) {
    console.error('❌ 错误:', err);
  }
}

queryErpOrder();
