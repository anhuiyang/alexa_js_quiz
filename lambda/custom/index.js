const Alexa = require('ask-sdk-core')
const questions = require('./questions')
const {welcomeMessage, goodbyeMessage, readyMessage, readyReprompt, helpMessage} = require('./messages')
const questionNoPerRound = 2
const totalRounds = 2
// HANDLERS
const LaunchRequestHandler = {
  canHandle(handlerInput) {
  return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
    || handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
    .speak(`<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_intro_01'/> ${welcomeMessage}`)
    .withShouldEndSession (false)
    .getResponse()
  }
}

const ReadyIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'ReadyIntent'
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots
    const yesAnswer = slots['yes'].value
    const noAnswer = slots['no'].value
    let speechText = ''
    if (yesAnswer === 'yes') {
      speechText = `${readyMessage} <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_waiting_loop_30s_01'/>`
    } 
    else if (noAnswer === 'no') {
      speechText ='Well I don\'t have all day. Hurry up. <audio src=\'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_countdown_loop_32s_full_01\'/>'
    }
    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(readyReprompt)
    .withShouldEndSession (false)
    .getResponse()
  },
}

const StartQuizIntentHandler = {
 canHandle(handlerInput) {
  return handlerInput.requestEnvelope.request.type === 'IntentRequest'
   && handlerInput.requestEnvelope.request.intent.name === 'QuizIntent'
 },
 handle(handlerInput) {
  let sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
  sessionAttributes.totalRounds = totalRounds
  sessionAttributes.currentRound = 1
  sessionAttributes.score = 0 
  sessionAttributes.round1Questions = chooseQuestions(questions.ROUND1QUESTION)
  sessionAttributes.round2Questions = chooseQuestions(questions.ROUND2QUESTION)
  let currentQuestionObject = sessionAttributes.round1Questions.pop()
  sessionAttributes.question = currentQuestionObject.question 
  sessionAttributes.answer = currentQuestionObject.answer

  //TESTING STARTS
  if(process.env.NODE_ENV === 'test') {
   sessionAttributes.question = 'What is the capital of England? Is it, A, London. B, Edinburgh. C, Cardiff?'
   sessionAttributes.answer = 'a'
  }
  // TESTING ENDS

  return handlerInput.responseBuilder
   .speak(`This is round ${sessionAttributes.currentRound}. ${sessionAttributes.question} <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_countdown_loop_32s_full_01'/>`)
   .reprompt(sessionAttributes.question)
   .withShouldEndSession (false)
   .getResponse()
 }
}

const AnswerIntentHandler = {
 canHandle(handlerInput) {
  return handlerInput.requestEnvelope.request.type === 'IntentRequest'
   && handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent'
 },
 handle(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
  const slot = handlerInput.requestEnvelope.request.intent.slots
  const answerSlot = slot['answer'].value

  let speechText = ''
  speechText+= determineCorrect(answerSlot, sessionAttributes.answer, handlerInput)
  speechText+= getNextQuestion(handlerInput)
  return handlerInput.responseBuilder
   .speak(speechText)
   .withShouldEndSession (false)
   .getResponse()
 },
}

const StopIntentHandler = {
 canHandle(handlerInput) {
  return handlerInput.requestEnvelope.request.type === 'IntentRequest'
  && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
 },
 handle(handlerInput) {
  return handlerInput.responseBuilder
  .speak(`<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_outro_01'/> ${goodbyeMessage}`)
  .getResponse()
 }
}

const ErrorHandler = {
 canHandle() {
  return true
 },
 handle(handlerInput) {
  return handlerInput.responseBuilder
  .speak('I am having trouble understanding that command')
  .withShouldEndSession(false)
  .getResponse()
 },
}

const HelpIntentHandler = {
 canHandle(handlerInput) {
  return handlerInput.requestEnvelope.request.type === 'IntentRequest'
   && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
 },
 handle(handlerInput) {
  const speechText = `${helpMessage}`

  return handlerInput.responseBuilder
   .speak(speechText)
   .reprompt(speechText)
   .withShouldEndSession(false)
   .getResponse()
 },
}

