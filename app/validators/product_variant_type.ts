import vine from '@vinejs/vine'

export const createProductVariantTypeSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    defaultUnit: vine.string().minLength(1).maxLength(20),
  })
)

export const updateProductVariantTypeSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    defaultUnit: vine.string().minLength(1).maxLength(20),
  })
)
