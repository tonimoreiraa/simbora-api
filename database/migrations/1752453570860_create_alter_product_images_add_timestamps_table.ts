import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_images'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now()).alter()
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now()).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('created_at', { useTz: true }).nullable().alter()
      table.timestamp('updated_at', { useTz: true }).nullable().alter()
    })
  }
}
