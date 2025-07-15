import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coupons'

  async up() {
    // Remove duplicate codes keeping only the first occurrence
    await this.db.rawQuery(`
      DELETE FROM coupons a USING (
        SELECT MIN(id) as id, code 
        FROM coupons 
        GROUP BY code HAVING COUNT(*) > 1
      ) b
      WHERE a.code = b.code AND a.id <> b.id;
    `)

    // Add unique constraint
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['code'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['code'])
    })
  }
}
