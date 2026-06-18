import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { ensureUploadsDir } from './helpers/multer.config';

ensureUploadsDir();

const hosted =
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  Boolean(process.env.VERCEL);

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: hosted,
      envFilePath: envFile,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 30_000,
        connectTimeoutMS: 30_000,
        family: 4,
        retryWrites: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    AuthModule,
    CatalogModule,
    AdminModule,
  ],
})
export class AppModule {}
