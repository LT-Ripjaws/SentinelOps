import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Incident, IncidentSchema } from '../incidents/schemas/incident.schema';

@Module({
  imports:[ MongooseModule.forFeature([{name: Incident.name, schema: IncidentSchema}]) ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
