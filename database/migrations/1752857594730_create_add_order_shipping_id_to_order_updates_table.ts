import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_updates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('order_shipping_id')
        .unsigned()
        .nullable()
        .references('order_id')
        .inTable('order_shippings')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('order_shipping_id')
    })
  }
}
