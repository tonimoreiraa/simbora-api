import vine from '@vinejs/vine'

export const createOrderShippingSchema = vine.compile(
  vine.object({
    orderId: vine
      .number()
      .exists(
        async (db, value) =>
          !!(await db.query().select('id').from('orders').where('id', value).first())
      ),
    userId: vine
      .number()
      .exists(
        async (db, value) =>
          !!(await db.query().select('id').from('users').where('id', value).first())
      ),
    price: vine.number().decimal([0, 2]),
    provider: vine.string().minLength(1).maxLength(255),
    shippingCode: vine.string().minLength(1).maxLength(255),
    addressId: vine
      .number()
      .exists(
        async (db, value) =>
          !!(await db.query().select('id').from('user_addresses').where('id', value).first())
      ),
    address: vine.string().minLength(1).maxLength(255),
    number: vine.string().minLength(1).maxLength(50),
    city: vine.string().minLength(1).maxLength(100),
    state: vine.string().minLength(2).maxLength(50),
    zipCode: vine.string().minLength(8).maxLength(10),
    district: vine.string().minLength(1).maxLength(100),
    complement: vine.string().maxLength(255).optional(),
    country: vine.string().minLength(1).maxLength(100).optional(),
  })
)

export const updateOrderShippingSchema = vine.compile(
  vine.object({
    price: vine.number().decimal([0, 2]).optional(),
    provider: vine.string().minLength(1).maxLength(255).optional(),
    shippingCode: vine.string().minLength(1).maxLength(255).optional(),
    address: vine.string().minLength(1).maxLength(255).optional(),
    number: vine.string().minLength(1).maxLength(50).optional(),
    city: vine.string().minLength(1).maxLength(100).optional(),
    state: vine.string().minLength(2).maxLength(50).optional(),
    zipCode: vine.string().minLength(8).maxLength(10).optional(),
    district: vine.string().minLength(1).maxLength(100).optional(),
    complement: vine.string().maxLength(255).optional(),
    country: vine.string().minLength(1).maxLength(100).optional(),
  })
)