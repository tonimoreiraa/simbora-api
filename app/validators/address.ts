import vine from "@vinejs/vine";

export const createAddressSchema = vine.compile(
    vine.object({
        name: vine.string(),
        streetName: vine.string(),
        number: vine.string(),
        complement: vine.string().optional(),
        neighborhood: vine.string(),
        city: vine.string(),
        state: vine.string(),
        zipCode: vine.string(),
        country: vine.string().optional(),
    })
)