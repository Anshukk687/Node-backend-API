const ngrok = require('@ngrok/ngrok');

(async function() {
  const url = await ngrok.connect({ addr: 5000 }); // 5000 is your local server port
  console.log(`ngrok tunnel running at: ${url}`);
})();