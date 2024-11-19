import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE')
      table.string('payment_method').notNullable()
      table.string('payment_id').notNullable()
      table.string('status').notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.timestamp('paid_at').nullable()
      table.timestamp('due_date').nullable()
      table.timestamp('settlement_date').nullable()
      table.string('payment_provider').notNullable()
      table.json('extra_info').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}