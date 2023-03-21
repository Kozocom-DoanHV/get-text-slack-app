const handleGetText = require("./GetText");

const handleFunctions = async ({ client, event, payload }) => {
  if (event?.text.split(" ")[1] === "/trans") {
    handleGetText({ client, event, payload });
  } else {
    try {
      await client.chat.postMessage({
        channel: payload.channel,
        thread_ts: payload.ts,
        text: `<@${event.user}> Please enter correct command`,
      });
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports = handleFunctions;
