import { Module } from '@nestjs/common';
import { ApiFetchAdapter } from './adapters/api-fetch.adapter';
import { HttpAdapter } from './interfaces/http-adapter.interface';
import { TransactionService } from './services/transaction.service';
import { UserService } from './services/user.service';
import { PointService } from './services/point.service';
import { MembershipService } from './services/membership.service';
import { CommissionService } from './services/commission.service';
import { VolumeService } from './services/volume.service';

@Module({
  providers: [
    {
      provide: HttpAdapter,
      useClass: ApiFetchAdapter,
    },
    TransactionService,
    UserService,
    PointService,
    MembershipService,
    CommissionService,
    VolumeService,
  ],
  exports: [HttpAdapter, TransactionService, UserService, PointService, MembershipService, CommissionService, VolumeService],
})
export class CommonModule {}
