const { createWorker } = require("tesseract.js");
const axios = require("axios");
require("dotenv").config();

const handleImageToText = async (imgUrl) => {
  const worker = await createWorker();
  await worker.loadLanguage("jpn+eng+vie");
  await worker.initialize("jpn+eng+vie");
  const downloadFile = () =>
    axios({
      url: imgUrl,
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      responseType: "arraybuffer",
    }).then((res) => res.data);
  const res = await downloadFile();
  const {
    data: { text },
  } = await worker.recognize(res);
  await worker.terminate();
  return text;
};

const handleGetText = async ({ client, event, payload }) => {
  let img = event?.files[0]?.url_private;
  let textGet = "";
  if (img) {
    textGet = await handleImageToText(img);
  }
  try {
    await client.chat.postMessage({
      channel: payload.channel,
      thread_ts: payload.ts,
      text: `<@${event.user}> Your text: ${textGet}`,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = handleGetText;
