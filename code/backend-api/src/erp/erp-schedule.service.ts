import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ErpProductSyncService } from './erp-product-sync.service';

@Injectable()
export class ErpScheduleService {
  private readonly logger = new Logger(ErpScheduleService.name);

  constructor(
    private readonly erpProductSyncService: ErpProductSyncService,
  ) {}

  /**
   * 每天凌晨 00:00 执行产品增量同步
   * 只同步最近1天更新的产品
   */
  @Cron('0 0 0 * * *', {
    name: 'erp-product-daily-sync',
    timeZone: 'Asia/Shanghai',
  })
  async handleDailyProductSync() {
    this.logger.log('[定时任务] 开始每日产品增量同步...');

    try {
      const result = await this.erpProductSyncService.syncAndRecord(true, 1);

      if (result.success) {
        this.logger.log(
          `[定时任务] 每日产品同步完成: 产品组 新增${result.groupsCreated}/更新${result.groupsUpdated}, ` +
          `SKU 新增${result.skusCreated}/更新${result.skusUpdated}, 耗时${result.duration}ms`
        );
      } else {
        this.logger.error(`[定时任务] 每日产品同步失败: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(
        `[定时任务] 每日产品同步异常: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * 可选：每周日凌晨 02:00 执行全量同步
   * 确保数据完整性
   */
  // @Cron('0 0 2 * * 0', {
  //   name: 'erp-product-weekly-full-sync',
  //   timeZone: 'Asia/Shanghai',
  // })
  // async handleWeeklyFullSync() {
  //   this.logger.log('[定时任务] 开始每周全量产品同步...');
  //
  //   try {
  //     const result = await this.erpProductSyncService.syncAndRecord(false);
  //
  //     if (result.success) {
  //       this.logger.log(
  //         `[定时任务] 每周全量同步完成: 产品组 新增${result.groupsCreated}/更新${result.groupsUpdated}, ` +
  //         `SKU 新增${result.skusCreated}/更新${result.skusUpdated}, 耗时${result.duration}ms`
  //       );
  //     } else {
  //       this.logger.error(`[定时任务] 每周全量同步失败: ${result.error}`);
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `[定时任务] 每周全量同步异常: ${error instanceof Error ? error.message : error}`
  //     );
  //   }
  // }
}
