import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from './app.module';
import { IncidentSeverity } from './incidents/incident-severity.enum';
import { IncidentStatus } from './incidents/incident-status.enum';
import { Incident, IncidentDocument } from './incidents/schemas/incident.schema';
import { UserDocument } from './users/schemas/user.schema';
import { UserRole } from './users/user-role.enum';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const usersService = app.get(UsersService);
    const incidentModel = app.get<Model<IncidentDocument>>(
      getModelToken(Incident.name),
    );

    const seedUsers = [
      {
        name: 'Ava Analyst',
        email: 'analyst@sentinelops.dev',
        password: configService.getOrThrow<string>('SEED_ANALYST_PASSWORD'),
        role: UserRole.Analyst,
      },
      {
        name: 'Morgan Manager',
        email: 'manager@sentinelops.dev',
        password: configService.getOrThrow<string>('SEED_MANAGER_PASSWORD'),
        role: UserRole.Manager,
      },
    ];

    const usersByRole: Partial<Record<UserRole, UserDocument>> = {};

    for (const userData of seedUsers) {
      let user = await usersService.findByEmail(userData.email);
      if (user) {
        console.log(`Skipped existing user: ${userData.email}`);
      } else {
        user = await usersService.createUser(userData);
        console.log(`Created user: ${userData.email}`);
      }

      usersByRole[userData.role] = user;
    }

    const analyst = usersByRole[UserRole.Analyst];
    const manager = usersByRole[UserRole.Manager];

    if (!analyst || !manager) {
      throw new Error('Seed users were not created or loaded correctly');
    }

    const userId = (user: UserDocument) =>
      new Types.ObjectId(user._id.toString());

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);

    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);

    const seedIncidents = [
      {
        title: 'Phishing email reported by finance',
        description:
          'A finance team member reported a suspicious invoice email with a credential harvesting link.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Open,
        assignedTo: userId(analyst),
        createdBy: userId(manager),
        createdAt: fiveDaysAgo,
      },
      {
        title: 'Suspicious PowerShell activity on workstation',
        description:
          'Endpoint monitoring detected encoded PowerShell execution on an analyst workstation.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        assignedTo: userId(analyst),
        createdBy: userId(analyst),
        createdAt: threeDaysAgo,
      },
      {
        title: 'Critical ransomware alert on file server',
        description:
          'File integrity monitoring detected rapid encryption-like changes on a shared file server.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Resolved,
        assignedTo: userId(manager),
        createdBy: userId(analyst),
        createdAt: threeDaysAgo,
        resolvedAt: yesterday,
      },
      {
        title: 'Unusual VPN login from foreign IP',
        description:
          'Authentication logs show a successful VPN login from a country not seen before for this user.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Closed,
        assignedTo: userId(manager),
        createdBy: userId(manager),
        createdAt: fiveDaysAgo,
        resolvedAt: threeDaysAgo,
      },
      {
        title: 'Malware quarantine event on endpoint',
        description:
          'Antivirus quarantined a suspicious executable downloaded from a browser session.',
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Open,
        assignedTo: userId(analyst),
        createdBy: userId(manager),
        createdAt: now,
      },
    ];

    for (const incidentData of seedIncidents) {
      const existingIncident = await incidentModel
        .findOne({ title: incidentData.title })
        .exec();

      if (existingIncident) {
        console.log(`Skipped existing incident: ${incidentData.title}`);
        continue;
      }

      const timeline = [
        {
          action: 'created',
          by: incidentData.createdBy,
          at: incidentData.createdAt,
        },
      ];

      if (incidentData.status !== IncidentStatus.Open) {
        timeline.push({
          action: 'status_changed',
          by: incidentData.assignedTo,
          at: incidentData.resolvedAt ?? now,
        });
      }

      await incidentModel.create({
        ...incidentData,
        timeline,
      });

      console.log(`Created incident: ${incidentData.title}`);
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
