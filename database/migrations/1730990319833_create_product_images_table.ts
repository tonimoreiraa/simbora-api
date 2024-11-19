import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('product_id').references('products.id').notNullable()
      table.string('path').notNullable()

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}