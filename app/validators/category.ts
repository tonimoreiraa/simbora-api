import vine from '@vinejs/vine'

export const createCategorySchema = vine.compile(
  vine.object({
    name: vine.string().minLength(3),
    categoryId: vine.number().optional(),
    description: vine.string().optional(),
    image: vine.file({
      extnames: ['png', 'jpg', 'jpeg'],
      size: '4mb',
    }),
  })
)
