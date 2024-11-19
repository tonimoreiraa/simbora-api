import vine from '@vinejs/vine'

export const signUpSchema = vine.compile(
    vine.object({
        name: vine.string(),
        email: vine.string().email(),
        username: vine.string()
            .minLength(3)
            .maxLength(30)
            .regex(/^[a-z0-9._]+$/)
            .regex(/^(?!.*\.\.)(?!.*\.$)[a-z0-9._]+$/),
        password: vine.string()
            .minLength(6)
            .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[\W_]/),
        role: vine.enum(['customer', 'professional']),
    })
)