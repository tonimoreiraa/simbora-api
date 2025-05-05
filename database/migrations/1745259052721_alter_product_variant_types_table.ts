import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_variant_types'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('default_unit')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('default_unit')
    })
  }
}
