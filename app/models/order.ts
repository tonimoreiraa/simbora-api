import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import { OrderShipping } from './order_shipping.js'
import { OrderPayment } from './order_payment.js'
import { OrderItem } from './order_item.js'
import { OrderUpdate } from './order_update.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

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
  declare paymentId: number

  @belongsTo(() => User)
  declare customer: BelongsTo<typeof User>

  @belongsTo(() => OrderShipping)
  declare shipping: BelongsTo<typeof OrderShipping>

  @belongsTo(() => OrderPayment)
  declare payment: BelongsTo<typeof OrderPayment>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @hasMany(() => OrderUpdate)
  declare updates: HasMany<typeof OrderUpdate>
}