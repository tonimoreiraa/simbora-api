import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { Order } from './order.js'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export class OrderActivityLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare userId: number

  @column()
  declare action: string

  @column()
  declare entityType: string

  @column()
  declare entityId: number

  @column()
  declare oldStatus: string

  @column()
  declare newStatus: string

  @column()
  declare description: string

  @column()
  declare metadata: object

  @column()
  declare ipAddress: string

  @column()
  declare userAgent: string

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Método estático para criar logs facilmente
  static async createLog(data: {
    orderId: number
    userId?: number
    action: string
    entityType: string
    entityId?: number
    oldStatus?: string
    newStatus?: string
    description: string
    metadata?: object
    ipAddress?: string
    userAgent?: string
  }) {
    return await OrderActivityLog.create(data)
  }

  // Método para formatar o log para exibição
  formatForDisplay() {
    return {
      id: this.id,
      orderId: this.orderId,
      user: this.user
        ? {
            id: this.user.id,
            name: this.user.name,
            email: this.user.email,
          }
        : null,
      action: this.action,
      entityType: this.entityType,
      entityId: this.entityId,
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
    }
  }
}
