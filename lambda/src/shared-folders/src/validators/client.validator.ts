import * as zod from 'zod'


export const ClientValidator = zod.object({
  businessname: zod.string().min(1),
  demographic1: zod.object({
    name: zod.string().min(1),
    values: zod.array(zod.string())
  }),
  demographic2: zod.object({
    name: zod.string().min(1),
    values: zod.array(zod.string())
  }),
  surveydescription: zod.string().min(1),
  surveythankyoumessage: zod.string().min(1),
  billingEmail: zod.string().min(1),
})