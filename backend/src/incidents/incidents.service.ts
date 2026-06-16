import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentDocument, Incident } from "./schemas/incident.schema";

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

    async update(id: string, incidentDto: UpdateIncidentDto) {
        const { assignedTo, ...rest } = incidentDto;

        const updateData = {
            ...rest,
            ...(assignedTo && { assignedTo: this.toObjectId(assignedTo) }),
        };

        const incident = await this.incidentModel
            .findByIdAndUpdate(
                this.toObjectId(id),
                { $set: updateData },
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
