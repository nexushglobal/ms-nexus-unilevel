import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UnilevelController } from './unilevel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { UnilevelCustomService } from './services/unilevel-custom.service';
import { UnilevelService } from './services/unilevel.service';
import { PaymentNotificationService } from './services/payment-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), CommonModule],
  controllers: [UnilevelController],
  providers: [
    UnilevelService,
    UnilevelCustomService,
    PaymentNotificationService,
  ],
})
export class UnilevelModule {}
