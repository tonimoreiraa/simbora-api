import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const createCouponValidator = vine.compile(
  vine.object({
    code: vine.string().trim().minLength(1).maxLength(50),
    description: vine.string().trim().minLength(1).maxLength(255),
    type: vine.enum(['percent', 'fixed', 'shipping']),
    value: vine.number().min(0),
    minOrderValue: vine.number().min(0).optional(),
    maxUses: vine.number().min(1),
    maxUsesPerUser: vine.number().min(1).optional(),
    validFrom: vine.date().transform((value) => DateTime.fromJSDate(value)),
    validUntil: vine.date().transform((value) => DateTime.fromJSDate(value)),
    active: vine.boolean().optional(),
    supplierId: vine.number().optional(),
    categoryId: vine.number().optional(),
  })
)

export const updateCouponValidator = vine.compile(
  vine.object({
    code: vine.string().trim().minLength(1).maxLength(50).optional(),
    description: vine.string().trim().minLength(1).maxLength(255).optional(),
    type: vine.enum(['percent', 'fixed', 'shipping']).optional(),
    value: vine.number().min(0).optional(),
    minOrderValue: vine.number().min(0).optional(),
    maxUses: vine.number().min(1).optional(),
    maxUsesPerUser: vine.number().min(1).optional(),
    validFrom: vine
      .date()
      .transform((value) => DateTime.fromJSDate(value))
      .optional(),
    validUntil: vine
      .date()
      .transform((value) => DateTime.fromJSDate(value))
      .optional(),
    active: vine.boolean().optional(),
    supplierId: vine.number().optional(),
    categoryId: vine.number().optional(),
  })
)
