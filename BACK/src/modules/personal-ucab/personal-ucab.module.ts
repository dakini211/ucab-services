import { Module } from '@nestjs/common';
import { PersonalUcabService } from './personal-ucab.service';
import { PersonalUcabController } from './personal-ucab.controller';

@Module({
  controllers: [PersonalUcabController],
  providers: [PersonalUcabService],
})
export class PersonalUcabModule {}
