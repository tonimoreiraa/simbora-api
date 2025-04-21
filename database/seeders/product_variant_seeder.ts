import { ProductVariantType } from '#models/product_variant_type'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
     await ProductVariantType.createMany([
      {
        name: 'Cor',
        defaultUnit: '',
      },
      {
        name: 'Tamanho',
        defaultUnit: 'm',
      },
      {
        name: 'Peso',
        defaultUnit: 'kg',
      },
      {
        name: 'Volume',
        defaultUnit: 'L',
      },
    ])
  }
}