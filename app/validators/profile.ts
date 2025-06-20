import vine from '@vinejs/vine'

export const updateProfileSchema = vine.compile(
  vine.object({
    name: vine.string().optional(),
    email: vine.string().email().optional(),
    username: vine
      .string()
      .minLength(3)
      .maxLength(30)
      .regex(/^[a-z0-9._]+$/)
      .regex(/^(?!.*\.\.)(?!.*\.$)[a-z0-9._]+$/)
      .optional(),
    password: vine
      .string()
      .minLength(6)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[\W_]/)
      .optional(),
    role: vine.enum(['customer', 'professional']).optional(),
    avatar: vine
      .file({
        extnames: ['jpeg', 'png', 'jpg'],
        size: '2mb',
      })
      .optional(),
    phoneNumber: vine.string().trim().minLength(10).optional(),
  })
)
