const AWS = require('aws-sdk');
const uuid = require('uuid');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { faker } = require('@faker-js/faker');
const { surveyTypes, clientData } = require('./assets/tables-data');
// import { DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
const { DeleteTableCommand } = require("@aws-sdk/client-dynamodb");
const { ScanCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { ExecuteStatementCommand } = require("@aws-sdk/lib-dynamodb");
// import {marshall} from "@aws-sdk/util-dynamodb";
const { marshall } = require("@aws-sdk/util-dynamodb");
const { PerformanceIndexId } = require('./assets/config');

// const docClient = new DynamoDBClient({ removeUndefinedValues: true });
const cognito = new AWS.CognitoIdentityServiceProvider();



exports.handler = async (event) => {
  const users = [];
  const surveys = []
  const respondents = [];
  const responseSets = [];
  const responses = [];
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  // console.log("tables names "+CLIENTS_TABLE,RESPONDENTS_TABLE,RESPONSES_TABLE,RESPONSE_SETS_TABLE,SURVEY_TYPES_TABLE,USERS_TABLE,RESPONDENT_SURVEY_TABLE);

  const query1 = "SELECT * FROM respondentTable";
  const respondentsQuery = new ExecuteStatementCommand({
    Statement: query1,
  });
  const query2 = "SELECT * FROM responseSetTable";
  const responseSetQuery = new ExecuteStatementCommand({
    Statement: query2,
  });
  for (let i = 1; i <= 100; i++) {
    const responseid = uuid.v4();
    const response = {
      responseid: responseid,
      responsesetid: PerformanceIndexId,
    }
    const responseContent = {

    }
    const responsesetid = PerformanceIndexId;
    const params = {
      TableName: 'responseSetTable',
      Key: {
        responsesetid
      }
    }
    const responseSetData = await docClient.send(new GetCommand(params));
    const surveytypeid = responseSetData.Item.surveytypeid


    const surveyTypeParams = {
      TableName: 'surveyTypeTable',
      Key: {
        surveytypeid
      }
    }
    const surveyTypeData = await docClient.send(new GetCommand(surveyTypeParams));
    console.log("surveyTypeData", surveyTypeData);
    const sections = surveyTypeData.Item.sections;
    console.log("responseSetData", responseSetData);

    const demographic1 = responseSetData.Item.demographic1.values;
    const demographic2 = responseSetData.Item.demographic2.values;
    
    responseContent["demographic1"] = demographic1[Math.floor(Math.random() * demographic1.length)];
    responseContent["demographic2"] = demographic2[Math.floor(Math.random() * demographic2.length)];
    responseContent["isExported"] = false;
    for (let i = 1; i < sections.length; i++) {
      const questions = sections[i].questions;
      for (let j = 0; j < questions.length; j++) {
        const question = questions[j];
        
        let answer = 'not answered'
        if (question.type === 'text') {
          answer = faker.lorem.sentence();
        } else if (question.type === 'rating') {
          answer = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        } else if (question.type === 'multiple-choice') {
          answer = question.options[Math.floor(Math.random() * question.options.length)]
        } else if (question.type === 'yes-no') {
          const options = ['Yes', 'No'];
          answer = options[Math.floor(Math.random() * options.length)];
        } else if (question.type === 'likert') {
          answer = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        } else if (question.type === 'open-ended') {
          answer = faker.lorem.sentence();
        }
        responseContent[question.questionId] = answer;
      }
    }
    // console.log("responseContent", responseContent);
    response.responseContent = responseContent;

    const responseCommand = new PutCommand({
      TableName: 'responseTable',
      Item: response
    });

    await docClient.send(responseCommand);



    // const surveyQuestions = surveys.find(surveyType => surveyType.surveytypeid === surveytypeid).surveyquestions;
    // const responseContent = {};
    // for (const key in surveyQuestions) {
    //   const question = surveyQuestions[key];
    //   let answer = 'not answered'
    //   if (question.type === 'text') {
    //     answer = faker.lorem.sentence();
    //   } else if (question.type === 'rating') {
    //     answer = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
    //   } else if (question.type === 'multiple-choice') {
    //     answer = question.options[Math.floor(Math.random() * question.options.length)]
    //   } else if (question.type === 'yes-no') {
    //     const options = ['Yes', 'No'];
    //     answer = options[Math.floor(Math.random() * options.length)];
    //   }
    //   responseContent[key] = answer;
    // }
    // responseContent["demographic1"] = ageGroups[Math.floor(Math.random() * ageGroups.length)];
    // responseContent["demographic2"] = incomeLevels[Math.floor(Math.random() * incomeLevels.length)];

    // responses.push(responseContent)
    // const responseData = {
    //   responseid: responseid,
    //   responsesetid: responsesetid,
    //   responsecontent: responseContent
    // };
    // responses.push(responseData);

    // const responseCommand = new PutCommand({
    //   TableName: RESPONSES_TABLE,
    //   Item: responseData
    // });

    // await docClient.send(responseCommand);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'All respondents and surveys connected successfully',
    }),
  }

  // {
  //   "respondentSurveyId": "unique-identifier-string", // Primary key
  //   "surveyid": "survey-identifier-string",           // ID of the associated survey
  //   "respondentid": "respondent-identifier-string",   // ID of the respondent
  //   "followUpTime": "2024-08-10T12:34:56Z",           // Date and time of follow-up action
  //   "followUpEmail": true                             // Flag indicating follow-up email status
  // }
  //connect all surveys with all respondents in RESPONDENT_SURVEY_TABLE table
  //loop on all respondents and all surveys and add them to RESPONDENT_SURVEY_TABLE
  // try {
  //   const respondentsData = await docClient.send(respondentsQuery);
  //   const responseSetsData = await docClient.send(responseSetQuery);
  //   const respondentsItems = respondentsData.Items;
  //   console.log("respondentsItems", respondentsItems);
  //   console.log("responseSetsData", responseSetsData);
  //   const responseSetsItems = responseSetsData.Items;
  //   for (let i = 0; i < respondentsItems.length; i++) {
  //     for (let j = 0; j < responseSetsItems.length; j++) {
  //       const respondentSurveyId = uuid.v4();
  //       const surveyid = responseSetsItems[j].responsesetid;
  //       const respondentid = respondentsItems[i].respondentid;
  //       const followUpTime = faker.date.future(1).toISOString();
  //       const followUpEmail = false;
  //       const respondentSurveyData = {
  //         respondentSurveyId,
  //         surveyid,
  //         respondentid,
  //         followUpTime,
  //         followUpEmail
  //       };
  //       console.log("respondentSurveyData", respondentSurveyData);
  //       const respondentSurveyCommand = new PutCommand({
  //         TableName: 'respondentSurveyTable',
  //         Item: respondentSurveyData
  //       });
  //       await docClient.send(respondentSurveyCommand);
  //     }
  //   }
  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({
  //       message: 'All respondents and surveys connected successfully',
  //       respondentsItems,
  //       responseSetsItems
  //     }),
  //   };
  // }
  // catch (error) {
  //   return {
  //     statusCode: 500, body: JSON.stringify({
  //       message: error.message,
  //     })
  //   };
  // }




  // try {

  //   const tableNames = [
  //     CLIENTS_TABLE,
  //     RESPONDENTS_TABLE,
  //     RESPONSES_TABLE,
  //     RESPONSE_SETS_TABLE,
  //     SURVEY_TYPES_TABLE,
  //     USERS_TABLE,
  //   ];



  //   const clientid = uuid.v4();
  //   clientData.clientid = clientid;

  //   const clientCommand = new PutCommand({
  //     TableName: CLIENTS_TABLE,
  //     Item: clientData
  //   });

  //   await docClient.send(clientCommand);

  //   // const clientid = '139b4a90-f560-4275-89aa-24989a20f4ec'
  //   for (let i = 1; i <= 30; i++) {
  //     let userid = uuid.v4();
  //     const name = faker.person.fullName();
  //     const firstName = name.split(' ')[0];
  //     const lastName = name.split(' ')[1];
  //     let email = faker.internet.email(name.split(' ')[0]);
  //     const statusOptions = ['Active', 'Inactive', 'Never Signed In']
  //     if (i === 1) {
  //       email = 'rameznashaat9999@gmail.com';
  //       userid = clientid
  //     }
  //     const userData = {
  //       userid,
  //       firstName,
  //       lastName,
  //       email,
  //       clientid,
  //       accesslevel: "admin",
  //       status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
  //     };

  //     const userCommand = new PutCommand({
  //       TableName: USERS_TABLE,
  //       Item: userData
  //     });
  //     await docClient.send(userCommand);

  //     const cognitoParams = {
  //       UserPoolId: 'ap-southeast-2_RIbd7Vx4Q',
  //       Username: email,
  //       TemporaryPassword: '12345678',
  //       MessageAction: 'SUPPRESS',
  //       UserAttributes: [
  //         { Name: 'email', Value: email },  // Required attribute
  //       ]
  //     };

  //     await cognito.adminCreateUser(cognitoParams).promise();
  //   }

  //   for (let i = 0; i < 10; i++) {
  //     const surveytypeid = uuid.v4();
  //     const surveyTypeData = {
  //       surveytypeid,
  //       ...surveyTypes[i % surveyTypes.length]
  //     };

  //     const surveyTypeCommand = new PutCommand({
  //       TableName: SURVEY_TYPES_TABLE,
  //       Item: surveyTypeData
  //     });

  //     await docClient.send(surveyTypeCommand);
  //     surveys.push(surveyTypeData);
  //   }

  //   for (let i = 1; i <= 20; i++) {
  //     const respondentid = uuid.v4();
  //     const email = faker.internet.email();
  //     const firstName = faker.person.firstName();
  //     const lastName = faker.person.lastName();
  //     const responsesetid = uuid.v4(); // You may generate response set ids based on your logic
  //     const contactHistory = {
  //       contact1: {
  //         medium: "SMS",
  //         datetime: faker.date.recent(10).toISOString(),
  //       },
  //       contact2: {
  //         medium: "email",
  //         datetime: faker.date.recent(5).toISOString(),
  //       }
  //     };

  //     const respondentData = {
  //       respondentid,
  //       clientid,
  //       responsesetid,
  //       email,
  //       firstName,
  //       lastName,
  //       contacthistory: contactHistory
  //     };

  //     const respondentCommand = new PutCommand({
  //       TableName: RESPONDENTS_TABLE,
  //       Item: respondentData
  //     });

  //     await docClient.send(respondentCommand);
  //     respondents.push(respondentData);
  //   }

  //   const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55+"];
  //   const incomeLevels = ["< $20k", "$20k-$50k", "$50k-$100k", ">$100k"];
  //   for (let i = 1; i <= 20; i++) {
  //     const responsesetid = uuid.v4();
  //     const surveytypeid = surveys[i % surveys.length].surveytypeid;
  //     const surveyTitle = faker.lorem.sentence();
  //     const surveyDescription = faker.lorem.paragraph();
  //     const surveyThankYouMessage = "Thank you for completing the survey!";
  //     let option = ['Open', 'Closed Auto', 'Closed Manual']


  //     const responseSetData = {
  //       responsesetid,
  //       surveytypeid,
  //       clientid,
  //       surveytitle: surveyTitle,
  //       surveydescription: surveyDescription,
  //       surveythankyoumessage: surveyThankYouMessage,
  //       openDate: faker.date.recent(10).toISOString(),
  //       closeDate: faker.date.recent(5).toISOString(),
  //       status: option[i % option.length],

  //       demographic1: {
  //         name: "Age Group",
  //         values: ageGroups
  //       },
  //       demographic2: {
  //         name: "Income Level",
  //         values: incomeLevels
  //       }
  //     };
  //     marshall(responseSetData);

  //     const responseSetCommand = new PutCommand({
  //       TableName: RESPONSE_SETS_TABLE,
  //       Item: responseSetData
  //     });
  //     responseSets.push(responseSetData);

  //     await docClient.send(responseSetCommand);
  //   }


  // for (let i = 1; i <= 100; i++) {
  //   const responseid = uuid.v4();
  //   const responsesetid = responseSets[i % responseSets.length].responsesetid;
  //   const surveytypeid = responseSets[i % responseSets.length].surveytypeid;

  //   const surveyQuestions = surveys.find(surveyType => surveyType.surveytypeid === surveytypeid).surveyquestions;
  //   const responseContent = {};
  //   for (const key in surveyQuestions) {
  //     const question = surveyQuestions[key];
  //     let answer = 'not answered'
  //     if (question.type === 'text') {
  //       answer = faker.lorem.sentence();
  //     } else if (question.type === 'rating') {
  //       answer = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
  //     } else if (question.type === 'multiple-choice') {
  //       answer = question.options[Math.floor(Math.random() * question.options.length)]
  //     } else if (question.type === 'yes-no') {
  //       const options = ['Yes', 'No'];
  //       answer = options[Math.floor(Math.random() * options.length)];
  //     }
  //     responseContent[key] = answer;
  //   }
  //   responseContent["demographic1"] = ageGroups[Math.floor(Math.random() * ageGroups.length)];
  //   responseContent["demographic2"] = incomeLevels[Math.floor(Math.random() * incomeLevels.length)];

  //   responses.push(responseContent)
  //   const responseData = {
  //     responseid: responseid,
  //     responsesetid: responsesetid,
  //     responsecontent: responseContent
  //   };
  //   responses.push(responseData);

  //   const responseCommand = new PutCommand({
  //     TableName: RESPONSES_TABLE,
  //     Item: responseData
  //   });

  //   await docClient.send(responseCommand);
  // }


  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify({
  //       message: 'Client and users added successfully',
  //       clientid,
  //       users,
  //       surveys,
  //       respondents,
  //       responseSets,
  //       responses
  //     }),
  //   };

  // } catch (error) {
  //   return {
  //     statusCode: 500, body: JSON.stringify({
  //       message: error.message,
  //       clientData,
  //       users,
  //       surveys,
  //       respondents,
  //       responseSets,
  //       responses

  //     })
  //   };
  // }
};
