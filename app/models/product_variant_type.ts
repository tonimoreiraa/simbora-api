import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { ProductVariant } from './product_variant.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export class ProductVariantType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare defaultUnit: string

  @hasMany(() => ProductVariant)
  declare variants: HasMany<typeof ProductVariant>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
