import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EvidenceType } from '../evidence-type.enum';
import { Incident } from 'src/incidents/schemas/incident.schema';
import { User } from 'src/users/schemas/user.schema';

export type EvidenceDocument = HydratedDocument<Evidence>;

@Schema({
    collection: 'evidence',
    timestamps: true,
})
export class Evidence {

    @Prop({ type: Types.ObjectId, ref: Incident.name , required: true })
    incidentId: Types.ObjectId;

    @Prop({ required: true, type: String, enum: EvidenceType })
    type: EvidenceType;

    @Prop({required: true})
    filePath: string;

    @Prop({ required: true, trim: true })
    originalName: string;

    @Prop({ required: true, trim: true })
    mimeType: string;

    @Prop({ required: true, min: 0 })
    size: number;

    @Prop({ trim: true })
    note?: string;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    uploadedBy: Types.ObjectId;

    @Prop({ required: true, default: Date.now })
    uploadedAt: Date;
}

export const EvidenceSchema = SchemaFactory.createForClass(Evidence);
