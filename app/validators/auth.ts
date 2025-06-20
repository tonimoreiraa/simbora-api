import vine from '@vinejs/vine'

export const signUpSchema = vine.compile(
  vine.object({
    name: vine.string(),
    email: vine.string().email(),
    username: vine
      .string()
      .minLength(3)
      .maxLength(30)
      .regex(/^[a-z0-9._]+$/)
      .regex(/^(?!.*\.\.)(?!.*\.$)[a-z0-9._]+$/)
      .unique(async (db, value) => {
        const user = db.from('users').where('username', value).first()
        return user
      }),
    password: vine
      .string()
      .minLength(6)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[\W_]/),
    role: vine.enum(['customer', 'professional']),
    avatar: vine
      .file({
        extnames: ['jpeg', 'png', 'jpg'],
        size: '2mb',
      })
      .optional(),
    phoneNumber: vine.string().trim().minLength(10).optional(),
  })
)
