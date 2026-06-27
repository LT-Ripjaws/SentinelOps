import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { IncidentsModule } from './incidents/incidents.module';
import { EvidenceModule } from './evidence/evidence.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          throw new Error('MONGODB_URI is not set');
        }

        return {
          uri,
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60_000,
      limit: 100
    }]),
    UsersModule,
    IncidentsModule,
    EvidenceModule,
    AuthModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
