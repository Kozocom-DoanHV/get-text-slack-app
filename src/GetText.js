require("dotenv").config();
const { createWorker } = require("tesseract.js");
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handleTransUseChatGPT = async (text) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a good translator" },
      { role: "user", content: "Xin chào, tôi là Đoan" },
      {
        role: "assistant",
        content: "Vietnamese: Xin chào, tôi là Đoan\nEnglish: Hello, I am Doan",
      },
      { role: "user", content: "Hello, I am Doan" },
      {
        role: "assistant",
        content: "Vietnamese: Xin chào, tôi là Doan\nEnglish: Hello, I am Doan",
      },
      {
        role: "user",
        content: "受 診 者 情 報 の 登 録 ・ 更 新 を し て く だ さ い",
      },
      {
        role: "assistant",
        content:
          "Vietnamese: Đăng ký và cập nhật thông tin bệnh nhân\nEnglish: Register and update patient information",
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.7,
    top_p: 1,
    max_tokens: 1000,
  });
  return completion.data.choices[0].message.content;
};

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
  let textTrain = "";
  if (img) {
    textGet = await handleImageToText(img);
  }
  if (textGet) {
    textTrain = await handleTransUseChatGPT(textGet);
  }
  try {
    await client.chat.postMessage({
      channel: payload.channel,
      thread_ts: payload.ts,
      text: `<@${event.user}> Your text: ${textGet} \n${textTrain}`,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = handleGetText;
