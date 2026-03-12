import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger, VersioningType, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { LoggingInterceptor } from './shared/interceptor/logging.interceptor';
import { ResultInterceptor } from './shared/interceptor/result.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.enableShutdownHooks();
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalInterceptors(new LoggingInterceptor(), new ResultInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({ origin: true, credentials: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AeroIntelX API')
    .setDescription('The AeroIntelX API description')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-user-id',
        description: 'User ID',
      },
      'x-user-id',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-workspace-id',
        description: 'Workspace ID',
      },
      'x-workspace-id',
    )
    .addSecurityRequirements('x-user-id')
    .addSecurityRequirements('x-workspace-id')
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      customSiteTitle: 'AeroIntelX API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
    },
  );

  const port = configService.get<number>('port', 3000);

  const httpServer = app.getHttpServer();
  httpServer.keepAliveTimeout = 5000;
  httpServer.headersTimeout = 6000;

  await app.listen(port);
  logger.log(
    `🚀🚀🚀--- Application is running on: ${await app.getUrl()}---🚀🚀🚀`,
  );

  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.log(`Received ${signal}. Shutting down...`);

    const shutdownTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timeout. Forcing exit...');
      process.exit(1);
    }, 15_000);

    try {
      await new Promise<void>((resolve, reject) => {
        app.getHttpServer().close((err: Error | undefined) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await app.close();
      clearTimeout(shutdownTimeout);
      logger.log('Shutdown complete');
      process.exit(0);
    } catch (error) {
      clearTimeout(shutdownTimeout);
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => void gracefulShutdown('SIGUSR2'));
  process.on('SIGHUP', () => void gracefulShutdown('SIGHUP'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    void gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    void gracefulShutdown('unhandledRejection');
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
