import { IsNumber, IsOptional, IsString } from '@nestjs/class-validator';

export class DataStructureDto {
  @IsNumber()
  trainingDataValue: number;

  @IsNumber()
  validationDataValue: number;

  @IsString()
  @IsOptional()
  algorithmName?: string;

  @IsNumber()
  @IsOptional()
  batchSize?: number;

  @IsNumber()
  @IsOptional()
  trainingRounds?: number;
}
