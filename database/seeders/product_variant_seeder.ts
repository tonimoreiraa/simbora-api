import { ProductVariantType } from '#models/product_variant_type'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    await ProductVariantType.createMany([
      {
        name: 'Cor',
        defaultUnit: '',
        createdAt: DateTime.utc(),
        updatedAt: DateTime.utc(),
      },
      {
        name: 'Tamanho',
        defaultUnit: 'm',
        createdAt: DateTime.utc(),
        updatedAt: DateTime.utc(),
      },
      {
        name: 'Peso',
        defaultUnit: 'kg',
        createdAt: DateTime.utc(),
        updatedAt: DateTime.utc(),
      },
      {
        name: 'Volume',
        defaultUnit: 'L',
        createdAt: DateTime.utc(),
        updatedAt: DateTime.utc(),
      },
    ])
  }
}
