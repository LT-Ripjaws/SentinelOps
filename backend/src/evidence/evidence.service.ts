import type {} from 'multer';
import { BadRequestException, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { Evidence, EvidenceDocument } from './schemas/evidence.schema';
import { IncidentsService } from '../incidents/incidents.service';

@Injectable()
export class EvidenceService {
    constructor(@InjectModel(Evidence.name) private readonly evidenceModel: Model<EvidenceDocument>,
    private readonly incidentsService: IncidentsService){
        
    }

    private toObjectId(id: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException("Invalid MongoDB id");
        }

        return new Types.ObjectId(id);
    }

    async create(incidentId: string, file: Express.Multer.File, dto: CreateEvidenceDto, uploadedBy: string)
    {   
        if(!file){
            throw new BadRequestException("Evidence file is required")
        }

        await this.incidentsService.findOne(incidentId) // checking if the incident exists, it already throws an exception

        return this.evidenceModel.create({
            incidentId: this.toObjectId(incidentId),
            type: dto.type,
            note: dto.note,
            filePath: file.path,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            uploadedBy: this.toObjectId(uploadedBy),
            uploadedAt: new Date()
        })
    }

    async findByIncident(incidentId: string){
        const Id = this.toObjectId(incidentId);
        return this.evidenceModel.find({incidentId: Id}).sort({ uploadedAt: -1 })
        .populate('uploadedBy', 'name email role').exec();
    }
}
