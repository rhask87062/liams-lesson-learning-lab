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
  const prompt = `Please generate a cartoonish and colorful image of a ${word.toLowerCase()}, with a transparent background.`;

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1", // Changed to gpt-image-1 as per documentation
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      // response_format: 'url', // This parameter is not supported by gpt-image-1
      quality: 'auto', // Changed to 'auto' as per gpt-image-1 documentation
      // style: 'vivid' // This parameter is not supported by gpt-image-1
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

export const categorizeWord = async (word) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("The VITE_OPENAI_API_KEY environment variable is missing or empty.");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true 
  });

  const prompt = `Categorize the following English word into one of these categories: animals, food, objects, nature, people, places, vehicles, clothes, music, fantasy, or custom. Provide only the category name as a single word. Word: ${word}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        { role: "system", content: "You are a helpful assistant that categorizes words." },
        { role: "user", content: prompt }
      ],
      max_tokens: 10,
      temperature: 0.5,
    });

    if (response.choices && response.choices.length > 0 && response.choices[0].message) {
      let category = response.choices[0].message.content.trim().toLowerCase();
      // Simple validation for common categories, default to 'custom' if unexpected
      const validCategories = ['animals', 'food', 'objects', 'nature', 'people', 'places', 'vehicles', 'clothes', 'music', 'fantasy'];
      if (!validCategories.includes(category)) {
        category = 'custom';
      }
      return category;
    } else {
      console.warn("No category received from OpenAI, defaulting to 'custom'.");
      return 'custom';
    }
  } catch (error) {
    console.error("Error categorizing word with OpenAI:", error);
    return 'custom'; // Fallback category on error
  }
}; 