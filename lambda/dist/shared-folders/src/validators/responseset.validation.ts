import * as zod from 'zod'

export const CreateSurveyRequestValidator = zod.object({
  surveytypeid: zod.string().min(1),
  openDate: zod.string().min(1),
  closeDate: zod.string().min(1),
  surveydescription: zod.string().min(1),
  surveythankyoumessage: zod.string().min(1),
})

