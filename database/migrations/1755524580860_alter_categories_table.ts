import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'categories'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.setNullable('image')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropNullable('image')
    })
  }
}