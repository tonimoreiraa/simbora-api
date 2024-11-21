import vine from '@vinejs/vine'

export const createProductSchema = vine.compile(
    vine.object({
        name: vine.string(),
        price: vine.number().positive(),
        description: vine.string(),
        supplierId: vine.number().positive()
            .exists(async (db, value) => !!(await db.query().select('id').from('suppliers').where('id', value).first())),
        categoryId: vine.number().positive()
            .exists(async (db, value) => !!(await db.query().select('id').from('categories').where('id', value).first())),
        tags: vine.string().optional().transform(t => t.split(',').map(v => v.trim())),
        stock: vine.number().positive().withoutDecimals().optional(),
        images: vine.array(
            vine.file({
                extnames: ['png', 'jpeg', 'jpg'],
                size: '2mb'
            })
        ).optional(),
        image: vine.file({
            extnames: ['png', 'jpeg', 'jpg'],
            size: '2mb'
        })
    })
)

export const updateProductSchema = vine.compile(
    vine.object({
        name: vine.string(),
        price: vine.number().positive(),
        description: vine.string(),
        supplierId: vine.number().positive()
            .exists(async (db, value) => !!(await db.query().select('id').from('suppliers').where('id', value).first())),
        categoryId: vine.number().positive()
            .exists(async (db, value) => !!(await db.query().select('id').from('categories').where('id', value).first())),
        tags: vine.array(vine.string()).nullable(),
        stock: vine.number().positive().withoutDecimals().optional(),
    })
)