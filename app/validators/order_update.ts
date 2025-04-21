import vine from '@vinejs/vine'

const orderStatuses = [
    "Pending",
    "Confirmed",
    "Processing",
    "On Hold",
    "Awaiting Payment",
    "Payment Received",
    "In Production",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Completed",
    "Cancelled",
    "Refunded",
    "Failed",
    "Returned",
    "Partially Shipped",
    "Backordered"
];

export const createOrderUpdateSchema = vine.compile(
    vine.object({
        orderId: vine.number()
            .exists(async (db, value) => !!(await db.query().select('id').from('orders').where('id', value).first())),
        status: vine.enum(orderStatuses),
        private: vine.boolean().optional(),
        onlyMe: vine.boolean().optional(),
        comment: vine.string().optional(),
        title: vine.string().optional(),
    })
)