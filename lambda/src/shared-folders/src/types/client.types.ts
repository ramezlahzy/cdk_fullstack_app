import { DemographicType } from "./survey.types"


export interface Client {
  clientid: string
  name: string
  businessname: string
  taxid: string
  primarycontact: string
  logo: string
  demographic1: DemographicType
  demographic2: DemographicType
  surveydescription: string,
  surveythankyoumessage: string,
  billingEmail: string,
}


