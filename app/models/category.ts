import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { Product } from './product.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryId: number

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @column()
  declare image: string

  @column()
  declare name: string

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}