import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { SERVICE_NAME } from 'src/config/constants';

@Injectable()
export class MessagingService {
  constructor(@Inject(SERVICE_NAME) private readonly client: ClientProxy) {}
  async send<T>(pattern: string | { cmd: string }, data: any): Promise<T> {
    return lastValueFrom(
      this.client.send<T>(pattern, data).pipe(
        catchError((error) => {
          if (error instanceof RpcException) throw error;
          const err = error as {
            message?: string | string[];
            status?: number;
            service?: string;
          };
          // Determinamos el mensaje del error
          let errorMessage: string[];
          if (Array.isArray(err?.message)) {
            errorMessage = err.message;
          } else if (typeof err?.message === 'string') {
            errorMessage = [err.message];
          } else {
            errorMessage = ['Unknown RPC Error'];
          }
          const statusCode =
            typeof err?.status === 'number'
              ? err.status
              : HttpStatus.INTERNAL_SERVER_ERROR;
          const service = err?.service || 'vdi-client-gateway';
          throw new RpcException({
            status: statusCode,
            message: errorMessage,
            service,
          });
        }),
      ),
    );
  }

  emit<T>(pattern: string, data: any): void {
    this.client.emit<T>(pattern, data);
  }
}
