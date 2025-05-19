import { Product } from '#models/product'
import { createProductSchema, updateProductSchema } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import ProductImage from '#models/product_image'
import { ProductVariantType } from '#models/product_variant_type'

export default class ProductsController {
  async index({ request }: HttpContext) {
    const userQuery = request.input('query')
    const categoryId = request.input('categoryId')
    const page = request.input('page')
    const perPage = request.input('perPage', 25)
    const groupByCategory = request.input('groupByCategory', false)

    const products = await Product.query()
      .if(userQuery && userQuery.length, (query) => {
        const conditions = userQuery.split(/\s+/).map((word: string) => `%${word}%`)
        for (let condition of conditions) {
          condition = `%${condition}%`
          query.orWhere('name', 'ILIKE', condition).orWhere('description', 'ILIKE', condition)
        }
      })
      .preload('images')
      .preload('supplier')
      .if(categoryId, (query) => query.where('category_id', categoryId))
      .if(groupByCategory, (query) => query.groupBy('category_id'))
      .paginate(page, perPage)

    return products
  }

  async store({ request }: HttpContext) {
    let { images, image, variants, ...payload } = await request.validateUsing(createProductSchema)

    const product = await Product.create(payload)

    if (image) {
      images = images ? [...images, image] : [image]
    }
    if (images) {
      const imagesDir = app.tmpPath('uploads')
      let imagePaths: string[] = []
      for (const uploadedImage of images) {
        await uploadedImage.move(imagesDir, {
          name: `${cuid()}.${uploadedImage.extname}`,
        })
        imagePaths.push(uploadedImage.fileName as string)
      }

      await ProductImage.createMany(
        imagePaths.map((path) => ({
          productId: product.id,
          path,
        }))
      )
    }

    if (variants) {
      const variantsPayload = await Promise.all(
        variants.map(async (variant) => {
          const variantType = await ProductVariantType.findOrFail(variant.variantTypeId)
          if (variant.unit === null) variant.unit = variantType.defaultUnit
          if (variant.photo) {
            const photoName = `${cuid()}.${variant.photo.extname}`
            variant.photo.move(app.tmpPath('uploads'), {
              name: photoName,
            })
            return {
              ...variant,
              photo: photoName,
            }
          }
          return { ...variant, photo: undefined }
        })
      )
      await product.related('variants').createMany(variantsPayload)
    }

    return product.serialize()
  }

  async show({ request }: HttpContext) {
    const productId = request.param('id')
    const product = await Product.query()
      .where('id', productId)
      .preload('category', (query) => query.select('id', 'name'))
      .preload('supplier', (query) => query.select('id', 'name'))
      .preload('variants', (query) => query.preload('type'))
      .preload('images', (query) => query.select('path', 'product_id', 'id'))
      .firstOrFail()

    return product
  }

  async update({ request }: HttpContext) {
    const productId = request.param('id')
    const payload = await request.validateUsing(updateProductSchema)

    const product = await Product.findOrFail(productId)
    product.merge(payload)

    await product.save()
  }

  async addPhoto({ request, response }: HttpContext) {
    const productId = request.input('productId')

    const product = await Product.findOrFail(productId)

    const image = request.file('image', {
      extnames: ['jpg', 'jpeg', 'png'],
      size: '2mb',
    })

    if (!image) {
      return response.badRequest({
        message: 'Você deve enviar uma imagem válida.',
      })
    }
    await image.move(app.makePath('storage/uploads'), {
      name: `${cuid()}.${image.extname}`,
    })

    await ProductImage.create({
      productId: product.id,
      path: image.filePath as string,
    })

    return response.safeStatus(200).json({ message: 'OK' })
  }
}
