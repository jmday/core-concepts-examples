// This test file uses the tape testing framework.
// To learn more, go here: https://github.com/substack/tape
const { Config, Scenario } = require("@holochain/holochain-nodejs")
Scenario.setTape(require("tape"))

// Create a reference to our DNA microservice
const dnaPath = "./dist/core-concepts-examples.dna.json"
const dna = Config.dna(dnaPath)
// Create an agent, alice, within our DNA microservice
const agentAlice = Config.agent("alice")
const instanceAlice = Config.instance(agentAlice, dna)
// Create an agent, bob, within our DNA microservice
const agentBob = Config.agent("bob")
const instanceBob = Config.instance(agentBob, dna)
// Create an agent, carol, within our DNA microservice
const agentCarol = Config.agent("carol")
const instanceCarol = Config.instance(agentCarol, dna)
// Define our scenario with alice, bob, and carol
const scenario = new Scenario([instanceAlice, instanceBob, instanceCarol])


scenario.runTape("post 2 & get all messages", async (t, { alice, bob, carol }) => {
  const helloFromAlice = "Hello, from Alice";
  const helloFromBob = "Hello, from Bob";

  // Alice creates a hello message
  const addrAlice = await alice.callSync("message_zome", "create_message", {"message_string" : helloFromAlice})
  console.log(addrAlice)

  // Bob creates a hello message
  const addrBob = await bob.callSync("message_zome", "create_message", {"message_string" : helloFromBob})
  console.log(addrBob)

  // Carol gets all the messages
  const resultAlice = await alice.callSync("message_zome", "get_all_blog_messages", {})
  console.log(resultAlice)

  // Carol gets all the messages
  const resultBob = await bob.callSync("message_zome", "get_all_blog_messages", {})
  console.log(resultBob)

  // Carol gets all the messages
  const resultCarol = await carol.callSync("message_zome", "get_all_blog_messages", {})
  console.log(resultCarol)

  // check for equality of the actual and expected results
  t.deepEqual(resultCarol, { Ok: [ {"content": helloFromAlice}, {"content": helloFromBob} ] })
})

scenario.runTape("fail posting an invalid message", async (t, { alice }) => {

  // The BAD message - i.e. it does not contain the string "Hello"
  const badMessage = "Hi, Alice!";
  const expectedError = { Err: { Internal: '{"kind":{"ValidationFailed":"Messages must contain \\"Hello\\"."},"file":"/Users/travis/build/holochain/holochain-rust/core/src/nucleus/ribosome/runtime.rs","line":"192"}' } }

  // Alice tries to create an invalid message
  console.log("Bad Message:", badMessage)
  const addr = await alice.callSync("message_zome", "create_message", {"message_string" : badMessage })
  console.log("Bad Message Address:", addr)

  // check that Alice gets the correct error
  t.deepEqual(addr, expectedError)
})