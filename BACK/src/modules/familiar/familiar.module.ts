import { Module } from '@nestjs/common';
import { FamiliarService } from './familiar.service';
import { FamiliarController } from './familiar.controller';

@Module({
  controllers: [FamiliarController],
  providers: [FamiliarService],
})
export class FamiliarModule {}
