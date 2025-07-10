
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMutualFundsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class MutualFundItemDto {
  schemeCode: number;
  schemeName: string;
}

export class PaginationDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export class GetMutualFundsResponseDto {
  data: MutualFundItemDto[];
  pagination: PaginationDto;
}

export type SearchMutualFundsResponseDto = GetMutualFundsResponseDto;
