import vine from '@vinejs/vine'

export const createSupplierSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(3),
    description: vine.string().optional(),
    address: vine.string().minLength(10),
    photo: vine
      .file({
        extnames: ['png', 'jpg', 'jpeg'],
        size: '4mb',
      })
      .optional(),
  })
)

export const updateSupplierSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(3).optional(),
    description: vine.string().optional(),
    address: vine.string().minLength(10).optional(),
    photo: vine
      .file({
        extnames: ['png', 'jpg', 'jpeg'],
        size: '4mb',
      })
      .optional(),
  })
)
