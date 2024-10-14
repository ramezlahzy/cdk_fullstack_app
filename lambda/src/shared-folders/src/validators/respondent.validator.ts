import * as zod from 'zod'


export const CreateRespondentRequestValidator = zod.object({
  firstName: zod.string().min(3).max(255),
  lastName: zod.string().min(3).max(255),
  email: zod.string().email(),
})