import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { Order } from './order.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export class OrderUpdate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

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
}