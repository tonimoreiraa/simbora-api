import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('customer_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.decimal('subtotal_price', 10, 2).notNullable()
      table.decimal('total_price', 10, 2).notNullable()
      table.decimal('discount_price', 10, 2).notNullable()
      table.decimal('shipping_price', 10, 2).notNullable()
      table.integer('shipping_id').nullable()
      table.string('status').notNullable()
      table.integer('payment_id').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}