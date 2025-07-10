
import { IsDateString, IsNotEmpty, Validate } from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'IsStartDateBeforeEndDate', async: false })
export class IsStartDateBeforeEndDateConstraint implements ValidatorConstraintInterface {
  validate(startDate: string, args: ValidationArguments) {
    const endDate = (args.object as any).endDate;
    if (!startDate || !endDate) return true; // Let other validators handle required validation
    return new Date(startDate) <= new Date(endDate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'startDate must be less than or equal to endDate';
  }
}

export class GetHistoricalPricesDto {
  @IsDateString()
  @IsNotEmpty()
  @Validate(IsStartDateBeforeEndDateConstraint)
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class HistoricalPriceDto {
  date: string;
  nav: number;
}

export class GetHistoricalPricesResponseDto {
  fundId: string;
  fundName: string;
  historicalPrices: HistoricalPriceDto[];
}
