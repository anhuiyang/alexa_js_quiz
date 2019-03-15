process.env.NODE_ENV = 'test'

const assert = require('chai').assert;
const va = require("virtual-alexa");
const alexa = va.VirtualAlexa.Builder()
    .handler("./lambda/custom/index.handler") // Lambda function file and name
    .interactionModelFile("./models/en-US.json") // Path to interaction model file
    .create();
    
    describe('Britains Got Trivia tests', function() {
      it('can open launch intent', async () => {
        let result = await alexa.launch();
        assert.include(result.prompt(), "Welcome to Britain's Got Trivia.");
      });

      it('will handle yes to ready intent', async () => {
        let result = await alexa.launch();
        result = await alexa.utter('yes');
        assert.include(result.prompt(), 'Say start game');
      })

      it('ReadyIntent say no', async () => {
        let result = await alexa.launch();
        result = await alexa.utter('no');
        assert.include(result.prompt(), 'Hurry up');
      })

      it('say help can listen to rules', async () => {
        let result = await alexa.launch();
        result = await alexa.utter('help');
        assert.include(result.prompt(), 'Here are the rules.');
      })
      
      it("Shows your score after 5 questions", async () => {
        let result = await alexa.launch();
        result = await alexa.utter('start game');
        assert.include(result.prompt(), 'This is round 1');
        result = await alexa.utter("the answer is a")
        assert.include(result.prompt(), "Correct");
        result = await alexa.utter("the answer is c")
        assert.include(result.prompt(), "incorrect");
        result = await alexa.utter("pass")
        assert.include(result.prompt(), "Skipping that question.");
        result = await alexa.utter("the answer is b")
        assert.include(result.prompt(), "Thank you for playing");
        // result = await alexa.utter("cheese")
        // assert.include(result.prompt(), "I am having trouble understanding that command");
      })
      it('StopIntent', async () => {
        let result = await alexa.launch();
        result = await alexa.utter('stop');
        assert.include(result.prompt(), 'Thanks for playing.');
      })
    });