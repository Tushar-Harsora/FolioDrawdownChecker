class MfApiHistoricalMetaDto {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
  isin_growth: string;
  isin_div_reinvestment: string | null;
}

export class MfApiHistoricalDataDto {
  date: string; // "09-07-2025"
  nav: string;  // "285.34440"
}

export class MfApiHistoricalResponseDto {
  meta: MfApiHistoricalMetaDto;
  data: MfApiHistoricalDataDto[];
}
