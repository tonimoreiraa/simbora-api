import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import { Product } from './product.js'
import Coupon from './coupon.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import env from '#start/env'

export class Supplier extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({
    serialize: (value) => (value ? env.get('PUBLIC_URL') + '/uploads/' + value : null),
  })
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

  @hasMany(() => Coupon)
  declare coupons: HasMany<typeof Coupon>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
