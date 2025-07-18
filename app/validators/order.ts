import vine from '@vinejs/vine'

export const createOrderSchema = vine.compile(
  vine.object({
    items: vine.array(
      vine.object({
        product_id: vine.number(),
        product_variant_id: vine.number().optional(),
        quantity: vine.number(),
      })
    ),
    addressId: vine.number().optional(),
    type: vine.enum(['delivery', 'pickup']).optional(),
  })
)
