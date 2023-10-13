const { Configuration, OpenAIApi } = require("openai");
const { WebClient } = require("@slack/web-api");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const threadMillClient = new WebClient(process.env.THREADMILL_SLACK_BOT_KEY);

const messages = [
  "🐉 Arise, noble crew! The daily saga begins here.",
  "🌀 Echoes from the void: team, it's time. Daily thread starts now.",
  "📡 Transmission received — daily thread has landed.",
  "🚪 Knock knock... It’s the daily thread. Let’s open the door.",
  "⚔️ Fellow digital gladiators, the arena is open. Daily time.",
  "🌪️ Wind’s up, sails are set — let the daily commence.",
  "🧙 Greetings, brave wanderers of productivity. Daily thread kicks off.",
  "⏳ Tick-tock team, daily thread starts now — choose your destiny.",
  "💾 Booting up the daily like it’s 1999. Who’s online?",
  "🚀 Ground control to Major Team — daily thread initiated.",
  "🕵️ Pssst… the daily thread just slipped into the chat.",
  "🦄 Sound the horns! Daily thread begins with this majestic cry.",
  "🔮 Assemble, digital druids. The thread of daily prophecy begins.",
  "🧠 Brain engines on — daily thread ignition complete.",
  "🧟 It’s alive! The daily thread lurches into motion.",
  "👻 Peekaboo — it’s your favorite thread. Daily mode: on.",
  "🤖 Beep bop boop — today’s daily sequence starts here.",
  "🪨 You found the entrance to the daily cave. Let’s explore.",
  "⚡ Lightning struck the server — daily thread powers up.",
  "🎙️ Tap-tap… is this thing on? Yep — daily thread begins.",
  "🪩 Daily vibes activated. Bring your sparkle.",
  "📣 We interrupt your scheduled scrolling for: the daily thread.",
  "🕳️ Down the rabbit hole we go — daily thread begins."
];

const getFallbackMessage = () => messages[~~(messages.length * Math.random())];

const getMessage = async (prompt = undefined) => {
  const gpt = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content:
          prompt ||
          "Say hello to the team in an unusual way, and mention that with this message you start todays daily thread. Use exactly one emoji in the whole text, and make sure it is available in Slack. Keep the message short.",
      },
    ],
  });

  return gpt.data.choices[0].message.content;
};

const startThreadHandler = {
  handler: async (request, reply) => {
    try {
      let msg = "";
      try {
        msg = await getMessage();
      } catch (err) {
        console.error("Error from OpenAI:", err);
        msg = getFallbackMessage();
      }
      if (request.query.before) {
        msg = [request.query.before, msg].join("\n");
      }
      if (request.query.after) {
        msg = [msg, request.query.after].join("\n");
      }

      await threadMillClient.chat.postMessage({
        channel: request.params.channel_id,
        text: msg,
      });

      reply.code(200).send(`Sent "${msg}" to ${request.params.channel_id}`);
    } catch (err) {
      console.error(err);
      if (process.env.ADMIN_SLACK_ID) {
        await threadMillClient.chat.postMessage({
          channel: process.env.ADMIN_SLACK_ID,
          text: err + "\n" + request.body,
        });  
      }
      reply.code(500).send(err);
    }
  },
};

exports.startThreadHandler = startThreadHandler;
