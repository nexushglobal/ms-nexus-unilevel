import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UnilevelController } from './unilevel.controller';
import { UnilevelService } from './unilevel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), CommonModule],
  controllers: [UnilevelController],
  providers: [UnilevelService],
})
export class UnilevelModule {}
