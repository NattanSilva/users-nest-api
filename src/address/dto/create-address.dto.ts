export class CreateAddressDto {
  road: string;
  district: string;
  houseNumber: number;
  cep: string;
  city: string;
  state: string;
  complement?: string;
}
