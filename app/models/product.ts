import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { Supplier } from './supplier.js'
import { Category } from './category.js'
import { ProductVariant } from './product_variant.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ProductImage from './product_image.js'
import { DateTime } from 'luxon'

export class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare price: number

  @column()
  declare description: string

  @column()
  declare supplierId: number

  @column()
  declare categoryId: number

  @column({
    prepare: (value) => {
      return JSON.stringify(value)
    },
  })
  declare tags: string[] | null

  @column()
  declare stock: number

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @hasMany(() => ProductVariant)
  declare variants: HasMany<typeof ProductVariant>

  @hasMany(() => ProductImage)
  declare images: HasMany<typeof ProductImage>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
