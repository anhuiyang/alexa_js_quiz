const questionNoPerRound = 2
const {correctMessage, skipMessage, incorrectMessage} = require('./messages')

const determineCorrect = (answerSlot, sessionAnswer, handlerInput) => {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
    if (answerSlot === sessionAnswer) {
        sessionAttributes.score ++
        return `<audio src=\'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_positive_01\'/> ${correctMessage}`
    } 
    else if (answerSlot === 'pass'|| answerSlot === 'skip' || answerSlot === 'I don\'t know') {
        return `<audio src=\'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_bridge_01\'/> ${skipMessage}`
    } 
    else {
        return `<audio src=\'soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_negative_01\'/> ${incorrectMessage}` 
    }
}
const populateQuestions = (questions) => {
    let shuffledArray = shuffleQuestions(questions).slice(-questionNoPerRound)
    return shuffledArray
}

const shuffleQuestions = (array) => {
    let currentIndex = array.length
    let temporaryValue, randomIndex
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }
    return array
}

const getNextQuestion = (handlerInput) => {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
    sessionAttributes.currentRound === 1 && sessionAttributes.round1Questions.length === 0 ? sessionAttributes.currentRound ++ : ''
    if(sessionAttributes.currentRound === 1){
        let currentQuestionObject = sessionAttributes.round1Questions.pop()
        let currentQuestion = currentQuestionObject.question 
        sessionAttributes.question = currentQuestion
        let currentAnswer = currentQuestionObject.answer
        sessionAttributes.answer = currentAnswer
        //stub question for testing
        if(process.env.NODE_ENV === 'test') {
            sessionAttributes.question = 'What is the capital of England? Is it, A, London. B, Edinburgh. C, Cardiff?'
            sessionAttributes.answer = 'a'
        }
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
        //stub question for testing
        if(process.env.NODE_ENV === 'test') {
            sessionAttributes.question = 'What is the capital of England? Is it, A, London. B, Edinburgh. C, Cardiff?'
            sessionAttributes.answer = 'a'
        }
            return `You scored ${sessionAttributes.score} the first round. On to round 2. The next question is: ${currentQuestion}`
        }else{
            currentQuestionObject = sessionAttributes.round2Questions.pop()
            currentQuestion = currentQuestionObject.question 
            sessionAttributes.question = currentQuestion
            currentAnswer = currentQuestionObject.answer
            sessionAttributes.answer = currentAnswer
        //stub question for testing
        if(process.env.NODE_ENV === 'test') {
            sessionAttributes.question = 'What is the capital of England? Is it, A, London. B, Edinburgh. C, Cardiff?'
            sessionAttributes.answer = 'a'
        }
        return `The next question is: ${currentQuestion} <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_countdown_loop_32s_full_01'/>`
        }
    }
}

module.exports = {determineCorrect, populateQuestions, shuffleQuestions, getNextQuestion}