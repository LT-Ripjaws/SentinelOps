import { Body, Get, Controller, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { EvidenceService } from './evidence.service';
import type {} from 'multer';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiSecurity,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger'



type AuthenticatedReq = Request & {user: JwtPayload};

@UseGuards(JwtAuthGuard, CsrfGuard)
@ApiTags('evidence')
@ApiSecurity('accessToken')
@Controller('incidents/:incidentId/evidence')
export class EvidenceController {
    constructor(private readonly evidenceService: EvidenceService) {

    }

    @ApiOperation({ summary: 'Upload evidence for an incident' })
    @ApiSecurity('csrfToken')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                },
                type: {
                    type: 'string',
                    example: 'screenshot'
                },
                note: {
                    type: 'string',
                    example: 'Screenshot of suspicious login alert'
                }
            },
            required: ['file', 'type']
        }
    })
    @ApiCreatedResponse({
        description: 'Evidence uploaded and metadata saved successfully',
    })
    @ApiBadRequestResponse({
        description: 'Missing file, invalid incident ID, or invalid evidence payload',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
    })
    @ApiForbiddenResponse({
        description: 'Missing, mismatched, or invalid CSRF token',
    })
    @Post()
    @UseInterceptors(FileInterceptor('file', {dest: './uploads'}))
    create(@Param('incidentId') incidentId: string, @UploadedFile() file: Express.Multer.File,
            @Body() dto: CreateEvidenceDto, @Req() req: AuthenticatedReq)
            {
                return this.evidenceService.create(incidentId, file, dto, req.user.sub)
            }

    @ApiOperation({ summary: 'List evidence for an incident' })
    @ApiOkResponse({
        description: 'Returns evidence metadata for the incident',
    })
    @ApiBadRequestResponse({
        description: 'Invalid incident ID',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
    })
    @Get()
    findByIncident(@Param('incidentId') incidentId: string){
        return this.evidenceService.findByIncident(incidentId);
    }
}
