import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  
  // Use PORT from environment or default to 3000
  const port = process.env.PORT || 3000;
  
  // CRITICAL: Add '0.0.0.0' as the second parameter
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on port: ${port}`);
  console.log(`🌐 Accessible at: http://0.0.0.0:${port}`);
}
bootstrap();