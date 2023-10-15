const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.AMTA_MOST_RECENT_UPDATE) {
  console.error('Please set the following environment variables:');
  console.error('TWILIO_SID, TWILIO_AUTH_TOKEN, AMTA_MOST_RECENT_UPDATE');
  process.exit(1);
}

async function sendAlert() {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages
    .create({
      body: '🚨 CASE IS LIVE 🚨',
      from: '+18449382535',
      to: '+16176087993'
    });

  console.log('Text notification sent!');
}

async function checkWebsite() {
  const { data } = await axios.get('https://www.collegemocktrial.org');
  const $ = cheerio.load(data);
  const text = $('#firstColumn > h2 + .title').text();
  if (text !== process.env.AMTA_MOST_RECENT_UPDATE) {
    console.log('🚨 CASE IS LIVE 🚨')
    await sendAlert();
    process.exit(0);
  } else {
    console.log(`[${new Date().toLocaleTimeString()}] No case yet.`)
  }
}

checkWebsite();

cron.schedule('30 * * * * *', checkWebsite);