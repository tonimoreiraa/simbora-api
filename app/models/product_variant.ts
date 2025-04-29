import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { Product } from './product.js'
import { ProductVariantType } from './product_variant_type.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export class ProductVariant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare variantTypeId: number

  @belongsTo(() => ProductVariantType)
  declare variantType: BelongsTo<typeof ProductVariantType>

  @column()
  declare value: string

  @column()
  declare unit: string

  @column()
  declare price: number

  @column()
  declare photo: string

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => ProductVariantType)
  declare type: BelongsTo<typeof ProductVariantType>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
