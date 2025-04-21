import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { ProductVariant } from './product_variant.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export class ProductVariantType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare defaultUnit: string

  @hasMany(() => ProductVariant)
  declare variants: HasMany<typeof ProductVariant>
}
