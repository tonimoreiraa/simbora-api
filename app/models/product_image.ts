import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { Product } from './product.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import env from '#start/env'

export default class ProductImage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @column({
    serialize: (value) => env.get('PUBLIC_URL') + '/uploads/' + value
  })
  declare path: string
}