import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { Order } from './order.js'
import User from './user.js'
import { UserAddress } from './user_address.js'
import { OrderUpdate } from './order_update.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export class OrderShipping extends BaseModel {
  @column({ isPrimary: true })
  declare orderId: number

  @column()
  declare userId: number

  @column()
  declare price: number

  @column()
  declare provider: string

  @column()
  declare shippingCode: string

  @column()
  declare addressId: number

  @column()
  declare address: string

  @column()
  declare number: string

  @column()
  declare country: string

  @column()
  declare state: string

  @column()
  declare city: string

  @column()
  declare zipCode: string

  @column()
  declare district: string

  @column()
  declare complement: string

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => UserAddress)
  declare userAddress: BelongsTo<typeof UserAddress>

  @hasMany(() => OrderUpdate, {
    foreignKey: 'orderShippingId',
    localKey: 'orderId',
  })
  declare activityLogs: HasMany<typeof OrderUpdate>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
