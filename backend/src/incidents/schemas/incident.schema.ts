import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, Schema as MongooseSchema } from "mongoose";
import { User } from '../../users/schemas/user.schema';
import { IncidentStatus } from "../incident-status.enum";
import { IncidentSeverity } from "../incident-severity.enum";



export type IncidentDocument = HydratedDocument<Incident>;

@Schema({
    _id: false
})
export class TimelineEvent {
    @Prop({ required: true, trim: true })
    action: string;

    @Prop({ trim: true })
    field?: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    oldValue?: unknown;

    @Prop({ type: MongooseSchema.Types.Mixed })
    newValue?: unknown;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    by: Types.ObjectId;

    @Prop({ required: true, default: Date.now })
    at: Date;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);

@Schema({
    collection: 'incidents',
    timestamps: true,
})
export class Incident {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required:true, trim: true })
    description: string;

    @Prop({ required: true, enum: IncidentSeverity , default: IncidentSeverity.Low})
    severity: IncidentSeverity;

    @Prop({ required: true, enum: IncidentStatus, default: IncidentStatus.Open })
    status: IncidentStatus;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    assignedTo: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    createdBy: Types.ObjectId;

    @Prop()
    resolvedAt?: Date;

    @Prop({ type: [TimelineEventSchema], default: [] })
    timeline: TimelineEvent[];
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);