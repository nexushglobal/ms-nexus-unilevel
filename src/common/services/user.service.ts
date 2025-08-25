import { Injectable, Logger } from '@nestjs/common';

import {
  UserBasicInfo,
  UserWithPosition,
  ActiveAncestorWithMembership,
} from '../interfaces/user.interface';
import { MessagingService } from 'src/messaging/messaging.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly usersClient: MessagingService) {}

  async getUserBasicInfo(userId: string): Promise<UserBasicInfo> {
    return this.usersClient.send<UserBasicInfo>(
      { cmd: 'users.getUserBasicInfo' },
      { userId },
    );
  }

  async getActiveAncestorsWithMembership(
    userId: string,
  ): Promise<ActiveAncestorWithMembership[]> {
    return this.usersClient.send<ActiveAncestorWithMembership[]>(
      { cmd: 'users.getActiveAncestorsWithMembership' },
      { userId },
    );
  }

  async getUserWithPosition(userId: string): Promise<UserWithPosition> {
    return this.usersClient.send<UserWithPosition>(
      { cmd: 'users.getUserWithPosition' },
      { userId },
    );
  }
}
