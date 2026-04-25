import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { HealthController } from './health.controller';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'dist', 'frontend', 'browser'),
      exclude: ['/api/(.*)']
    })
  ],
  controllers: [HealthController, UniversitiesController],
  providers: [UniversitiesService]
})
export class AppModule {}
