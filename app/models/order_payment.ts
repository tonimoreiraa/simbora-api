import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { Order } from './order.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export class OrderPayment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare paymentMethod: string

  @column()
  declare paymentId: string

  @column()
  declare status: string

  @column()
  declare price: number

  @column.dateTime()
  declare paidAt: DateTime

  @column.dateTime()
  declare dueDate: DateTime

  @column.dateTime()
  declare settlementDate: DateTime

  @column()
  declare paymentProvider: string

  @column()
  declare extraInfo: object

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
}