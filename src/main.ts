import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configure body size limits for large file uploads
    app.use(json({ limit: '5gb' }));
    app.use(urlencoded({ limit: '5gb', extended: true }));

    // Enable CORS for frontend
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Maestro API')
        .setDescription('Maestro API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
