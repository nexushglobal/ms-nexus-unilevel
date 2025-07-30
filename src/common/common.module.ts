import { Module } from '@nestjs/common';
import { ApiFetchAdapter } from './adapters/api-fetch.adapter';
import { HttpAdapter } from './interfaces/http-adapter.interface';
import { TransactionService } from './services/transaction.service';

@Module({
  providers: [
    {
      provide: HttpAdapter,
      useClass: ApiFetchAdapter,
    },
    TransactionService,
  ],
  exports: [HttpAdapter, TransactionService],
})
export class CommonModule {}
