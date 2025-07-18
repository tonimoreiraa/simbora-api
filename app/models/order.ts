import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import { OrderShipping } from './order_shipping.js'
import { OrderPayment } from './order_payment.js'
import { OrderItem } from './order_item.js'
import { OrderUpdate } from './order_update.js'
import { OrderActivityLog } from './order_activity_log.js'
import Coupon from './coupon.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare customerId: number

  @column()
  declare subtotalPrice: number

  @column()
  declare totalPrice: number

  @column()
  declare discountPrice: number

  @column()
  declare shippingPrice: number

  @column()
  declare shippingId: number

  @column()
  declare status: string

  @column()
  declare type: 'delivery' | 'pickup'

  @column()
  declare paymentId: number

  @column()
  declare couponId: number

  @belongsTo(() => User, {
    foreignKey: 'customerId',
  })
  declare customer: BelongsTo<typeof User>

  @belongsTo(() => OrderShipping, {
    foreignKey: 'shippingId',
  })
  declare shipping: BelongsTo<typeof OrderShipping>

  @belongsTo(() => OrderPayment, {
    foreignKey: 'paymentId',
  })
  declare payment: BelongsTo<typeof OrderPayment>

  @belongsTo(() => Coupon, {
    foreignKey: 'couponId',
  })
  declare coupon: BelongsTo<typeof Coupon>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @hasMany(() => OrderUpdate)
  declare updates: HasMany<typeof OrderUpdate>

  @hasMany(() => OrderActivityLog)
  declare activityLogs: HasMany<typeof OrderActivityLog>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
