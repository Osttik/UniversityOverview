import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UniversitiesModule } from './universities/universities.module';

@Module({
  imports: [UniversitiesModule],
  controllers: [AppController],
})
export class AppModule {}
