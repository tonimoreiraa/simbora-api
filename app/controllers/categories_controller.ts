import { Category } from '#models/category'
import { createCategorySchema } from '#validators/category'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class CategoriesController {

  async index({}: HttpContext) {
    const categories = await Category.all()
    return categories.map(category => category.serialize())
  }

  async store({ request }: HttpContext) {
    const { image, ...payload } = await request.validateUsing(createCategorySchema)
    if (payload.categoryId) {
      await Category.findOrFail(payload.categoryId)
    }

    let imageName: string|undefined
    if (image) {
      imageName = `${cuid()}.${image.extname}`
      await image.move(app.tmpPath('uploads'), { name: imageName })
    }

    const category = await Category.create({ ...payload, image: imageName })

    return category
  }

  async show({ params }: HttpContext) {
    const category = await Category.query()
      .where('id', params.id)
      .preload('category')
      .firstOrFail()
    return category
  }

  async update({ params, request }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    const { image, ...payload } = await request.validateUsing(createCategorySchema)
    if (payload.categoryId) {
      await Category.findOrFail(payload.categoryId)
    }

    let imageName: string|undefined
    if (image) {
      imageName = `${cuid()}.${image.extname}`
      await image.move(app.tmpPath('uploads'), { name: imageName })
    }

    category.merge({ ...payload, image: imageName })
    await category.save()

    return category
  }

  async destroy({ params }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    await category.delete()
  }
}