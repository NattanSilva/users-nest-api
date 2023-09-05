import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AddressService } from '../address/address.service';

@Injectable()
export class AddressOwnerRoleGuard implements CanActivate {
  constructor(private addressService: AddressService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const currentAddress = await this.addressService.findOne(request.params.id);

    if (request?.user.id !== currentAddress[0].owner.id) {
      throw new UnauthorizedException('you dont have owner permission!');
    }

    return true;
  }
}
