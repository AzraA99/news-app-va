import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaStop, FaRocket } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './NewsApp.css';

// Import your images
import newsImage1 from './images/news1.jpg';
import newsImage2 from './images/news2.jpg';
import newsImage3 from './images/news3.jpg';
import newsImage4 from './images/news4.jpg';
import newsImage5 from './images/news5.jpg';
import newsImage6 from './images/news6.jpeg';
import newsImage7 from './images/news7.jpg';
import newsImage8 from './images/news8.png';

const apiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY; // Access the API key

const NewsApp = () => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false); // New state to control speaking
  const [openedArticle, setOpenedArticle] = useState(null);
  const { transcript, resetTranscript } = useSpeechRecognition();

  const headlines = [
    {
      title: "Na Pešterskoj visoravni nema vode ni za ljude ni za životinje",
      url: "https://balkans.aljazeera.net/videos/2024/8/18/na-pesterskoj-visoravni-nema-vode-ni-za-ljude-ni-za-zivotinje",
      image: newsImage1
    },
    {
      title: "Borba za očuvanje Une se nastavlja novim protestom i koncertom",
      url: "https://balkans.aljazeera.net/news/balkan/2024/8/18/borba-za-ocuvanje-une-se-nastavlja-novim-protestom-i-koncertom",
      image: newsImage2
    },
    {
      title: "Zbog suše i visoke temperature u Semberiji velika šteta na prinosu kukuruza",
      url: "https://balkans.aljazeera.net/videos/2024/8/17/zbog-suse-i-visoke-temperature-u-semberiji-velika-steta-na-prinosu-kukuruza",
      image: newsImage3
    },
    {
      title: "Prvi put presušili svi izvori pitke vode u Sjenici",
      url: "https://balkans.aljazeera.net/videos/2024/8/17/prvi-put-presusili-svi-izvori-pitke-vode-u-sjenici",
      image: newsImage4
    },
    {
      title: "Na Jadranu manje turista",
      url: "https://balkans.aljazeera.net/news/balkan/2024/8/16/na-jadranu-manje-turista",
      image: newsImage5
    },
    {
      title: "Kod Kotor-Varoši treći dan gori, zvanično zatvorena deponija smeća",
      url: "https://balkans.aljazeera.net/videos/2024/8/15/kod-kotor-varosi-treci-dan-gori-zvanicno-zatvorena-deponija-smeca",
      image: newsImage6
    },
    {
      title: "Nesavjesno liječenje i liječničke greške u BiH najčešće prolaze nekažnjeno",
      url: "https://balkans.aljazeera.net/videos/2024/8/14/nesavjesno-lijecenje-i-lijecnicke-greske-u-bih-najcesce-prolaze-nekaznjeno",
      image: newsImage7
    },
    {
      title: "Sarajevo ponovo dobilo plin",
      url: "https://balkans.aljazeera.net/news/balkan/2024/8/14/sarajevo-ponovo-dobilo-plin",
      image: newsImage8
    }
  ];

  // Function to convert words to numbers
  const wordsToNumbers = (word) => {
    switch (word) {
      case 'jedan':
        return 1;
      case 'dva':
        return 2;
      case 'tri':
        return 3;
      case 'četiri':
        return 4;
      case 'pet':
        return 5;
      case 'šest':
        return 6;
      case 'sedam':
        return 7;
      case 'osam':
        return 8;
      case 'devet':
        return 9;
      default:
        return null;
    }
  };

  useEffect(() => {
    const lowerCaseTranscript = transcript.toLowerCase();

    if (lowerCaseTranscript.includes('čitaj')) {
      readHeadlinesAloud();
      resetTranscript(); // Reset after recognizing 'start'
    } else if (lowerCaseTranscript.includes('stop')) {
      window.speechSynthesis.cancel();
      setSpeaking(false); // Ensure speaking is stopped
      resetTranscript(); // Reset after recognizing 'stop'
    } else if (lowerCaseTranscript.startsWith('otvori vijest')) {
      const parts = lowerCaseTranscript.split(' ');
      const articleNumberWord = parts[2];
      const articleNumber = parseInt(articleNumberWord, 10) || wordsToNumbers(articleNumberWord);

      if (articleNumber) {
        openArticle(articleNumber);
        resetTranscript(); // Reset after opening article
      }
    }
  }, [transcript, headlines, openedArticle]);

  const startListening = () => {
    setListening(true);
    SpeechRecognition.startListening({ continuous: true, language: 'sr' }); // Set the language to Serbian
  };

  const stopListening = () => {
    setListening(false);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  const speak = async (text) => {
    if (speaking) return; // Prevent new speech if already speaking
    setSpeaking(true);
    window.speechSynthesis.cancel(); // Cancel any ongoing speech before starting a new one

    const requestBody = {
      input: { text: text },
      voice: { languageCode: 'sr-RS', name: 'sr-RS-Standard-A' },
      audioConfig: { audioEncoding: 'MP3' }
    };

    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        requestBody
      );

      const audioContent = response.data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);

      return new Promise((resolve) => {
        audio.onended = () => {
          setSpeaking(false); // Reset speaking state when finished
          resolve();
        };
        audio.play();
      });
    } catch (error) {
      console.error('Error synthesizing speech:', error.response ? error.response.data : error.message);
      setSpeaking(false); // Reset speaking state if there is an error
    }
  };

  const readHeadlinesAloud = async () => {
    if (headlines.length === 0) {
      console.log('No headlines to read');
      return;
    }

    for (const headline of headlines) {
      await speak(headline.title);
    }
  };

  const openArticle = (articleNumber) => {
    if (openedArticle === articleNumber) {
      return;
    }

    if (!isNaN(articleNumber) && articleNumber > 0 && articleNumber <= headlines.length) {
      window.open(headlines[articleNumber - 1].url, '_blank');
      setOpenedArticle(articleNumber);
    }
  };

  return (
    <div className="news-app">
      <div className="header">
        <FaRocket className="header-icon" />
        <h1 className="header-title">Techna AI</h1>
      </div>
      <div className="news-container">
        {headlines.map((headline, index) => (
          <div key={index} className="news-item">
            <a href={headline.url} target="_blank" rel="noopener noreferrer">
              <img src={headline.image} alt={headline.title} className="news-image" />
              <p>{headline.title}</p>
            </a>
          </div>
        ))}
      </div>
      <div className="controls">
        {listening ? (
          <button className="btn-stop" onClick={stopListening}>
            <FaStop /> Stop Listening
          </button>
        ) : (
          <button className="btn-listen" onClick={startListening}>
            <FaMicrophone /> Start Listening
          </button>
        )}
      </div>
      <div className="transcript">{transcript}</div>
    </div>
  );
};

export default NewsApp;
