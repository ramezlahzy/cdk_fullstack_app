
const surveyTypes = [
    {
      name: "Customer Satisfaction Survey",
      surveyquestions: {
        question1: {
          question: "How satisfied are you with our service?",
          type: "multiple-choice",
          options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
        },
        question2: {
          question: "How likely are you to recommend us to a friend?",
          type: "rating"
        },
        question3: {
          question: "What can we improve?",
          type: "text"
        },
        question4: {
          question: "How was your experience with our customer service?",
          type: "multiple-choice",
          options: ["Excellent", "Good", "Average", "Poor"]
        },
        question5: {
          question: "Did the product meet your expectations?",
          type: "yes-no"
        },
        question6: {
          question: "How long have you been a customer?",
          type: "multiple-choice",
          options: ["Less than a year", "1-3 years", "More than 3 years"]
        },
        question7: {
          question: "How often do you use our service?",
          type: "multiple-choice",
          options: ["Daily", "Weekly", "Monthly", "Rarely"]
        },
        question8: {
          question: "What feature would you like to see?",
          type: "text"
        },
        question9: {
          question: "How would you rate our pricing?",
          type: "rating"
        },
        question10: {
          question: "Would you purchase from us again?",
          type: "yes-no"
        }
      }
    },
    {
      name: "Employee Engagement Survey",
      surveyquestions: {
        question1: {
          question: "How motivated do you feel at work?",
          type: "rating"
        },
        question2: {
          question: "Do you feel valued by your team?",
          type: "yes-no"
        },
        question3: {
          question: "How would you improve the work environment?",
          type: "text"
        },
        question4: {
          question: "How satisfied are you with your career progression?",
          type: "rating"
        },
        question5: {
          question: "Do you feel you have the tools to succeed?",
          type: "yes-no"
        },
        question6: {
          question: "How often do you receive feedback?",
          type: "multiple-choice",
          options: ["Weekly", "Monthly", "Quarterly", "Rarely"]
        },
        question7: {
          question: "Would you recommend working here?",
          type: "yes-no"
        },
        question8: {
          question: "How satisfied are you with the benefits?",
          type: "rating"
        },
        question9: {
          question: "What do you enjoy most about your job?",
          type: "text"
        },
        question10: {
          question: "How would you describe the company culture?",
          type: "text"
        }
      }
    },
    {
      name: "Market Research Survey",
      surveyquestions: {
        question1: {
          question: "How familiar are you with our brand?",
          type: "rating"
        },
        question2: {
          question: "What is your age range?",
          type: "multiple-choice",
          options: ["18-24", "25-34", "35-44", "45+"]
        },
        question3: {
          question: "What products do you use regularly?",
          type: "multiple-choice",
          options: ["Electronics", "Clothing", "Groceries", "Beauty Products"]
        },
        question4: {
          question: "How often do you shop online?",
          type: "single-choice"
        },
        question5: {
          question: "Which factors influence your buying decisions?",
          type: "multiple-choice",
          options: ["Price", "Quality", "Brand reputation", "Recommendations"]
        },
        question6: {
          question: "How did you hear about us?",
          type: "single-choice"
        },
        question7: {
          question: "What other brands do you use?",
          type: "text"
        },
        question8: {
          question: "What do you look for in a product?",
          type: "text"
        },
        question9: {
          question: "How important is price in your decision?",
          type: "rating"
        },
        question10: {
          question: "Would you recommend our brand?",
          type: "yes-no"
        }
      }
    },
    {
      name: "Product Feedback Survey",
      surveyquestions: {
        question1: {
          question: "How satisfied are you with the product?",
          type: "rating"
        },
        question2: {
          question: "What do you like most about the product?",
          type: "text"
        },
        question3: {
          question: "What do you dislike about the product?",
          type: "text"
        },
        question4: {
          question: "How likely are you to purchase again?",
          type: "rating"
        },
        question5: {
          question: "Would you recommend the product?",
          type: "yes-no"
        },
        question6: {
          question: "How long have you been using the product?",
          type: "multiple-choice",
          options: ["Less than a month", "1-3 months", "More than 3 months"]
        },
        question7: {
          question: "How often do you use the product?",
          type: "multiple-choice",
          options: ["Daily", "Weekly", "Monthly", "Rarely"]
        },
        question8: {
          question: "What feature would you like to see?",
          type: "text"
        },
        question9: {
          question: "How would you rate the price of the product?",
          type: "rating"
        },
        question10: {
          question: "What other products would you like to see?",
          type: "text"
        }
      }
    },
    {
      name: "Event Feedback Survey",
      surveyquestions: {
        question1: {
          question: "How satisfied were you with the event?",
          type: "rating"
        },
        question2: {
          question: "What did you enjoy most about the event?",
          type: "text"
        },
        question3: {
          question: "What could be improved for next time?",
          type: "text"
        },
        question4: {
          question: "How likely are you to attend another event?",
          type: "rating"
        },
        question5: {
          question: "Would you recommend the event to a friend?",
          type: "yes-no"
        },
        question6: {
          question: "How often do you attend events?",
          type: "multiple-choice",
          options: ["Monthly", "Quarterly", "Annually", "Rarely"]
        },
        question7: {
          question: "What type of events do you prefer?",
          type: "text"
        },
        question8: {
          question: "How would you rate the venue?",
          type: "rating"
        },
        question9: {
          question: "What would make the event more enjoyable?",
          type: "text"
        },
        question10: {
          question: "How would you rate the event price?",
          type: "rating"
        }
      }
    },
    {
      name: "Website Feedback Survey",
      surveyquestions: {
        question1: {
          question: "How user-friendly is the website?",
          type: "rating"
        },
        question2: {
          question: "What do you like most about the website?",
          type: "text"
        },
        question3: {
          question: "What do you dislike about the website?",
          type: "text"
        },
        question4: {
          question: "How likely are you to visit again?",
          type: "rating"
        },
        question5: {
          question: "Would you recommend the website?",
          type: "yes-no"
        },
        question6: {
          question: "How often do you visit the website?",
          type: "multiple-choice",
          options: ["Daily", "Weekly", "Monthly", "Rarely"]
        },
        question7: {
          question: "What feature would you like to see?",
          type: "text"
        },
        question8: {
          question: "How would you rate the website speed?",
          type: "rating"
        },
        question9: {
          question: "What other websites do you use?",
          type: "text"
        },
        question10: {
          question: "How important is design in a website?",
          type: "rating"
        }
      }
    },
    {
      name: "Training Feedback Survey",
      surveyquestions: {
        question1: {
          question: "How satisfied were you with the training?",
          type: "rating"
        },
        question2: {
          question: "What did you enjoy most about the training?",
          type: "text"
        },
        question3: {
          question: "What could be improved for next time?",
          type: "text"
        },
        question4: {
          question: "How likely are you to attend another training?",
          type: "rating"
        },
        question5: {
          question: "Would you recommend the training to a friend?",
          type: "yes-no"
        },
        question6: {
          question: "How often do you attend training?",
          type: "multiple-choice",
          options: ["Monthly", "Quarterly", "Annually", "Rarely"]
        },
        question7: {
          question: "What type of training do you prefer?",
          type: "text"
        },
        question8: {
          question: "How would you rate the trainer?",
          type: "rating"
        },
        question9: {
          question: "What would make the training more enjoyable?",
          type: "text"
        },
        question10: {
          question: "How would you rate the training price?",
          type: "rating"
        }
      }
    },
    {
      name: "Course Feedback Survey",
      surveyquestions: {
        question1: {
          question: "How satisfied were you with the course?",
          type: "rating"
        },
        question2: {
          question: "What did you enjoy most about the course?",
          type: "text"
        },
        question3: {
          question: "What could be improved for next time?",
          type: "text"
        },
        question4: {
          question: "How likely are you to attend another course?",
          type: "rating"
        },
        question5: {
          question: "Would you recommend the course to a friend?",
          type: "yes-no"
        },
        question6: {
          question: "How often do you attend courses?",
          type: "multiple-choice",
          options: ["Monthly", "Quarterly", "Annually", "Rarely"]
        },
        question7: {
          question: "What type of courses do you prefer?",
          type: "text"
        },
        question8: {
          question: "How would you rate the instructor?",
          type: "rating"
        },
        question9: {
          question: "What would make the course more enjoyable?",
          type: "text"
        },
        question10: {
          question: "How would you rate the course price?",
          type: "rating"
        }
      }
    },
    {
      name: "Travel Feedback Survey",
      surveyquestions: {
        question1: {
          question: "How satisfied were you with the trip?",
          type: "rating"
        },
        question2: {
          question: "What did you enjoy most about the trip?",
          type: "text"
        },
        question3: {
          question: "What could be improved for next time?",
          type: "text"
        },
        question4: {
          question: "How likely are you to travel again?",
          type: "rating"
        },
        question5: {
          question: "Would you recommend the trip to a friend?",
          type: "yes-no"
        },
        question6: {
          question: "How often do you travel?",
          type: "multiple-choice",
          options: ["Monthly", "Quarterly", "Annually", "Rarely"]
        },
        question7: {
          question: "What type of trips do you prefer?",
          type: "text"
        },
        question8: {
          question: "How would you rate the accommodations?",
          type: "rating"
        },
        question9: {
          question: "What would make the trip more enjoyable?",
          type: "text"
        },
        question10: {
          question: "How would you rate the trip price?",
          type: "rating"
        }
      }
    },
    {
      name: "Restaurant Feedback Survey",
      surveyquestions: {
        question1: {
          question: "How satisfied were you with the meal?",
          type: "rating"
        },
        question2: {
          question: "What did you enjoy most about the meal?",
          type: "text"
        },
        question3: {
          question: "What could be improved for next time?",
          type: "text"
        },
        question4: {
          question: "How likely are you to dine again?",
          type: "rating"
        },
        question5: {
          question: "Would you recommend the restaurant to a friend?",
          type: "yes-no"
        },
        question6: {
          question: "How often do you dine out?",
          type: "multiple-choice",
          options: ["Weekly", "Monthly", "Quarterly", "Rarely"]
        },
        question7: {
          question: "What type of cuisine do you prefer?",
          type: "text"
        },
        question8: {
          question: "How would you rate the service?",
          type: "rating"
        },
        question9: {
          question: "What would make the meal more enjoyable?",
          type: "text"
        },
        question10: {
          question: "How would you rate the meal price?",
          type: "rating"
        }
      }
    }
  ];

const clientData = {
    "name": "Acme Corporation",
    "businessname": "Acme Corporation LLC",
    "taxid": "123-45-6789",
    "primarycontact": "user-identifier",
    "logo": "https://example.com/logos/acme-logo.png",
    "demographic1": {
      "name": "Industry Type",
      "values": ["Retail", "Manufacturing", "Services"]
    },
    "demographic2": {
      "name": "Company Size",
      "values": ["Small", "Medium", "Large"]
    }
  };


// export { surveyTypes, clientData };
module.exports = { surveyTypes, clientData };