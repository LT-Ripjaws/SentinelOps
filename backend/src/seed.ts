import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserRole } from './users/user-role.enum';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const usersService = app.get(UsersService);

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

    for (const userData of seedUsers) {
      const existingUser = await usersService.findByEmail(userData.email);
      if (existingUser) {
        console.log(`Skipped existing user: ${userData.email}`);
        continue;
      }

      await usersService.createUser(userData);
      console.log(`Created user: ${userData.email}`);
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
