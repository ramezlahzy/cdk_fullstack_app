// export type createSurveyResponse = z.infer<
//   typeof CreateSurveyRequestValidator
// >


export type sendEmailRequest = {
  emails: string[],
  surveyId: string
}

export type SurveyData = {
  [key: string]: string | number | undefined;
};

export type SurveyQuestion = {
  questionId: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
};

export type SurveySection = {
  sectionId: string;
  title: string;
  questions: SurveyQuestion[];
};

export type SurveyType = {
  surveytypeid: string;
  name: string;
  sections: SurveySection[];
};

export type ResponseSet = {
  responsesetid: string;
  openDate: string;
  closeDate: string;
  surveydescription: string;
  surveythankyoumessage: string;
  surveyType: SurveyType
  clientid: string;
  status: string;
  demographic1: DemographicType;
  demographic2: DemographicType;
  responsesCount?: number;
  surveyDemographics: {
    demographic1: {
      [key: string]: string
    }, demographic2: {
      [key: string]: string
    }
  }
}

export type DemographicType = {
  name: string;
  values: string[];
}