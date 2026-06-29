import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiSecurity('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get dashboard incident analytics' })
  @ApiOkResponse({
    description: 'Returns totals, grouped counts, monthly trend, and average resolution time',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
  })
  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

}
