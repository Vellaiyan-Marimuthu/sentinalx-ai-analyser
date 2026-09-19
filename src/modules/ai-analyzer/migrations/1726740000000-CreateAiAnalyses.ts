import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAiAnalyses1726740000000 implements MigrationInterface {
  name = 'CreateAiAnalyses1726740000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_analyses',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'applicationId', type: 'varchar', length: '128' },
          { name: 'clusterId', type: 'varchar', length: '128' },
          { name: 'status', type: 'varchar', length: '32' },
          { name: 'provider', type: 'varchar', length: '64' },
          { name: 'model', type: 'varchar', length: '128' },
          { name: 'promptVersion', type: 'varchar', length: '32' },
          { name: 'executiveSummary', type: 'text', isNullable: true },
          { name: 'whatHappened', type: 'text', isNullable: true },
          { name: 'whyItMatters', type: 'text', isNullable: true },
          { name: 'evidenceAssessment', type: 'text', isNullable: true },
          { name: 'investigation', type: 'text', isNullable: true },
          { name: 'recommendations', type: 'text', isNullable: true },
          { name: 'limitations', type: 'text', isNullable: true },
          { name: 'inputSnapshot', type: 'text', isNullable: true },
          { name: 'outputSnapshot', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'datetime' },
          { name: 'updatedAt', type: 'datetime' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ai_analyses',
      new TableIndex({
        name: 'IDX_ai_analyses_application_cluster',
        columnNames: ['applicationId', 'clusterId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('ai_analyses', 'IDX_ai_analyses_application_cluster');
    await queryRunner.dropTable('ai_analyses');
  }
}
