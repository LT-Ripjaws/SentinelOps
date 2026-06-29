import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, Query} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentsService } from './incidents.service';
import { UserRole } from '../users/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { FindIncidentsQueryDto } from './dto/find-incidentquery.dto';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiSecurity,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';


type AuthenticatedRequest = Request & {user: JwtPayload}

@UseGuards(JwtAuthGuard, CsrfGuard)
@ApiTags('incidents')
@ApiSecurity('accessToken')
@Controller('incidents')
export class IncidentsController {

    constructor(private readonly incidentsService: IncidentsService) {}
    
    @ApiOperation({ summary: 'Create a new incident' })
    @ApiSecurity('csrfToken')
    @ApiCreatedResponse({
        description: 'Incident created successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation failed or assigned analyst ID is invalid',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
    })
    @ApiForbiddenResponse({
        description: 'Missing, mismatched, or invalid CSRF token',
    })
    @Post()
    create(@Body() dto: CreateIncidentDto, @Req() req: AuthenticatedRequest){
        return this.incidentsService.create(dto, req.user.sub)
    }

    @ApiOperation({ summary: 'List incidents with search, filters, and pagination' })
    @ApiOkResponse({
        description: 'Returns paginated incidents with metadata',
    })
    @ApiBadRequestResponse({
        description: 'Invalid query parameter value',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
    })
    @Get()
    findAll(@Query() query: FindIncidentsQueryDto){
        return this.incidentsService.findAll(query);
    }

    @ApiOperation({ summary: 'Get one incident by ID' })
    @ApiOkResponse({
        description: 'Returns the matching incident',
    })
    @ApiBadRequestResponse({
        description: 'Invalid incident ID',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
    })
    @ApiNotFoundResponse({
        description: 'Incident not found',
    })
    @Get(':id')
    findOne(@Param('id') id: string){
        return this.incidentsService.findOne(id);
    }

    @ApiOperation({ summary: 'Update an incident and append timeline events' })
    @ApiSecurity('csrfToken')
    @ApiOkResponse({
        description: 'Incident updated successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation failed or incident/assigned analyst ID is invalid',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
    })
    @ApiForbiddenResponse({
        description: 'Missing, mismatched, or invalid CSRF token',
    })
    @ApiNotFoundResponse({
        description: 'Incident not found',
    })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateIncidentDto, @Req() req: AuthenticatedRequest){
        return this.incidentsService.update(id, dto, req.user.sub)
    }

    @UseGuards(RolesGuard)
    @Roles(UserRole.Manager)
    @ApiOperation({ summary: 'Delete an incident manager-only' })
    @ApiSecurity('csrfToken')
    @ApiOkResponse({
        description: 'Incident deleted successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid incident ID',
    })
    @ApiUnauthorizedResponse({
        description: 'Missing or invalid access token',
    })
    @ApiForbiddenResponse({
        description: 'User is not a manager, or CSRF token is invalid',
    })
    @ApiNotFoundResponse({
        description: 'Incident not found',
    })
    @Delete(':id')
    remove(@Param('id') id:string ) {
        return this.incidentsService.remove(id);
    }

}
