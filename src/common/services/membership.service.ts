import { Injectable, Logger } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import { UserMembershipStatusResponse } from '../interfaces/membership.interface';

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(private readonly membershipClient: MessagingService) {}

  async getUserMembershipStatus(
    userId: string,
  ): Promise<UserMembershipStatusResponse> {
    return this.membershipClient.send<UserMembershipStatusResponse>(
      { cmd: 'membership.getUserMembershipStatus' },
      { userId },
    );
  }
}
