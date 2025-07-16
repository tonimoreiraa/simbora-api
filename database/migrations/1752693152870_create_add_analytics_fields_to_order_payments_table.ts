import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Campos para estatísticas de vendas
      table.integer('total_items_count').defaultTo(0) // Total de itens vendidos
      table.decimal('gross_amount', 10, 2).defaultTo(0) // Valor bruto
      table.decimal('discount_amount', 10, 2).defaultTo(0) // Desconto aplicado
      table.decimal('tax_amount', 10, 2).defaultTo(0) // Impostos
      table.decimal('shipping_amount', 10, 2).defaultTo(0) // Frete
      table.decimal('net_amount', 10, 2).defaultTo(0) // Valor líquido
      table.decimal('commission_amount', 10, 2).defaultTo(0) // Comissão da plataforma
      table.decimal('supplier_amount', 10, 2).defaultTo(0) // Valor para o fornecedor

      // Campos para análise de performance
      table.integer('processing_time_seconds').nullable() // Tempo de processamento
      table.string('payment_gateway').nullable() // Gateway usado
      table.string('currency', 3).defaultTo('BRL') // Moeda
      table.decimal('exchange_rate', 10, 4).defaultTo(1.0) // Taxa de câmbio

      // Campos para controle de estoque
      table.json('products_sold').nullable() // JSON com produtos vendidos
      table.boolean('stock_reserved').defaultTo(false) // Estoque reservado
      table.timestamp('stock_reserved_at').nullable() // Quando foi reservado
      table.timestamp('stock_released_at').nullable() // Quando foi liberado
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('total_items_count')
      table.dropColumn('gross_amount')
      table.dropColumn('discount_amount')
      table.dropColumn('tax_amount')
      table.dropColumn('shipping_amount')
      table.dropColumn('net_amount')
      table.dropColumn('commission_amount')
      table.dropColumn('supplier_amount')
      table.dropColumn('processing_time_seconds')
      table.dropColumn('payment_gateway')
      table.dropColumn('currency')
      table.dropColumn('exchange_rate')
      table.dropColumn('products_sold')
      table.dropColumn('stock_reserved')
      table.dropColumn('stock_reserved_at')
      table.dropColumn('stock_released_at')
    })
  }
}
