import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_shippings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('order_id')
        .unsigned()
        .primary()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.decimal('price', 10, 2).notNullable()
      table.string('provider').notNullable()
      table.string('shipping_code').notNullable()
      table
        .integer('address_id')
        .unsigned()
        .references('id')
        .inTable('user_addresses')
        .onDelete('CASCADE')
      table.string('address').notNullable()
      table.string('number').notNullable()
      table.string('country').notNullable()
      table.string('state').notNullable()
      table.string('city').notNullable()
      table.string('zip_code').notNullable()
      table.string('district').notNullable()
      table.string('complement').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
