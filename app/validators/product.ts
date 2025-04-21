import vine from '@vinejs/vine'

const variantType = {
    variantTypeId: vine.number().positive()
        .exists(async (db, value) => !!(await db.query().select('id').from('product_variant_types').where('id', value).first())),
    value: vine.string(),
    unit: vine.string().optional(),
    price: vine.number().positive(),
    photo: vine.file({
        extnames: ['png', 'jpeg', 'jpg'],
        size: '2mb'
    }).optional(),
}

export const createProductVariantSchema = vine.compile(
    vine.object({
        ...variantType,
        productId: vine.number().positive()
            .exists(async (db, value) => !!(await db.query().select('id').from('products').where('id', value).first())),
    })
)

export const updateProductVariantSchema = vine.compile(
    vine.object({
        value: vine.string().optional(),
        unit: vine.string().optional(),
        price: vine.number().positive().optional(),
        photo: vine.file({
            extnames: ['png', 'jpeg', 'jpg'],
            size: '2mb'
        }).optional(),
    })
)

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
        }),
        variants: vine.array(
            vine.object(variantType)
        ).optional(),
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