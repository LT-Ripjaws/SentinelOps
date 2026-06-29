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

type SeedIncidentTemplate = {
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  daysAgo: number;
  resolutionHours?: number;
};

type TimelineSeedEvent = {
  action: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  by: Types.ObjectId;
  at: Date;
};

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
    const terminalStatuses = new Set<IncidentStatus>([
      IncidentStatus.Resolved,
      IncidentStatus.Closed,
    ]);

    const daysAgo = (days: number) => {
      const date = new Date(now);
      date.setDate(now.getDate() - days);
      date.setHours(9 + (days % 8), (days * 7) % 60, 0, 0);
      return date;
    };

    const resolvedAfter = (createdAt: Date, hours: number) => {
      const resolvedAt = new Date(createdAt);
      resolvedAt.setHours(resolvedAt.getHours() + hours);
      return resolvedAt > now ? now : resolvedAt;
    };

    const incidentTemplates: SeedIncidentTemplate[] = [
      {
        title: 'Phishing email reported by finance',
        description:
          'A finance team member reported a suspicious invoice email with a credential harvesting link.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Open,
        daysAgo: 5,
      },
      {
        title: 'Suspicious PowerShell activity on workstation',
        description:
          'Endpoint monitoring detected encoded PowerShell execution on an analyst workstation.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 3,
      },
      {
        title: 'Critical ransomware alert on file server',
        description:
          'File integrity monitoring detected rapid encryption-like changes on a shared file server.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Resolved,
        daysAgo: 3,
        resolutionHours: 48,
      },
      {
        title: 'Unusual VPN login from foreign IP',
        description:
          'Authentication logs show a successful VPN login from a country not seen before for this user.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Closed,
        daysAgo: 5,
        resolutionHours: 48,
      },
      {
        title: 'Malware quarantine event on endpoint',
        description:
          'Antivirus quarantined a suspicious executable downloaded from a browser session.',
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Open,
        daysAgo: 0,
      },
      {
        title: 'Impossible travel sign-in for sales account',
        description:
          'Identity logs show successful sign-ins from two distant countries within a short time window.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 210,
      },
      {
        title: 'Public storage bucket exposure',
        description:
          'Cloud posture monitoring detected a storage bucket containing internal reports with public read access.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Resolved,
        daysAgo: 205,
        resolutionHours: 9,
      },
      {
        title: 'Suspicious mailbox forwarding rule',
        description:
          'A mailbox rule was created to silently forward executive email to an external address.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Closed,
        daysAgo: 198,
        resolutionHours: 28,
      },
      {
        title: 'Endpoint beaconing to unknown domain',
        description:
          'Network telemetry detected repeated outbound connections to a newly registered domain.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 190,
      },
      {
        title: 'Failed login spike against admin portal',
        description:
          'The admin portal received a sudden burst of failed authentication attempts from multiple IP ranges.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Resolved,
        daysAgo: 182,
        resolutionHours: 6,
      },
      {
        title: 'Credential dump file found on shared drive',
        description:
          'Data loss prevention detected a file containing password-like strings on a team share.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Investigating,
        daysAgo: 176,
      },
      {
        title: 'Unexpected service account privilege change',
        description:
          'A service account was added to a privileged group outside the approved change window.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Closed,
        daysAgo: 169,
        resolutionHours: 36,
      },
      {
        title: 'Suspicious browser extension installed',
        description:
          'Endpoint inventory found an unapproved browser extension with broad page access permissions.',
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Resolved,
        daysAgo: 162,
        resolutionHours: 18,
      },
      {
        title: 'Database login from unrecognized host',
        description:
          'Database audit logs show a successful login from a host not normally associated with the application.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Open,
        daysAgo: 154,
      },
      {
        title: 'Excessive firewall deny events',
        description:
          'The perimeter firewall recorded a sustained increase in denied inbound traffic to exposed services.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Closed,
        daysAgo: 148,
        resolutionHours: 22,
      },
      {
        title: 'Sensitive file shared externally',
        description:
          'A document containing customer identifiers was shared with an external email address.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Resolved,
        daysAgo: 140,
        resolutionHours: 14,
      },
      {
        title: 'Suspicious OAuth app consent',
        description:
          'A user granted an unknown OAuth application permission to read mailbox and profile data.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 133,
      },
      {
        title: 'Unpatched critical vulnerability detected',
        description:
          'Vulnerability scanning found a critical remote-code-execution exposure on an internet-facing host.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Open,
        daysAgo: 126,
      },
      {
        title: 'Suspicious Linux cron persistence',
        description:
          'Server monitoring detected a new cron entry that downloads and executes a remote script.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Resolved,
        daysAgo: 119,
        resolutionHours: 30,
      },
      {
        title: 'Multiple MFA push denials',
        description:
          'A user reported repeated MFA prompts they did not initiate during non-business hours.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Closed,
        daysAgo: 112,
        resolutionHours: 8,
      },
      {
        title: 'Suspicious archive upload to cloud drive',
        description:
          'Large encrypted archives were uploaded to a personal cloud storage location from a corporate laptop.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 105,
      },
      {
        title: 'Potential data exfiltration over DNS',
        description:
          'DNS logs show high-volume encoded subdomain requests from a developer workstation.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Resolved,
        daysAgo: 98,
        resolutionHours: 44,
      },
      {
        title: 'Suspicious remote desktop session',
        description:
          'Remote desktop access was established to a finance workstation from an unusual internal segment.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Open,
        daysAgo: 91,
      },
      {
        title: 'New local administrator account created',
        description:
          'A local administrator account appeared on an endpoint without a matching ticket.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Closed,
        daysAgo: 84,
        resolutionHours: 16,
      },
      {
        title: 'Suspicious container image pulled',
        description:
          'A Kubernetes node pulled an unsigned container image from an unapproved registry.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Resolved,
        daysAgo: 77,
        resolutionHours: 20,
      },
      {
        title: 'Possible password spraying campaign',
        description:
          'Authentication telemetry shows low-rate failed logins across many users from the same network.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 70,
      },
      {
        title: 'Suspicious API token creation',
        description:
          'A long-lived API token was created for a developer account shortly after a risky sign-in.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Resolved,
        daysAgo: 63,
        resolutionHours: 12,
      },
      {
        title: 'Unexpected outbound traffic from server',
        description:
          'A production server began making outbound connections to hosts outside the normal allowlist.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Open,
        daysAgo: 56,
      },
      {
        title: 'Phishing landing page reported',
        description:
          'Employees reported a fake login portal impersonating the corporate identity provider.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Closed,
        daysAgo: 49,
        resolutionHours: 7,
      },
      {
        title: 'Suspicious registry run key',
        description:
          'Endpoint detection found a newly created Windows run key launching a script from a temp folder.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Resolved,
        daysAgo: 42,
        resolutionHours: 24,
      },
      {
        title: 'Potential insider data access anomaly',
        description:
          'A user accessed a high number of customer records outside their normal business workflow.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Investigating,
        daysAgo: 35,
      },
      {
        title: 'Unauthorized SaaS administrator login',
        description:
          'A SaaS administrator account authenticated from a network not associated with the owner.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Open,
        daysAgo: 30,
      },
      {
        title: 'Suspicious email attachment execution',
        description:
          'An endpoint launched a script shortly after a user opened an attachment from an external sender.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Resolved,
        daysAgo: 26,
        resolutionHours: 10,
      },
      {
        title: 'Cloud security group opened to internet',
        description:
          'A cloud security group was changed to allow inbound administrative access from any IP address.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Closed,
        daysAgo: 22,
        resolutionHours: 3,
      },
      {
        title: 'Suspicious code repository clone',
        description:
          'Source control audit logs show a full repository clone from a newly enrolled device.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Investigating,
        daysAgo: 19,
      },
      {
        title: 'EDR tamper protection alert',
        description:
          'Endpoint protection reported an attempt to disable monitoring services on a laptop.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Resolved,
        daysAgo: 16,
        resolutionHours: 5,
      },
      {
        title: 'Suspicious mailbox deletion activity',
        description:
          'A mailbox showed a burst of deleted messages and purge actions following a risky sign-in.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Closed,
        daysAgo: 13,
        resolutionHours: 9,
      },
      {
        title: 'New external collaborator added',
        description:
          'An external collaborator was added to a restricted workspace without owner approval.',
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Open,
        daysAgo: 11,
      },
      {
        title: 'Suspicious process injection alert',
        description:
          'Endpoint telemetry flagged a process injection pattern involving a signed system binary.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Investigating,
        daysAgo: 9,
      },
      {
        title: 'Unusual data download volume',
        description:
          'A user downloaded significantly more files than baseline from a sensitive project workspace.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Open,
        daysAgo: 7,
      },
      {
        title: 'Suspicious privileged command on server',
        description:
          'Command audit logs captured privilege escalation commands outside the approved maintenance window.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Resolved,
        daysAgo: 6,
        resolutionHours: 15,
      },
      {
        title: 'Repeated account lockouts for executive',
        description:
          'An executive account experienced repeated lockouts from authentication attempts across regions.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Investigating,
        daysAgo: 5,
      },
      {
        title: 'Suspicious npm package installation',
        description:
          'A developer workstation installed a package with typosquatting indicators from a public registry.',
        severity: IncidentSeverity.Medium,
        status: IncidentStatus.Resolved,
        daysAgo: 4,
        resolutionHours: 6,
      },
      {
        title: 'Unexpected certificate export',
        description:
          'Certificate management logs show a private certificate export by a non-owner account.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Closed,
        daysAgo: 3,
        resolutionHours: 4,
      },
      {
        title: 'Critical identity provider risk alert',
        description:
          'The identity provider flagged a privileged account with high risk after anomalous session behavior.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Open,
        daysAgo: 2,
      },
      {
        title: 'Suspicious helpdesk password reset',
        description:
          'A password reset was performed for a sensitive account without the normal verification trail.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 1,
      },
      {
        title: 'Suspicious SIEM alert suppression rule',
        description:
          'A detection rule was modified to suppress alerts for a privileged account activity pattern.',
        severity: IncidentSeverity.High,
        status: IncidentStatus.Investigating,
        daysAgo: 18,
      },
      {
        title: 'Unauthorized database export job',
        description:
          'A scheduled export job was created for a sensitive database without an approved change request.',
        severity: IncidentSeverity.Critical,
        status: IncidentStatus.Resolved,
        daysAgo: 61,
        resolutionHours: 11,
      },
      {
        title: 'Legacy TLS service exposed externally',
        description:
          'External scanning found an outdated TLS configuration exposed on a service used by contractors.',
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Closed,
        daysAgo: 88,
        resolutionHours: 5,
      },
      {
        title: 'Low severity policy violation on endpoint',
        description:
          'Device control logs show a blocked removable media attempt on a managed workstation.',
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Closed,
        daysAgo: 0,
        resolutionHours: 2,
      },
    ];

    const seedIncidents = incidentTemplates.map((template, index) => {
      const createdAt = daysAgo(template.daysAgo);
      const assignedTo = index % 4 === 0 ? userId(manager) : userId(analyst);
      const createdBy = index % 3 === 0 ? userId(manager) : userId(analyst);
      const shouldResolve = terminalStatuses.has(template.status);

      return {
        title: template.title,
        description: template.description,
        severity: template.severity,
        status: template.status,
        assignedTo,
        createdBy,
        createdAt,
        ...(shouldResolve && {
          resolvedAt: resolvedAfter(
            createdAt,
            template.resolutionHours ?? 8 + (index % 8) * 6,
          ),
        }),
      };
    });

    for (const incidentData of seedIncidents) {
      const existingIncident = await incidentModel
        .findOne({ title: incidentData.title })
        .exec();

      if (existingIncident) {
        console.log(`Skipped existing incident: ${incidentData.title}`);
        continue;
      }

      const timeline: TimelineSeedEvent[] = [
        {
          action: 'created',
          by: incidentData.createdBy,
          at: incidentData.createdAt,
        },
      ];

      if (incidentData.status !== IncidentStatus.Open) {
        timeline.push({
          action: 'updated',
          field: 'status',
          oldValue: IncidentStatus.Open,
          newValue: incidentData.status,
          by: incidentData.assignedTo,
          at: incidentData.resolvedAt ?? now,
        });
      }

      if (incidentData.resolvedAt) {
        timeline.push({
          action: 'updated',
          field: 'resolvedAt',
          oldValue: null,
          newValue: incidentData.resolvedAt.toISOString(),
          by: incidentData.assignedTo,
          at: incidentData.resolvedAt,
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
