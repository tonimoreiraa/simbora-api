import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { Product } from './product.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import env from '#start/env'

export class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryId: number

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @column({
    serialize: (value) => env.get('PUBLIC_URL') + '/uploads/' + value,
  })
  declare image: string

  @column()
  declare name: string

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