// HELPER FUNCTIONS

function determineCorrect(answerSlot, sessionAttribute, handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
  
  if (answerSlot === sessionAttribute) {
    sessionAttributes.score ++
   return '<audio src=\'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_positive_01\'/> Correct. One point has been added to your score. '
  } 
  else if (answerSlot === 'pass'|| answerSlot === 'skip' || answerSlot === 'I don\'t know') {
   return '<audio src=\'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_bridge_01\'/> Skipping that question.'
  } 
  else {
   return '<audio src=\'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_negative_01\'/> Sorry, that is incorrect. ' 
  }
}

function chooseQuestions(questionsDoc) {
  var shuffledArray = shuffleQuestions(questionsDoc).slice(-questionNoPerRound)
  return shuffledArray
}

function shuffleQuestions(array) {

	var currentIndex = array.length
	var temporaryValue, randomIndex
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1

		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}
	return array
}

function getNextQuestion(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
  sessionAttributes.currentRound === 1 && sessionAttributes.round1Questions.length === 0 ? sessionAttributes.currentRound ++ : ''
  if(sessionAttributes.currentRound === 1){
      var currentQuestionObject = sessionAttributes.round1Questions.pop()

      var currentQuestion = currentQuestionObject.question 
      sessionAttributes.question = currentQuestion
      var currentAnswer = currentQuestionObject.answer
      sessionAttributes.answer = currentAnswer

      //TESTING STARTS
      if(process.env.NODE_ENV === 'test') {
        sessionAttributes.question = 'What is the capital of England? Is it, A, London. B, Edinburgh. C, Cardiff?'
        sessionAttributes.answer = 'a'
    }
      // TESTING ENDS

        return `The next question is: ${currentQuestion} <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_countdown_loop_32s_full_01'/>`

    }
    if(sessionAttributes.currentRound === sessionAttributes.totalRounds){
      if(sessionAttributes.round2Questions.length === 0){
        return `You scored ${sessionAttributes.score}. Thank you for playing`
      }else if(sessionAttributes.round2Questions.length === questionNoPerRound){
        currentQuestionObject = sessionAttributes.round2Questions.pop()

        currentQuestion = currentQuestionObject.question 
        sessionAttributes.question = currentQuestion
        currentAnswer = currentQuestionObject.answer
        sessionAttributes.answer = currentAnswer
        //TESTING STARTS
      if(process.env.NODE_ENV === 'test') {
        sessionAttributes.question = 'What is the capital of England? Is it, A, London. B, Edinburgh. C, Cardiff?'
        sessionAttributes.answer = 'a'
      }
       // TESTING ENDS
        return `You scored ${sessionAttributes.score} the first round. On to round 2. The next question is: ${currentQuestion}`
      }else{
        currentQuestionObject = sessionAttributes.round2Questions.pop()

        currentQuestion = currentQuestionObject.question 
        sessionAttributes.question = currentQuestion
        currentAnswer = currentQuestionObject.answer
        sessionAttributes.answer = currentAnswer
      //TESTING STARTS
      if(process.env.NODE_ENV === 'test') {
        sessionAttributes.question = 'What is the capital of England? Is it, A, London. B, Edinburgh. C, Cardiff?'
        sessionAttributes.answer = 'a'
        
    }
      // TESTING ENDS
        return `The next question is: ${currentQuestion} <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_countdown_loop_32s_full_01'/>`
      }
    }
}
  
const skillBuilder = Alexa.SkillBuilders.custom()
exports.handler = skillBuilder
 .addRequestHandlers(
  LaunchRequestHandler,
  ReadyIntentHandler,
  HelpIntentHandler,
  StartQuizIntentHandler,
  AnswerIntentHandler,
  StopIntentHandler,
 )
 .addErrorHandlers(ErrorHandler)
.lambda()