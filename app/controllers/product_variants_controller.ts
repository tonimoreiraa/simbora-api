import { ProductVariant } from '#models/product_variant'
import { createProductVariantSchema } from '#validators/product'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class ProductVariantsController {
    async store({ request, response }: HttpContext)
    {
        const payload = await request.validateUsing(createProductVariantSchema)
        const image = request.file('photo', {
            extnames: ['jpg', 'jpeg', 'png'],
            size: '2mb'
        })

        if (!image) {
            return response.badRequest({
                message: 'Você deve enviar uma imagem válida.',
            })
        }
        await image.move(app.makePath('storage/uploads'), {
            name: `${cuid()}.${image.extname}`
        })
        const productVariant = await ProductVariant.create({...payload, photo: image.fileName })

        return productVariant.serialize()
    }

    async destroy({ params }: HttpContext)
    {
        const productVariantId = params.id
        const productVariant = await ProductVariant.findOrFail(productVariantId)
        await productVariant.delete()
    }

    async update({ params, request }: HttpContext)
    {
        const productVariantId = params.id
        const payload = await request.validateUsing(createProductVariantSchema)
        const image = request.file('photo', {
            extnames: ['jpg', 'jpeg', 'png'],
            size: '2mb'
        })

        const productVariant = await ProductVariant.findOrFail(productVariantId)

        let imagePath: undefined|string
        if (image) {
            await image.move(app.makePath('storage/uploads'), {
                name: `${cuid()}.${image.extname}`
            })
            imagePath = image.fileName
        }

        productVariant.merge({ ...payload, photo: imagePath })
        await productVariant.save()

        return productVariant.serialize()
    }
}