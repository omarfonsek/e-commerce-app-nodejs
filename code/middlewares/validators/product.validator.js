const { z } = require('zod')

const createProductSchema = z.object({
    name: z
        .string({
            error: (err) => (err.input === undefined ? 'The field is mandatory' : 'The field must be a string')
        })
        .trim()
        .min(1, { error: 'The field is mandatory' })
        .max(255, { error: 'Maximum length of 255 characters' }),
    picture: z
        .url()
        .max(255)
        .optional()
        .nullable(),
    price: z.number().nonnegative({ error: 'The price cannot be negative' })
})

const updateProductSchema = createProductSchema
    .partial().superRefine((data, ctx) => {

        if (Object.keys(data).length === 0) {
            const message = 'Submit at least one field to update';
            ctx.addIssue({ message });
        }

    });

const idSchema = z
    .string()
    .regex(/^[1-9]\d{0,9}$/, { error: 'Must include only int numbers not starting with 0' })
    .transform(Number)
    .pipe(z.int32({ error: 'The value exceeds the range of integers' }))

const productIdParams = z.object({
    id: idSchema,
})

module.exports = { createProductSchema, updateProductSchema, productIdParams };