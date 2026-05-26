import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateKitchenNotesDto {
  @IsString()
  @IsNotEmpty({ message: 'kitchenNotes must not be empty' })
  kitchenNotes: string;
}

export class UpdatePriorityDto {
  @IsBoolean({ message: 'priority must be a boolean' })
  @IsNotEmpty({ message: 'priority is required' })
  priority: boolean;
}
