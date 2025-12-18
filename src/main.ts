import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Starting Phone Agent application...');
  
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  
  const port = process.env.PORT || 8080;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`✅ Application running on port: ${port}`);
  console.log(`🌐 Health: http://0.0.0.0:${port}/`);
}

bootstrap();