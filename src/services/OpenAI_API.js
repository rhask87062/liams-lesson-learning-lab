import OpenAI from 'openai';

export const generateImage = async (word) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("The VITE_OPENAI_API_KEY environment variable is missing or empty.");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // This is required for client-side API calls
  });

  const prompt = `A simple, toddler-friendly cartoon illustration of ${word}. The background MUST be transparent.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: 'url',
    });
    
    if (response.data && response.data.length > 0) {
      return response.data[0].url;
    } else {
      throw new Error("No image data received from OpenAI.");
    }
  } catch (error) {
    console.error("Error generating image with OpenAI:", error);
    throw error;
  }
}; 