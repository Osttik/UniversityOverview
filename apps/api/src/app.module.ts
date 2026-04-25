import { Module } from '@nestjs/common';
import { UniversitiesController } from './universities/universities.controller';
import { UniversitiesService } from './universities/universities.service';

@Module({
  controllers: [UniversitiesController],
  providers: [UniversitiesService]
})
export class AppModule {}
