import { Module } from "@nestjs/common";
import { Evidence, EvidenceSchema } from "./schemas/evidence.schema";
import { MongooseModule } from '@nestjs/mongoose';
import { EvidenceService } from './evidence.service';
import { EvidenceController } from './evidence.controller';
import { IncidentsModule } from '../incidents/incidents.module';


@Module({
    imports: [MongooseModule.forFeature([{ name: Evidence.name, schema: EvidenceSchema }]),
    IncidentsModule
],
    providers: [EvidenceService],
    controllers: [EvidenceController],
})

export class EvidenceModule {}