import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleAvailabilityDto {
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  @IsNotEmpty({ message: 'isAvailable is required' })
  isAvailable: boolean;
}
