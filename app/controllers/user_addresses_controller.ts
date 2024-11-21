import { UserAddress } from '#models/user_address'
import { createAddressSchema } from '#validators/address';
import type { HttpContext } from '@adonisjs/core/http'

export default class UserAddressesController {

    async index({ auth }: HttpContext)
    {
        const user = auth.getUserOrFail()
        const addresses = await UserAddress.query()
            .where('user_id', user.id)

        return addresses;
    }

    async store({ request, auth }: HttpContext)
    {
        const user = auth.getUserOrFail()
        const payload = request.validateUsing(
            createAddressSchema
        )

        const address = await UserAddress.create({
            userId: user.id,
            ...payload
        })

        return address;
    }

    async show({ request, auth }: HttpContext)
    {
        const user = auth.getUserOrFail()
        const addressId = request.param('id')

        const address = await UserAddress.query()
            .where('user_id', user.id)
            .where('id', addressId)
            .firstOrFail()

        return address.serialize();
    }

    async destroy({ request, auth, response }: HttpContext)
    {
        const user = auth.getUserOrFail()
        const addressId = request.param('id')

        const address = await UserAddress.query()
            .where('user_id', user.id)
            .where('id', addressId)
            .firstOrFail()

        await address.delete()

        return response.ok({ message: 'Ok.' })
    }

}