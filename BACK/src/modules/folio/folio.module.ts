import { Module } from '@nestjs/common';
import { FolioService } from './folio.service';
import { FolioController } from './folio.controller';

@Module({
  controllers: [FolioController],
  providers: [FolioService],
})
export class FolioModule {}
