import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import { Product } from './product.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export class Supplier extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare photo: string

  @column()
  declare ownerId: number

  @column()
  declare address: string

  @column()
  declare description: string

  @belongsTo(() => User)
  declare owner: BelongsTo<typeof User>

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}