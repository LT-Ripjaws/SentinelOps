import { Module } from "@nestjs/common";
import { Evidence, EvidenceSchema } from "./schemas/evidence.schema";
import { MongooseModule } from '@nestjs/mongoose';


@Module({
    imports: [MongooseModule.forFeature([{ name: Evidence.name, schema: EvidenceSchema }])],
})

export class EvidenceModule {}