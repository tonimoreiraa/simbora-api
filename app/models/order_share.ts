import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { Order } from './order.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class OrderShare extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orderId: number

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare sharedWithUserId: number

  @belongsTo(() => User, {
    foreignKey: 'sharedWithUserId',
  })
  declare sharedWithUser: BelongsTo<typeof User>

  @column()
  declare viewed: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
