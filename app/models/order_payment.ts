import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { Order } from './order.js'
import { OrderPaymentItem } from './order_payment_item.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

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

  // Campos de análise e contabilização
  @column()
  declare totalItemsCount: number

  @column()
  declare grossAmount: number

  @column()
  declare discountAmount: number

  @column()
  declare taxAmount: number

  @column()
  declare shippingAmount: number

  @column()
  declare netAmount: number

  @column()
  declare commissionAmount: number

  @column()
  declare supplierAmount: number

  @column()
  declare processingTimeSeconds: number

  @column()
  declare paymentGateway: string

  @column()
  declare currency: string

  @column()
  declare exchangeRate: number

  @column()
  declare productsSold: object

  @column()
  declare stockReserved: boolean

  @column.dateTime()
  declare stockReservedAt: DateTime

  @column.dateTime()
  declare stockReleasedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @hasMany(() => OrderPaymentItem, {
    foreignKey: 'orderPaymentId',
  })
  declare items: HasMany<typeof OrderPaymentItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
