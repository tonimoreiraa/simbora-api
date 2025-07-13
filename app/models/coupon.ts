import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { Supplier } from './supplier.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { Category } from './category.js'

export default class Coupon extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare description: string

  @column()
  declare type: 'percent' | 'fixed' | 'shipping'

  @column()
  declare minOrderValue: number

  @column()
  declare supplierId: number | null

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>

  @column()
  declare categoryId: number | null

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @column()
  declare value: number

  @column()
  declare maxUses: number

  @column()
  declare usesCount: number

  @column()
  declare maxUsesPerUser: number

  @column()
  declare validFrom: DateTime

  @column()
  declare validUntil: DateTime

  @column()
  declare active: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
