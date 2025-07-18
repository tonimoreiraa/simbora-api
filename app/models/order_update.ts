import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { Order } from './order.js'
import { OrderShipping } from './order_shipping.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export class OrderUpdate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare orderShippingId: number | null

  @column()
  declare status: string

  @column()
  declare private: boolean

  @column()
  declare onlyMe: boolean

  @column()
  declare comment: string

  @column()
  declare title: string

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => OrderShipping, {
    foreignKey: 'orderShippingId',
    localKey: 'orderId',
  })
  declare orderShipping: BelongsTo<typeof OrderShipping>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
