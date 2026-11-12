import { Module } from '@nestjs/common';
import { WorkManagementController } from './work-management.controller';
import { WorkManagementService } from './work-management.service';
import { WorkCollabService } from './work-collab.service';
import { WorkInsightsService } from './work-insights.service';

@Module({
  controllers: [WorkManagementController],
  providers: [WorkManagementService, WorkCollabService, WorkInsightsService],
  exports: [WorkManagementService, WorkCollabService, WorkInsightsService],
})
export class WorkManagementModule {}
