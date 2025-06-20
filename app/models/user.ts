import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { UserAddress } from './user_address.js'
import { Order } from './order.js'
import { Supplier } from './supplier.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column()
  declare username: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'customer' | 'admin' | 'professional' | 'supplier'

  @column()
  declare avatar: string | null

  @column()
  declare phoneNumber: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => UserAddress)
  declare addresses: HasMany<typeof UserAddress>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @hasMany(() => Supplier)
  declare suppliers: HasMany<typeof Supplier>
  static accessTokens = DbAccessTokensProvider.forModel(User)
}
