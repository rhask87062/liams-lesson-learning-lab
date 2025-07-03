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

  // Use the specific prompt format requested
  const prompt = `Please generate an image of a ${word.toLowerCase()}, in a cartoonish and colorful style appropriate for a toddler with a transparent background. In a very tight shot so that the images display large in my app.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3", // Using DALL-E 3 as it's the latest model that supports transparency
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: 'url',
      quality: 'standard', // Can be 'standard' or 'hd'
      style: 'vivid' // Can be 'vivid' or 'natural' - vivid is better for cartoonish style
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