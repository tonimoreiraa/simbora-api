import { Supplier } from '#models/supplier'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Supplier.create({
      name: 'Luz Express',
      photo: 'https://via.placeholder.com/150',
      address: 'Rua Exemplo, 123',
      description: 'Fornecedor de produtos eletrônicos',
    })
  }
}
