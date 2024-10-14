import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { aws_apigatewayv2 as APIGateway } from 'aws-cdk-lib';
import { TableV2, AttributeType, Billing } from 'aws-cdk-lib/aws-dynamodb';

export const createClientTable = (scope: Construct) => new TableV2(scope, 'clientTable', {
  partitionKey: { name: 'clientid', type: AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevents table from being deleted
  tableName: 'clientTable',
  billing: Billing.onDemand(),
  globalSecondaryIndexes: [
    {
      indexName: 'nameIndex',
      partitionKey: { name: 'name', type: AttributeType.STRING }
    }
  ]
});
  // DynamoDB Table Schema: clientTable
  // =======================================
  // Table Name: clientTable
  //
  // Schema Description:
  // This table stores information about clients in the system. Each client is uniquely identified by the clientid. 
  // The table includes fields for the client's business name, tax ID, primary contact (linked to a user), logo, 
  // and demographic information. Additionally, a global secondary index (GSI) is provided to allow quick lookups 
  // based on the client's name.
  //
  // Attributes:
  // -----------
  // - Partition Key (Primary Key): clientid (STRING)
  //   - Description: Unique identifier for each client.
  //
  // - name (STRING)
  //   - Description: The name of the client, typically the business or organization name. Indexed for efficient querying.
  //
  // - businessname (STRING)
  //   - Description: The official business name of the client.
  //
  // - taxid (STRING)
  //   - Description: The tax identification number of the client.
  //
  // - primarycontact (STRING)
  //   - Description: The user ID of the primary contact person for this client. This should link to an entry in the userTable.
  //
  // - logo (STRING)
  //   - Description: A URL or path to the client's logo image.
  //
  // - demographic1 (MAP)
  //   - Description: A map representing the first demographic category associated with the client, containing a name 
  //     and an array of possible values or options.
  //   - Structure:
  //     {
  //       "name": "Demographic Category Name",        // e.g., "Industry Type"
  //       "values": ["Option1", "Option2", "Option3"] // e.g., ["Retail", "Manufacturing", "Services"]
  //     }
  //
  // - demographic2 (MAP)
  //   - Description: A map representing the second demographic category associated with the client, with a similar structure 
  //     to demographic1.
  //   - Structure:
  //     {
  //       "name": "Demographic Category Name",        // e.g., "Company Size"
  //       "values": ["Option1", "Option2", "Option3"] // e.g., ["Small", "Medium", "Large"]
  //     }
  //
  // Global Secondary Index (GSI):
  // -----------------------------
  // - Index Name: nameIndex
  //   - Partition Key: name (STRING)
  //   - Description: This index allows for efficient querying of clients based on their name. It provides 
  //     an alternative access pattern, enabling searches by client name instead of the clientid.
  //
  // Example Item Structure:
  // -----------------------
  // {
  //   "clientid": "unique-client-identifier",           // Primary key
  //   "name": "Acme Corporation",                       // Name of the client (business or organization name)
  //   "businessname": "Acme Corporation LLC",           // Official business name
  //   "taxid": "123-45-6789",                           // Tax identification number
  //   "primarycontact": "user-identifier",              // User ID of the primary contact person
  //   "logo": "https://example.com/logos/acme-logo.png",// URL to the client's logo image
  //   "demographic1": {
  //     "name": "Industry Type",                        // Name of the first demographic category
  //     "values": ["Retail", "Manufacturing", "Services"] // Possible options for this category
  //   },
  //   "demographic2": {
  //     "name": "Company Size",                         // Name of the second demographic category
  //     "values": ["Small", "Medium", "Large"]          // Possible options for this category
  //   }
  // }




  export const createUserTable = (scope: Construct) => new TableV2(scope, 'userTable', {
    partitionKey: { name: 'userid', type: AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevents table from being deleted
    tableName: 'userTable',
    billing: Billing.onDemand(),
    globalSecondaryIndexes: [
      {
        indexName: 'emailIndex',
        partitionKey: { name: 'email', type: AttributeType.STRING }
      },
      {
        indexName: 'clientidIndex',
        partitionKey: { name: 'clientid', type: AttributeType.STRING }
      }
    ]
  });
  // DynamoDB Table Schema: userTable
  // =======================================
  // Table Name: userTable
  //
  // Schema Description:
  // This table stores information about users in the system. Each user is uniquely identified by the userid. 
  // The table includes fields for the user's name, email, client ID, and access level. Additionally, global 
  // secondary indexes (GSIs) are provided to allow quick lookups based on email and client ID.
  //
  // Attributes:
  // -----------
  // - Partition Key (Primary Key): userid (STRING)
  //   - Description: Unique identifier for each user.
  //
  // - name (STRING)
  //   - Description: The full name of the user.
  //
  // - email (STRING)
  //   - Description: The email address of the user, which is indexed for efficient querying.
  //
  // - clientid (STRING)
  //   - Description: The ID of the client that the user is associated with, which is also indexed for efficient querying.
  //
  // - accesslevel (STRING)
  //   - Description: The access level of the user, which determines their permissions and roles within the system. 
  //     Examples might include "admin", "editor", "viewer", etc.
  //
  // Global Secondary Indexes (GSIs):
  // --------------------------------
  // - Index Name: emailIndex
  //   - Partition Key: email (STRING)
  //   - Description: This index allows for efficient querying of users based on their email address. It provides 
  //     an alternative access pattern, enabling searches by email instead of the userid.
  //
  // - Index Name: clientidIndex
  //   - Partition Key: clientid (STRING)
  //   - Description: This index allows for efficient querying of users based on the client they are associated with. 
  //     It provides an alternative access pattern, enabling searches by client ID instead of the userid.
  //
  // Example Item Structure:
  // -----------------------
  // {
  //   "userid": "unique-user-identifier",               // Primary key
  //   "name": "John Doe",                               // Full name of the user
  //   "email": "user@example.com",                      // Email address of the user
  //   "clientid": "client-identifier",                  // ID of the associated client
  //   "accesslevel": "admin"                            // Access level of the user
  // }




  export const createSurveyTypeTable = (scope: Construct) => new TableV2(scope, 'surveyTypeTable', {
    partitionKey: { name: 'surveytypeid', type: AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevents table from being deleted
    tableName: 'surveyTypeTable',
    billing: Billing.onDemand(),
    globalSecondaryIndexes: [
      {
        indexName: 'nameIndex',
        partitionKey: { name: 'name', type: AttributeType.STRING }
      }
    ]
  });
  // DynamoDB Table Schema: surveyTypeTable
  // =======================================
  // Table Name: surveyTypeTable
  //
  // Schema Description:
  // This table stores different types of surveys that can be created or used in the system. Each survey type 
  // is uniquely identified by the surveytypeid. The table also includes a map that contains a collection of 
  // survey questions, where each question has a text and a type. Additionally, a global secondary index (GSI) 
  // is provided to allow quick lookups based on the name of the survey type.
  //
  // Attributes:
  // -----------
  // - Partition Key (Primary Key): surveytypeid (STRING)
  //   - Description: Unique identifier for each survey type.
  //
  // - name (STRING)
  //   - Description: The name of the survey type, which can be used to identify and categorize different 
  //     types of surveys.
  //
  // - surveyquestions (MAP)
  //   - Description: A map containing a collection of survey questions, where each question has a text 
  //     and a type.
  //   - Structure:
  //     {
  //       "question1": {
  //         "question": "What is your level of satisfaction with our service?",  // The question text
  //         "type": "multiple-choice"                                            // The question type (e.g., multiple-choice, text)
  //       },
  //       "question2": {
  //         "question": "How likely are you to recommend us to a friend?",
  //         "type": "rating"
  //       },
  //       // Additional questions can be added as new entries in the map
  //     }
  //
  // Global Secondary Index (GSI):
  // -----------------------------
  // - Index Name: nameIndex
  //   - Partition Key: name (STRING)
  //   - Description: This index allows for efficient querying of survey types based on their name. It provides 
  //     an alternative access pattern, enabling searches by survey name instead of the surveytypeid.
  //
  // Example Item Structure:
  // -----------------------
  // {
  //   "surveytypeid": "unique-survey-type-identifier",   // Primary key
  //   "name": "Customer Satisfaction Survey",            // Name of the survey type
  //   "surveyquestions": {
  //     "question1": {
  //       "question": "What is your level of satisfaction with our service?",  // Question text
  //       "type": "multiple-choice"                                            // Question type
  //     },
  //     "question2": {
  //       "question": "How likely are you to recommend us to a friend?",       // Question text
  //       "type": "rating"                                                     // Question type
  //     }
  //   }
  // }




  export const createRespondentTable = (scope: Construct) => new TableV2(scope, 'respondentTable', {
    partitionKey: { name: 'respondentid', type: AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevents table from being deleted
    tableName: 'respondentTable',
    billing: Billing.onDemand()
  });
  // DynamoDB Table Schema: respondentTable
  // =======================================
  // Table Name: respondentTable
  //
  // Schema Description:
  // This table stores information about respondents, who are individuals or entities that participate 
  // in surveys. Each respondent is uniquely identified by the respondentid. The table also includes fields 
  // for tracking which client and response set the respondent is associated with, as well as their email address. 
  // Additionally, it maintains a history of all contacts made with the respondent regarding the survey.
  //
  // Attributes:
  // -----------
  // - Partition Key (Primary Key): respondentid (STRING)
  //   - Description: Unique identifier for each respondent.
  //
  // - clientid (STRING)
  //   - Description: The ID of the client associated with this respondent.
  //
  // - responsesetid (STRING)
  //   - Description: The ID of the response set associated with this respondent.
  //
  // - email (STRING)
  //   - Description: The email address of the respondent.
  //
  // - contacthistory (MAP)
  //   - Description: A map containing a history of contacts made with the respondent regarding the survey. 
  //     Each contact entry records the medium (e.g., SMS, email, phone call) and the date and time of the contact.
  //   - Structure:
  //     {
  //       "contact1": {
  //         "medium": "SMS",
  //         "datetime": "2024-08-10T12:34:56Z"
  //       },
  //       "contact2": {
  //         "medium": "email",
  //         "datetime": "2024-08-11T09:15:00Z"
  //       }
  //       // Additional contacts can be added as new entries in the map
  //     }
  //
  // Example Item Structure:
  // -----------------------
  // {
  //   "respondentid": "unique-identifier-string",     // Primary key
  //   "clientid": "client-identifier-string",         // ID of the associated client
  //   "responsesetid": "response-set-identifier-string", // ID of the associated response set
  //   "email": "respondent@example.com",              // Email address of the respondent
  //   "contacthistory": {
  //     "contact1": {
  //       "medium": "SMS",                            // Medium used for contact (e.g., SMS)
  //       "datetime": "2024-08-10T12:34:56Z"          // Date and time of the contact
  //     },
  //     "contact2": {
  //       "medium": "email",                          // Medium used for contact (e.g., email)
  //       "datetime": "2024-08-11T09:15:00Z"          // Date and time of the contact
  //     }
  //   }
  // }




  export const createResponseSetTable = (scope: Construct) => new TableV2(scope, 'responseSetTable', {
    partitionKey: { name: 'responsesetid', type: AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevents table from being deleted
    tableName: 'responseSetTable',
    billing: Billing.onDemand()
  });
  // DynamoDB Table Schema: responseSetTable
  // =======================================
  // Table Name: responseSetTable
  //
  // Schema Description:
  // This table stores response sets, which are collections of responses associated with surveys. 
  // Each response set is uniquely identified by the responsesetid. The table also includes various 
  // fields that capture metadata about the survey and client, as well as detailed demographic data.
  //
  // Attributes:
  // -----------
  // - Partition Key (Primary Key): responsesetid (STRING)
  //   - Description: Unique identifier for each response set.
  //
  // - surveyid (STRING)
  //   - Description: The ID of the survey associated with this response set.
  //
  // - clientid (STRING)
  //   - Description: The ID of the client associated with this response set.
  //
  // - surveytitle (STRING)
  //   - Description: The title of the survey associated with this response set.
  //
  // - surveydescription (STRING)
  //   - Description: A brief description of the survey associated with this response set.
  //
  // - surveythankyoumessage (STRING)
  //   - Description: The thank-you message displayed upon completion of the survey.
  //
  // - demographic1 (MAP)
  //   - Description: A nested object representing the first demographic category, which includes a name 
  //     and an array of possible values or options.
  //   - Structure:
  //     {
  //       "name": "Demographic Category Name",        // e.g., "Age Group"
  //       "values": ["Option1", "Option2", "Option3"] // e.g., ["18-24", "25-34", "35-44"]
  //     }
  //
  // - demographic2 (MAP)
  //   - Description: A nested object representing the second demographic category, with a similar structure 
  //     to demographic1.
  //   - Structure:
  //     {
  //       "name": "Demographic Category Name",        // e.g., "Income Level"
  //       "values": ["Option1", "Option2", "Option3"] // e.g., ["< $20k", "$20k-$50k", "$50k-$100k"]
  //     }
  //
  // Example Item Structure:
  // -----------------------
  // {
  //   "responsesetid": "unique-identifier-string",   // Primary key
  //   "surveyid": "survey-identifier-string",        // ID of the associated survey
  //   "clientid": "client-identifier-string",        // ID of the associated client
  //   "surveytitle": "Survey Title",                 // Title of the survey
  //   "surveydescription": "Description of the survey",  // Survey description
  //   "surveythankyoumessage": "Thank you for completing the survey!", // Thank-you message
  //   "demographic1": {
  //     "name": "Age Group",                         // Name of the demographic category
  //     "values": ["18-24", "25-34", "35-44"]        // Possible options for this category
  //   },
  //   "demographic2": {
  //     "name": "Income Level",                      // Name of the demographic category
  //     "values": ["< $20k", "$20k-$50k", "$50k-$100k"] // Possible options for this category
  //   }
  // }




  export const createResponseTable = (scope: Construct) => new TableV2(scope, 'responseTable', {
    partitionKey: { name: 'responseid', type: AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevents table from being deleted
    tableName: 'responseTable',
    billing: Billing.onDemand()
  });
  // DynamoDB Table Schema: responseTable
  // =======================================
  // Table Name: responseTable
  //
  // Schema Description:
  // This table stores individual responses submitted by respondents as part of a survey. Each response 
  // is uniquely identified by the responseid. The table may also include additional fields to capture 
  // the associated respondent, response set, and the content of the response itself.
  //
  // Attributes:
  // -----------
  // - Partition Key (Primary Key): responseid (STRING)
  //   - Description: Unique identifier for each individual response.
  //
  // Additional Fields (Examples):
  // -----------------------------
  // The following fields could be included depending on the application needs:
  //
  // - responsesetid (STRING)
  //   - Description: The ID of the response set associated with this response.
  //
  // - respondentid (STRING)
  //   - Description: The ID of the respondent who submitted this response.
  //
  // - surveyid (STRING)
  //   - Description: The ID of the survey associated with this response.
  //
  // - responsecontent (MAP)
  //   - Description: A map containing the actual content of the response, typically structured as a 
  //     series of question-and-answer pairs.
  //   - Structure:
  //     {
  //       "question1": "Answer to question 1",
  //       "question2": "Answer to question 2",
  //       ...
  //     }
  //
  // Example Item Structure:
  // -----------------------
  // {
  //   "responseid": "unique-response-identifier",      // Primary key
  //   "responsesetid": "response-set-identifier",      // ID of the associated response set
  //   "respondentid": "respondent-identifier",         // ID of the respondent who submitted the response
  //   "surveyid": "survey-identifier",                 // ID of the associated survey
  //   "responsecontent": {
  //     "question1": "Yes",                            // Example answer to the first question
  //     "question2": "No",                             // Example answer to the second question
  //     // Additional questions and answers as needed
  //   }
  // }

  export const createRespondentSurveyTable = (scope: Construct) => new TableV2(scope, 'respondentSurveyTable', {
    partitionKey: { name: 'respondentSurveyId', type: AttributeType.STRING },
    sortKey: { name: 'surveyid', type: AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.RETAIN,
    tableName: 'respondentSurveyTable',
    billing: Billing.onDemand(),
    globalSecondaryIndexes: [
      {
        indexName: 'respondentIndex',
        partitionKey: { name: 'respondentid', type: AttributeType.STRING }, // GSI for respondentid
        sortKey: { name: 'surveyid', type: AttributeType.STRING },
      },
    ],
  });
    // DynamoDB Table Schema: respondentSurveyTable
  // =======================================
  // Table Name: respondentSurveyTable
  //
  // Schema Description:
  // This table stores information about the relationship between respondents and surveys. Each entry in
  // the table represents a respondent's participation in a specific survey. The primary key consists of
  // the respondentid and surveyid, which uniquely identify the respondent-survey relationship.
  //
  // Attributes:
  // -----------
  // - Partition Key (Primary Key): respondentSurveyId (STRING)
  //   - Description: Unique identifier for each respondent-survey pair.
  //
  // - Sort Key: surveyid (STRING)
  //   - Description: The ID of the survey associated with this respondent-survey pair.

  //
  // Additional Attributes (Optional):
  // ---------------------------------
  // The following attributes can be added based on the application requirements:
  //
  // - followUpTime (STRING)
  //   - Description: The date and time of the follow-up action for this respondent-survey pair.
  //
  // - followUpEmail (BOOLEAN)
  //   - Description: A boolean flag indicating whether a follow-up email was sent to the respondent.
  //
  // Example Item Structure:
  // -----------------------
  // {
  //   "respondentSurveyId": "unique-identifier-string", // Primary key
  //   "surveyid": "survey-identifier-string",           // ID of the associated survey
  //   "respondentid": "respondent-identifier-string",   // ID of the respondent
  //   "followUpTime": "2024-08-10T12:34:56Z",           // Date and time of follow-up action
  //   "followUpEmail": true                             // Flag indicating follow-up email status
  // }
  



// import * as cdk from 'aws-cdk-lib';
// import { Construct } from 'constructs';
// import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
// import { aws_apigatewayv2 as APIGateway } from 'aws-cdk-lib';
// import { TableV2, AttributeType, Billing } from 'aws-cdk-lib/aws-dynamodb';

// export const createClientTable = (scope: Construct) => new TableV2(scope, 'clientTable', {
//   partitionKey: { name: 'clientid', type: AttributeType.STRING },
//   removalPolicy: cdk.RemovalPolicy.DESTROY,
//   tableName: 'clientTable',
//   billing: Billing.onDemand(),
//   globalSecondaryIndexes: [
//     {
//       indexName: 'nameIndex',
//       partitionKey: { name: 'name', type: AttributeType.STRING }
//     }
//   ]
// });
//   // DynamoDB Table Schema: clientTable
//   // =======================================
//   // Table Name: clientTable
//   //
//   // Schema Description:
//   // This table stores information about clients in the system. Each client is uniquely identified by the clientid. 
//   // The table includes fields for the client's business name, tax ID, primary contact (linked to a user), logo, 
//   // and demographic information. Additionally, a global secondary index (GSI) is provided to allow quick lookups 
//   // based on the client's name.
//   //
//   // Attributes:
//   // -----------
//   // - Partition Key (Primary Key): clientid (STRING)
//   //   - Description: Unique identifier for each client.
//   //
//   // - name (STRING)
//   //   - Description: The name of the client, typically the business or organization name. Indexed for efficient querying.
//   //
//   // - businessname (STRING)
//   //   - Description: The official business name of the client.
//   //
//   // - taxid (STRING)
//   //   - Description: The tax identification number of the client.
//   //
//   // - primarycontact (STRING)
//   //   - Description: The user ID of the primary contact person for this client. This should link to an entry in the userTable.
//   //
//   // - logo (STRING)
//   //   - Description: A URL or path to the client's logo image.
//   //
//   // - demographic1 (MAP)
//   //   - Description: A map representing the first demographic category associated with the client, containing a name 
//   //     and an array of possible values or options.
//   //   - Structure:
//   //     {
//   //       "name": "Demographic Category Name",        // e.g., "Industry Type"
//   //       "values": ["Option1", "Option2", "Option3"] // e.g., ["Retail", "Manufacturing", "Services"]
//   //     }
//   //
//   // - demographic2 (MAP)
//   //   - Description: A map representing the second demographic category associated with the client, with a similar structure 
//   //     to demographic1.
//   //   - Structure:
//   //     {
//   //       "name": "Demographic Category Name",        // e.g., "Company Size"
//   //       "values": ["Option1", "Option2", "Option3"] // e.g., ["Small", "Medium", "Large"]
//   //     }
//   //
//   // Global Secondary Index (GSI):
//   // -----------------------------
//   // - Index Name: nameIndex
//   //   - Partition Key: name (STRING)
//   //   - Description: This index allows for efficient querying of clients based on their name. It provides 
//   //     an alternative access pattern, enabling searches by client name instead of the clientid.
//   //
//   // Example Item Structure:
//   // -----------------------
//   // {
//   //   "clientid": "unique-client-identifier",           // Primary key
//   //   "name": "Acme Corporation",                       // Name of the client (business or organization name)
//   //   "businessname": "Acme Corporation LLC",           // Official business name
//   //   "taxid": "123-45-6789",                           // Tax identification number
//   //   "primarycontact": "user-identifier",              // User ID of the primary contact person
//   //   "logo": "https://example.com/logos/acme-logo.png",// URL to the client's logo image
//   //   "demographic1": {
//   //     "name": "Industry Type",                        // Name of the first demographic category
//   //     "values": ["Retail", "Manufacturing", "Services"] // Possible options for this category
//   //   },
//   //   "demographic2": {
//   //     "name": "Company Size",                         // Name of the second demographic category
//   //     "values": ["Small", "Medium", "Large"]          // Possible options for this category
//   //   }
//   // }




//   export const createUserTable = (scope: Construct) => new TableV2(scope, 'userTable', {
//     partitionKey: { name: 'userid', type: AttributeType.STRING },
//     removalPolicy: cdk.RemovalPolicy.DESTROY,
//     tableName: 'userTable',
//     billing: Billing.onDemand(),
//     globalSecondaryIndexes: [
//       {
//         indexName: 'emailIndex',
//         partitionKey: { name: 'email', type: AttributeType.STRING }
//       },
//       {
//         indexName: 'clientidIndex',
//         partitionKey: { name: 'clientid', type: AttributeType.STRING }
//       }
//     ]
//   });
//   // DynamoDB Table Schema: userTable
//   // =======================================
//   // Table Name: userTable
//   //
//   // Schema Description:
//   // This table stores information about users in the system. Each user is uniquely identified by the userid. 
//   // The table includes fields for the user's name, email, client ID, and access level. Additionally, global 
//   // secondary indexes (GSIs) are provided to allow quick lookups based on email and client ID.
//   //
//   // Attributes:
//   // -----------
//   // - Partition Key (Primary Key): userid (STRING)
//   //   - Description: Unique identifier for each user.
//   //
//   // - name (STRING)
//   //   - Description: The full name of the user.
//   //
//   // - email (STRING)
//   //   - Description: The email address of the user, which is indexed for efficient querying.
//   //
//   // - clientid (STRING)
//   //   - Description: The ID of the client that the user is associated with, which is also indexed for efficient querying.
//   //
//   // - accesslevel (STRING)
//   //   - Description: The access level of the user, which determines their permissions and roles within the system. 
//   //     Examples might include "admin", "editor", "viewer", etc.
//   //
//   // Global Secondary Indexes (GSIs):
//   // --------------------------------
//   // - Index Name: emailIndex
//   //   - Partition Key: email (STRING)
//   //   - Description: This index allows for efficient querying of users based on their email address. It provides 
//   //     an alternative access pattern, enabling searches by email instead of the userid.
//   //
//   // - Index Name: clientidIndex
//   //   - Partition Key: clientid (STRING)
//   //   - Description: This index allows for efficient querying of users based on the client they are associated with. 
//   //     It provides an alternative access pattern, enabling searches by client ID instead of the userid.
//   //
//   // Example Item Structure:
//   // -----------------------
//   // {
//   //   "userid": "unique-user-identifier",               // Primary key
//   //   "name": "John Doe",                               // Full name of the user
//   //   "email": "user@example.com",                      // Email address of the user
//   //   "clientid": "client-identifier",                  // ID of the associated client
//   //   "accesslevel": "admin"                            // Access level of the user
//   // }




//   export const createSurveyTypeTable = (scope: Construct) => new TableV2(scope, 'surveyTypeTable', {
//     partitionKey: { name: 'surveytypeid', type: AttributeType.STRING },
//     removalPolicy: cdk.RemovalPolicy.DESTROY,
//     tableName: 'surveyTypeTable',
//     billing: Billing.onDemand(),
//     globalSecondaryIndexes: [
//       {
//         indexName: 'nameIndex',
//         partitionKey: { name: 'name', type: AttributeType.STRING }
//       }
//     ]
//   });
//   // DynamoDB Table Schema: surveyTypeTable
//   // =======================================
//   // Table Name: surveyTypeTable
//   //
//   // Schema Description:
//   // This table stores different types of surveys that can be created or used in the system. Each survey type 
//   // is uniquely identified by the surveytypeid. The table also includes a map that contains a collection of 
//   // survey questions, where each question has a text and a type. Additionally, a global secondary index (GSI) 
//   // is provided to allow quick lookups based on the name of the survey type.
//   //
//   // Attributes:
//   // -----------
//   // - Partition Key (Primary Key): surveytypeid (STRING)
//   //   - Description: Unique identifier for each survey type.
//   //
//   // - name (STRING)
//   //   - Description: The name of the survey type, which can be used to identify and categorize different 
//   //     types of surveys.
//   //
//   // - surveyquestions (MAP)
//   //   - Description: A map containing a collection of survey questions, where each question has a text 
//   //     and a type.
//   //   - Structure:
//   //     {
//   //       "question1": {
//   //         "question": "What is your level of satisfaction with our service?",  // The question text
//   //         "type": "multiple-choice"                                            // The question type (e.g., multiple-choice, text)
//   //       },
//   //       "question2": {
//   //         "question": "How likely are you to recommend us to a friend?",
//   //         "type": "rating"
//   //       },
//   //       // Additional questions can be added as new entries in the map
//   //     }
//   //
//   // Global Secondary Index (GSI):
//   // -----------------------------
//   // - Index Name: nameIndex
//   //   - Partition Key: name (STRING)
//   //   - Description: This index allows for efficient querying of survey types based on their name. It provides 
//   //     an alternative access pattern, enabling searches by survey name instead of the surveytypeid.
//   //
//   // Example Item Structure:
//   // -----------------------
//   // {
//   //   "surveytypeid": "unique-survey-type-identifier",   // Primary key
//   //   "name": "Customer Satisfaction Survey",            // Name of the survey type
//   //   "surveyquestions": {
//   //     "question1": {
//   //       "question": "What is your level of satisfaction with our service?",  // Question text
//   //       "type": "multiple-choice"                                            // Question type
//   //     },
//   //     "question2": {
//   //       "question": "How likely are you to recommend us to a friend?",       // Question text
//   //       "type": "rating"                                                     // Question type
//   //     }
//   //   }
//   // }




//   export const createRespondentTable = (scope: Construct) => new TableV2(scope, 'respondentTable', {
//     partitionKey: { name: 'respondentid', type: AttributeType.STRING },
//     removalPolicy: cdk.RemovalPolicy.DESTROY,
//     tableName: 'respondentTable',
//     billing: Billing.onDemand(),
//     globalSecondaryIndexes: [
//       {
//         indexName: 'responsesetidIndex',
//         partitionKey: { name: 'responsesetid', type: AttributeType.STRING }
//       }
//     ]
//   });
//   // DynamoDB Table Schema: respondentTable
//   // =======================================
//   // Table Name: respondentTable
//   //
//   // Schema Description:
//   // This table stores information about respondents, who are individuals or entities that participate 
//   // in surveys. Each respondent is uniquely identified by the respondentid. The table also includes fields 
//   // for tracking which client and response set the respondent is associated with, as well as their email address. 
//   // Additionally, it maintains a history of all contacts made with the respondent regarding the survey.
//   //
//   // Attributes:
//   // -----------
//   // - Partition Key (Primary Key): respondentid (STRING)
//   //   - Description: Unique identifier for each respondent.
//   //
//   // - clientid (STRING)
//   //   - Description: The ID of the client associated with this respondent.
//   //
//   // - responsesetid (STRING)
//   //   - Description: The ID of the response set associated with this respondent.
//   //
//   // - email (STRING)
//   //   - Description: The email address of the respondent.
//   //
//   // - contacthistory (MAP)
//   //   - Description: A map containing a history of contacts made with the respondent regarding the survey. 
//   //     Each contact entry records the medium (e.g., SMS, email, phone call) and the date and time of the contact.
//   //   - Structure:
//   //     {
//   //       "contact1": {
//   //         "medium": "SMS",
//   //         "datetime": "2024-08-10T12:34:56Z"
//   //       },
//   //       "contact2": {
//   //         "medium": "email",
//   //         "datetime": "2024-08-11T09:15:00Z"
//   //       }
//   //       // Additional contacts can be added as new entries in the map
//   //     }
//   //
//   // Example Item Structure:
//   // -----------------------
//   // {
//   //   "respondentid": "unique-identifier-string",     // Primary key
//   //   "clientid": "client-identifier-string",         // ID of the associated client
//   //   "responsesetid": "response-set-identifier-string", // ID of the associated response set
//   //   "email": "respondent@example.com",              // Email address of the respondent
//   //   "contacthistory": {
//   //     "contact1": {
//   //       "medium": "SMS",                            // Medium used for contact (e.g., SMS)
//   //       "datetime": "2024-08-10T12:34:56Z"          // Date and time of the contact
//   //     },
//   //     "contact2": {
//   //       "medium": "email",                          // Medium used for contact (e.g., email)
//   //       "datetime": "2024-08-11T09:15:00Z"          // Date and time of the contact
//   //     }
//   //   }
//   // }




//   export const createResponseSetTable = (scope: Construct) => new TableV2(scope, 'responseSetTable', {
//     partitionKey: { name: 'responsesetid', type: AttributeType.STRING },
//     removalPolicy: cdk.RemovalPolicy.DESTROY,
//     tableName: 'responseSetTable',
//     billing: Billing.onDemand(),
//     globalSecondaryIndexes: [
//       {
//         indexName: 'surveyidIndex',
//         partitionKey: { name: 'surveyid', type: AttributeType.STRING }
//       }
//       ,
//       {
//         indexName: 'clientidIndex',
//         partitionKey: { name: 'clientid', type: AttributeType.STRING }
//       }
//     ]
//   });
//   // DynamoDB Table Schema: responseSetTable
//   // =======================================
//   // Table Name: responseSetTable
//   //
//   // Schema Description:
//   // This table stores response sets, which are collections of responses associated with surveys. 
//   // Each response set is uniquely identified by the responsesetid. The table also includes various 
//   // fields that capture metadata about the survey and client, as well as detailed demographic data.
//   //
//   // Attributes:
//   // -----------
//   // - Partition Key (Primary Key): responsesetid (STRING)
//   //   - Description: Unique identifier for each response set.
//   //
//   // - surveyid (STRING)
//   //   - Description: The ID of the survey associated with this response set.
//   //
//   // - clientid (STRING)
//   //   - Description: The ID of the client associated with this response set.
//   //
//   // - surveytitle (STRING)
//   //   - Description: The title of the survey associated with this response set.
//   //
//   // - surveydescription (STRING)
//   //   - Description: A brief description of the survey associated with this response set.
//   //
//   // - surveythankyoumessage (STRING)
//   //   - Description: The thank-you message displayed upon completion of the survey.
//   //
//   // - demographic1 (MAP)
//   //   - Description: A nested object representing the first demographic category, which includes a name 
//   //     and an array of possible values or options.
//   //   - Structure:
//   //     {
//   //       "name": "Demographic Category Name",        // e.g., "Age Group"
//   //       "values": ["Option1", "Option2", "Option3"] // e.g., ["18-24", "25-34", "35-44"]
//   //     }
//   //
//   // - demographic2 (MAP)
//   //   - Description: A nested object representing the second demographic category, with a similar structure 
//   //     to demographic1.
//   //   - Structure:
//   //     {
//   //       "name": "Demographic Category Name",        // e.g., "Income Level"
//   //       "values": ["Option1", "Option2", "Option3"] // e.g., ["< $20k", "$20k-$50k", "$50k-$100k"]
//   //     }
//   //
//   // Example Item Structure:
//   // -----------------------
//   // {
//   //   "responsesetid": "unique-identifier-string",   // Primary key
//   //   "surveyid": "survey-identifier-string",        // ID of the associated survey
//   //   "clientid": "client-identifier-string",        // ID of the associated client
//   //   "surveytitle": "Survey Title",                 // Title of the survey
//   //   "surveydescription": "Description of the survey",  // Survey description
//   //   "surveythankyoumessage": "Thank you for completing the survey!", // Thank-you message
//   //   "demographic1": {
//   //     "name": "Age Group",                         // Name of the demographic category
//   //     "values": ["18-24", "25-34", "35-44"]        // Possible options for this category
//   //   },
//   //   "demographic2": {
//   //     "name": "Income Level",                      // Name of the demographic category
//   //     "values": ["< $20k", "$20k-$50k", "$50k-$100k"] // Possible options for this category
//   //   }
//   // }




//   export const createResponseTable = (scope: Construct) => new TableV2(scope, 'responseTable', {
//     partitionKey: { name: 'responseid', type: AttributeType.STRING },
//     removalPolicy: cdk.RemovalPolicy.DESTROY,
//     tableName: 'responseTable',
//     billing: Billing.onDemand()
//   });
//   // DynamoDB Table Schema: responseTable
//   // =======================================
//   // Table Name: responseTable
//   //
//   // Schema Description:
//   // This table stores individual responses submitted by respondents as part of a survey. Each response 
//   // is uniquely identified by the responseid. The table may also include additional fields to capture 
//   // the associated respondent, response set, and the content of the response itself.
//   //
//   // Attributes:
//   // -----------
//   // - Partition Key (Primary Key): responseid (STRING)
//   //   - Description: Unique identifier for each individual response.
//   //
//   // Additional Fields (Examples):
//   // -----------------------------
//   // The following fields could be included depending on the application needs:
//   //
//   // - responsesetid (STRING)
//   //   - Description: The ID of the response set associated with this response.
//   //
//   // - respondentid (STRING)
//   //   - Description: The ID of the respondent who submitted this response.
//   //
//   // - surveyid (STRING)
//   //   - Description: The ID of the survey associated with this response.
//   //
//   // - responsecontent (MAP)
//   //   - Description: A map containing the actual content of the response, typically structured as a 
//   //     series of question-and-answer pairs.
//   //   - Structure:
//   //     {
//   //       "question1": "Answer to question 1",
//   //       "question2": "Answer to question 2",
//   //       ...
//   //     }
//   //
//   // Example Item Structure:
//   // -----------------------
//   // {
//   //   "responseid": "unique-response-identifier",      // Primary key
//   //   "responsesetid": "response-set-identifier",      // ID of the associated response set
//   //   "respondentid": "respondent-identifier",         // ID of the respondent who submitted the response
//   //   "surveyid": "survey-identifier",                 // ID of the associated survey
//   //   "responsecontent": {
//   //     "question1": "Yes",                            // Example answer to the first question
//   //     "question2": "No",                             // Example answer to the second question
//   //     // Additional questions and answers as needed
//   //   }
//   // }

  

//   export const createSurveyTable= (scope: Construct) => new TableV2(scope, 'surveyTable', {
//     partitionKey: { name: 'surveyid', type: AttributeType.STRING },
//     removalPolicy: cdk.RemovalPolicy.DESTROY,
//     tableName: 'surveyTable',
//     billing: Billing.onDemand()
//   });
//   // DynamoDB Table Schema: surveyTable
//   // =======================================
//   // Table Name: surveyTable
//   //
//   // Schema Description:
//   // This table stores information about surveys that are created and managed in the system. Each survey
//   // is uniquely identified by the surveyid. The table includes fields for the survey title, description,
  