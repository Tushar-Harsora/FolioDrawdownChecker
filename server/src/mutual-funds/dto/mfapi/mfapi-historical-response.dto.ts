import { MfApiHistoricalMetaDto } from './mfapi-historical-meta.dto';
import { MfApiHistoricalDataDto } from './mfapi-historical-data.dto';

export class MfApiHistoricalResponseDto {
  meta: MfApiHistoricalMetaDto;
  data: MfApiHistoricalDataDto[];
}
