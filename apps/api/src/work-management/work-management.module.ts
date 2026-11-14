import { Module } from '@nestjs/common';
import { WorkManagementController } from './work-management.controller';
import { WorkManagementService } from './work-management.service';
import { WorkCollabService } from './work-collab.service';
import { WorkInsightsService } from './work-insights.service';
import { WorkManagementSchemaService } from './work-management-schema.service';

@Module({
  controllers: [WorkManagementController],
  providers: [
    WorkManagementService,
    WorkCollabService,
    WorkInsightsService,
    WorkManagementSchemaService,
  ],
  exports: [WorkManagementService, WorkCollabService, WorkInsightsService],
})
export class WorkManagementModule {}
