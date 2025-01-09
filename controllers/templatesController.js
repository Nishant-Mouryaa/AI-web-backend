// src/controllers/templatesController.js

const axios = require('axios');
require('dotenv').config();

const huggingFaceToken = process.env.HUGGING_FACE_API_TOKEN;
// Controller to handle template suggestions
exports.getTemplateSuggestions = async (req, res) => {
  const { websiteType, industry } = req.body;

  // Input validation
  if (!websiteType || !industry) {
    return res.status(400).json({ message: 'websiteType and industry are required' });
  }

  // Construct the prompt for the AI model
  const userPrompt = `Provide a list of 5 website template suggestions for a user who wants to create a ${websiteType} website in the ${industry} industry. For each template, include the following details:
  
1. Template Name
2. Description
3. Key Features
4. Recommended Use Cases

Format the response in a clear and organized manner.`;

  try {
    // Make a request to Hugging Face's Inference API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2', // Replace 'gpt2' with desired model
      {
        inputs: userPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${huggingFaceToken}`, // Replace with your actual token
          'Content-Type': 'application/json',
        },
      }
    );

    // Hugging Face returns an array of generated texts
    const suggestions = response.data[0]?.generated_text.trim();

    if (!suggestions) {
      return res.status(500).json({ message: 'No suggestions generated' });
    }

    res.status(200).json({ suggestions });
  } catch (error) {
    if (error.response) {
      console.error('Error Response from Hugging Face:', {
        status: error.response.status,
        data: error.response.data,
      });
      res.status(error.response.status).json({ message: error.response.data.error || 'Failed to fetch template suggestions' });
    } else if (error.request) {
      console.error('No Response Received:', error.request);
      res.status(500).json({ message: 'No response from Hugging Face API' });
    } else {
      console.error('Error Setting Up Request:', error.message);
      res.status(500).json({ message: 'Error setting up request to Hugging Face API' });
    }
  }
};
