import type {} from 'multer';
import { unlink } from 'fs/promises';
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

        // Multer has already written the upload to disk by the time we reach this point,
        // so any failure below (invalid/unknown incident, DB error) must remove the
        // orphaned file, otherwise repeated failed uploads would fill the disk.
        try {
            await this.incidentsService.findOne(incidentId) // checking if the incident exists, it already throws an exception

            return await this.evidenceModel.create({
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
        } catch (error) {
            await this.removeUploadedFile(file.path);
            throw error;
        }
    }

    private async removeUploadedFile(filePath: string): Promise<void> {
        try {
            await unlink(filePath);
        } catch {
            // best effort: the file may already be gone or never have been written
        }
    }

    async findByIncident(incidentId: string){
        const Id = this.toObjectId(incidentId);
        return this.evidenceModel.find({incidentId: Id}).sort({ uploadedAt: -1 })
        .populate('uploadedBy', 'name email role').exec();
    }
}
