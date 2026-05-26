import { IsInt, Min } from 'class-validator';

export class AdjustLoyaltyDto {
  @IsInt()
  @Min(1)
  points: number;
}
