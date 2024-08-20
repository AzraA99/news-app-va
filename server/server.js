const express = require('express');
const bodyParser = require('body-parser');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const util = require('util');

const app = express();
const port = 3002;

const client = new TextToSpeechClient({
  credentials: {
    api_key: 'AIzaSyAka_oLPMnln_Vusu0D6WUaCfWdFhAQudg'
  }
});

app.use(bodyParser.json());

app.post('/synthesize', async (req, res) => {
  try {
    const text = req.body.text;
    
    const request = {
      input: { text: text },
      voice: { languageCode: 'sr-RS', ssmlGender: 'NEUTRAL' }, // Serbian language code
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);

    res.set('Content-Type', 'audio/mp3');
    res.send(response.audioContent);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    res.status(500).send('Error synthesizing speech');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
