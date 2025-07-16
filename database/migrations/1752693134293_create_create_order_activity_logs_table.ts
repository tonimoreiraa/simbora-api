import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_activity_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('order_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('action').notNullable() // created, updated, status_changed, payment_updated, etc
      table.string('entity_type').notNullable() // order, payment, shipping, etc
      table.integer('entity_id').nullable() // ID da entidade afetada
      table.string('old_status').nullable() // Status anterior
      table.string('new_status').nullable() // Novo status
      table.text('description').notNullable() // Descrição da atividade
      table.json('metadata').nullable() // Dados adicionais da atividade
      table.string('ip_address').nullable() // IP do usuário
      table.string('user_agent').nullable() // User agent
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Índices para performance
      table.index(['order_id', 'created_at'])
      table.index(['user_id', 'created_at'])
      table.index(['action', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
