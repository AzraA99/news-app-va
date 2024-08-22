import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaRocket } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
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

const NewsApp = () => {
  const [listening, setListening] = useState(false);
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

  useEffect(() => {
    console.log('Transcript:', transcript);

    const lowerCaseTranscript = transcript.toLowerCase();

    if (lowerCaseTranscript.includes('start reading')) {
      console.log('Command "start reading" detected');
      readHeadlinesAloud();
    } else if (lowerCaseTranscript.includes('stop')) {
      window.speechSynthesis.cancel();
    } else if (lowerCaseTranscript.startsWith('open article')) {
      const articleNumber = parseInt(lowerCaseTranscript.split(' ')[2], 10);
      openArticle(articleNumber);
    }
  }, [transcript, headlines, openedArticle]);

  const startListening = () => {
    setListening(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setListening(false);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  const speakWithApiHub = async (text) => {
    try {
      const response = await axios.post(
        'https://api.apyhub.com/tts/file',
        null,
        {
          headers: {
            'apy-token': process.env.REACT_APP_APYHUB_API_KEY,
          },
          params: {
            text: text,
            lang: 'hr',
            gender: 'male',
          }
        }
      );

      const audio = new Audio(response.data.url);
      audio.play();
    } catch (error) {
      if (error.response) {
        if (error.response.status === 429) {
          console.error('Rate limit exceeded. Please try again later.');
        } else if (error.response.status === 400) {
          console.error('Bad Request: Check your API parameters.');
        } else {
          console.error('Error using ApiHub TTS:', error.response.status, error.response.data);
        }
      } else if (error.request) {
        console.error('No response from ApiHub:', error.request);
      } else {
        console.error('Error setting up the request:', error.message);
      }
    }
  };

  const readHeadlinesAloud = async () => {
    if (headlines.length === 0) {
      console.log('No headlines to read');
      return;
    }

    for (let i = 0; i < headlines.length; i++) {
      console.log('Reading:', headlines[i].title);
      await speakWithApiHub(headlines[i].title);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
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
        <FaRocket className="header-icon" /> {}
        <h1 className="header-title">Techna AI</h1> {}
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
