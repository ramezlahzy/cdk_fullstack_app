
export interface Respondent {
  respondentid: string;
  email: string;
  clientid: string;
  firstName: string;
  lastName: string;
  contacthistory: Record<string, {
    datetime: string;
    medium: string;
  }>;
}

export interface GetRespondentsResponse {
  respondents: Respondent[];
}
