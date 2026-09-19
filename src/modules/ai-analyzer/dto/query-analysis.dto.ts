import { IsOptional, IsString } from 'class-validator';

export class QueryAnalysisDto {
  @IsOptional()
  @IsString()
  status?: string;
}
