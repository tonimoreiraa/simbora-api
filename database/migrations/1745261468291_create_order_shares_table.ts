import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_shares'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').notNullable().unique()
      
      table.integer('order_id').references('orders.id')
      table.integer('user_id').notNullable().references('users.id')
      table.integer('shared_with_user_id').references('users.id')
      table.boolean('viewed').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}