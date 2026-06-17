import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentDocument, Incident } from "./schemas/incident.schema";
import { IncidentStatus } from './incident-status.enum';

@Injectable()
export class IncidentsService {
    constructor(@InjectModel(Incident.name) private readonly incidentModel: Model<IncidentDocument>){}

    private toObjectId(id: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(id)){
            throw new BadRequestException('Invalid incident id!');
        }

        return new Types.ObjectId(id);
    }

    async create(incidentDto: CreateIncidentDto, userId: string) {
        const incident = await this.incidentModel.create({
            title: incidentDto.title,
            description: incidentDto.description,
            severity: incidentDto.severity,
            assignedTo: this.toObjectId(incidentDto.assignedTo),
            createdBy: this.toObjectId(userId),
            timeline: [
                {
                    action: 'created',
                    by: this.toObjectId(userId),
                    at: new Date()
                } 
            ]
        })

        return incident;

    }

    async findAll() {
        return await this.incidentModel.find().sort({createdAt: -1}).populate('assignedTo', 'name email role').populate('createdBy', 'name email role').exec();
    }

    async findOne(id: string) {
        const incident = await this.incidentModel.findById(this.toObjectId(id))
        .populate('assignedTo', 'name email role').populate('createdBy', 'name email role').exec();

        if (!incident){
            throw new NotFoundException('Incident not found')
        }

        return incident;
    }

    async update(id: string, incidentDto: UpdateIncidentDto, userId: string) {
        const incidentId = this.toObjectId(id);
        const updatedBy = this.toObjectId(userId);
        const existingIncident = await this.incidentModel.findById(incidentId).exec();

        if (!existingIncident) {
            throw new NotFoundException('Incident not found');
        }

        const { assignedTo, ...rest } = incidentDto;

        const updateData: {
            title?: string;
            description?: string;
            severity?: Incident['severity'];
            status?: IncidentStatus;
            assignedTo?: Types.ObjectId;
            resolvedAt?: Date;
        } = {
            ...rest,
            ...(assignedTo && { assignedTo: this.toObjectId(assignedTo) }),
        };

        const unsetData: { resolvedAt?: '' } = {};
        const changedAt = new Date();
        const timelineEvents: Array<{
            action: string;
            field: string;
            oldValue: unknown;
            newValue: unknown;
            by: Types.ObjectId;
            at: Date;
        }> = [];

        const trackChange = (field: string, oldValue: unknown, newValue: unknown) => {
            if (oldValue === newValue) return;

            timelineEvents.push({
                action: 'updated',
                field,
                oldValue,
                newValue,
                by: updatedBy,
                at: changedAt,
            });
        };

        if (incidentDto.title !== undefined) {
            trackChange('title', existingIncident.title, incidentDto.title);
        }

        if (incidentDto.description !== undefined) {
            trackChange('description', existingIncident.description, incidentDto.description);
        }

        if (incidentDto.severity !== undefined) {
            trackChange('severity', existingIncident.severity, incidentDto.severity);
        }

        if (incidentDto.status !== undefined) {
            trackChange('status', existingIncident.status, incidentDto.status);

            const terminalStatuses = new Set([IncidentStatus.Resolved, IncidentStatus.Closed]);
            const shouldHaveResolvedAt = terminalStatuses.has(incidentDto.status);

            if (shouldHaveResolvedAt && !existingIncident.resolvedAt) {
                updateData.resolvedAt = changedAt;
                trackChange('resolvedAt', null, changedAt.toISOString());
            }

            if (!shouldHaveResolvedAt && existingIncident.resolvedAt) {
                unsetData.resolvedAt = '';
                trackChange('resolvedAt', existingIncident.resolvedAt.toISOString(), null);
            }
        }

        if (assignedTo !== undefined) {
            trackChange('assignedTo', existingIncident.assignedTo.toString(), assignedTo);
        }

        if (timelineEvents.length === 0) {
            return existingIncident;
        }

        const updateOperation: {
            $set?: typeof updateData;
            $unset?: typeof unsetData;
            $push?: { timeline: { $each: typeof timelineEvents } };
        } = {};

        if (Object.keys(updateData).length > 0) {
            updateOperation.$set = updateData;
        }

        if (Object.keys(unsetData).length > 0) {
            updateOperation.$unset = unsetData;
        }

        updateOperation.$push = { timeline: { $each: timelineEvents } };

        const incident = await this.incidentModel
            .findByIdAndUpdate(
                incidentId,
                updateOperation,
                { returnDocument: 'after', runValidators: true },
            )
            .exec();

        if (!incident) {
            throw new NotFoundException('Incident not found');
        }

        return incident;
    }

    async remove(id: string) {
        const incident = await this.incidentModel.findByIdAndDelete(this.toObjectId(id)).exec()

        if(!incident){
            throw new NotFoundException('Incident not found')
        }

        return {message: 'Incident deleted'}
    }
}
