import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_payment_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('order_payment_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('order_payments')
        .onDelete('CASCADE')
      table
        .integer('order_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('order_items')
        .onDelete('CASCADE')
      table.integer('quantity').notNullable()
      table.decimal('unit_price', 10, 2).notNullable()
      table.decimal('total_price', 10, 2).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Evitar duplicatas
      table.unique(['order_payment_id', 'order_item_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
