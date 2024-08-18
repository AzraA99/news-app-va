import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Howl } from 'howler';
import './NewsApp.css';

const API_URL = 'https://newsapi.org/v2/top-headlines';
const API_KEY = '53a7c71c6cd54bf3ba234870997377e9';

const NewsApp = () => {
  const [headlines, setHeadlines] = useState([]);
  const [listening, setListening] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    console.log('Transcript:', transcript); 
    if (transcript.toLowerCase().includes('start reading')) {
      console.log('Command "start reading" detected'); 
      readHeadlinesAloud();
    }
  }, [transcript]);

  const fetchNews = async () => {
    try {
      const params = { country: 'us', apiKey: API_KEY };
      const response = await axios.get(API_URL, { params });
      setHeadlines(response.data.articles);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const startListening = () => {
    setListening(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setListening(false);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  const readHeadlinesAloud = () => {
    if (headlines.length === 0) {
      console.log('No headlines to read');
      return;
    }

    headlines.forEach((headline) => {
      console.log('Reading:', headline.title);
      const sound = new Howl({
        src: [`https://translate.google.com/translate_tts?ie=UTF-8&tl=en&q=${encodeURIComponent(headline.title)}&client=tw-ob`],
        onloaderror: (id, error) => console.error('Howl error:', error),
        onplayerror: (id, error) => console.error('Howl play error:', error)
      });
      sound.play();
    });
  };

  return (
    <div className="news-app">
      <h1>Voice Assistant News</h1>
      <div className="news-container">
        {headlines.map((headline, index) => (
          <a key={index} href={headline.url} target="_blank" rel="noopener noreferrer" className="news-item">
            {headline.title}
          </a>
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
