import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_variants'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('variant_type_id').references('id').inTable('product_variant_types')
      table.dropColumn('variant_type')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('variant_type')
      table.dropColumn('variant_type_id')
    })
  }
}
