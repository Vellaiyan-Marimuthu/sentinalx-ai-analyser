import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { AiAnalysisStatus } from '../enums/ai-analysis-status.enum';
import { AIAnalysisContext } from '../types/ai-analysis-context';
import { AIAnalysisResult } from '../types/ai-analysis-result';

@Entity('ai_analyses')
@Index(['applicationId', 'clusterId'])
export class AiAnalysisEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 128 })
  applicationId!: string;

  @Column({ type: 'varchar', length: 128 })
  clusterId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: AiAnalysisStatus;

  @Column({ type: 'varchar', length: 64 })
  provider!: string;

  @Column({ type: 'varchar', length: 128 })
  model!: string;

  @Column({ type: 'varchar', length: 32 })
  promptVersion!: string;

  @Column({ type: 'text', nullable: true })
  executiveSummary!: string | null;

  @Column({ name: 'whatHappened', type: 'text', nullable: true })
  attackExplanation!: string | null;

  @Column({ name: 'whyItMatters', type: 'text', nullable: true })
  riskExplanation!: string | null;

  @Column({ name: 'investigation', type: 'simple-json', nullable: true })
  investigationSteps!: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  recommendations!: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  inputSnapshot!: AIAnalysisContext | null;

  @Column({ type: 'simple-json', nullable: true })
  outputSnapshot!: AIAnalysisResult | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  assignId(): void {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
