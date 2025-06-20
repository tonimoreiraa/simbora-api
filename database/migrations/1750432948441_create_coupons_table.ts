import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coupons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code').notNullable()
      table.string('description').notNullable()
      table.enum('type', ['percent', 'fixed', 'shipping']).notNullable()
      table.decimal('min_order_value', 10, 2).notNullable()
      table
        .integer('supplier_id')
        .unsigned()
        .references('id')
        .inTable('suppliers')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('categories')
        .onDelete('CASCADE')
        .notNullable()
      table.decimal('value', 10, 2).notNullable()
      table.integer('max_uses').notNullable()
      table.integer('uses_count').notNullable().defaultTo(0)
      table.integer('max_uses_per_user').notNullable()
      table.timestamp('valid_from').notNullable()
      table.timestamp('valid_until').notNullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
