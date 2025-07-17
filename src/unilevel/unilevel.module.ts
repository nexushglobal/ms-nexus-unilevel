import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UnilevelController } from './unilevel.controller';
import { UnilevelService } from './unilevel.service';

@Module({
  imports: [CommonModule],
  controllers: [UnilevelController],
  providers: [UnilevelService],
})
export class UnilevelModule {}
