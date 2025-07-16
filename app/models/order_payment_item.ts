import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { OrderPayment } from './order_payment.js'
import { OrderItem } from './order_item.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export class OrderPaymentItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderPaymentId: number

  @column()
  declare orderItemId: number

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare totalPrice: number

  @belongsTo(() => OrderPayment, {
    foreignKey: 'orderPaymentId',
  })
  declare payment: BelongsTo<typeof OrderPayment>

  @belongsTo(() => OrderItem, {
    foreignKey: 'orderItemId',
  })
  declare item: BelongsTo<typeof OrderItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
