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


type AuthenticatedRequest = Request & {user: JwtPayload}

@UseGuards(JwtAuthGuard, CsrfGuard)
@Controller('incidents')
export class IncidentsController {

    constructor(private readonly incidentsService: IncidentsService) {}

    @Post()
    create(@Body() dto: CreateIncidentDto, @Req() req: AuthenticatedRequest){
        return this.incidentsService.create(dto, req.user.sub)
    }

    @Get()
    findAll(@Query() query: FindIncidentsQueryDto){
        return this.incidentsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.incidentsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateIncidentDto, @Req() req: AuthenticatedRequest){
        return this.incidentsService.update(id, dto, req.user.sub)
    }

    @UseGuards(RolesGuard)
    @Roles(UserRole.Manager)
    @Delete(':id')
    remove(@Param('id') id:string ) {
        return this.incidentsService.remove(id);
    }

}
