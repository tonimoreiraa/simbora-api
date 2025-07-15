import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coupons'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('supplier_id').nullable().alter()
      table.integer('category_id').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('supplier_id').notNullable().alter()
      table.integer('category_id').notNullable().alter()
    })
  }
}
