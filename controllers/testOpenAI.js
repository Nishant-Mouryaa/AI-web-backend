// testOpenAI.js

const axios = require('axios');
require('dotenv').config();

const testOpenAI = async () => {
  const userPrompt = 'Hello, OpenAI!';

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly chatbot.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    console.log('OpenAI Response:', response.data.choices[0].message.content.trim());
  } catch (error) {
    if (error.response) {
      console.error('Error Response from OpenAI:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('No Response Received:', error.request);
    } else {
      console.error('Error Setting Up Request:', error.message);
    }
  }
};

testOpenAI();
