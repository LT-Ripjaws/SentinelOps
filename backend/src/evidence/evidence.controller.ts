import { Body, Get, Controller, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { EvidenceService } from './evidence.service';
import type {} from 'multer';



type AuthenticatedReq = Request & {user: JwtPayload};

@UseGuards(JwtAuthGuard, CsrfGuard)
@Controller('incidents/:incidentId/evidence')
export class EvidenceController {
    constructor(private readonly evidenceService: EvidenceService) {

    }

    @Post()
    @UseInterceptors(FileInterceptor('file', {dest: './uploads'}))
    create(@Param('incidentId') incidentId: string, @UploadedFile() file: Express.Multer.File,
            @Body() dto: CreateEvidenceDto, @Req() req: AuthenticatedReq)
            {
                return this.evidenceService.create(incidentId, file, dto, req.user.sub)
            }

    @Get()
    findByIncident(@Param('incidentId') incidentId: string){
        return this.evidenceService.findByIncident(incidentId);
    }
}
