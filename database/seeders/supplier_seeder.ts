import { Supplier } from '#models/supplier'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Supplier.create({
      name: 'Luz Express'
    })
  }
}