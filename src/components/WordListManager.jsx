import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { generateImage } from '../services/OpenAI_API';
import { Upload, Wand2, Home } from 'lucide-react';

const WordListManager = ({ wordList, onWordListUpdate, onHome }) => {
  const [newWordText, setNewWordText] = useState('');
  const [newWordImage, setNewWordImage] = useState(null); // Will store URL or file object
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleAddWord = () => {
    if (!newWordText.trim() || !newWordImage) {
      alert('Please enter a word and upload or generate an image.');
      return;
    }
    const newWord = {
      word: newWordText.trim(),
      image: typeof newWordImage === 'string' ? newWordImage : URL.createObjectURL(newWordImage),
    };
    onWordListUpdate([...wordList, newWord]);
    setNewWordText('');
    setNewWordImage(null);
  };

  const handleDelete = (wordToDelete) => {
    if (window.confirm(`Are you sure you want to delete '${wordToDelete}'?`)) {
      onWordListUpdate(wordList.filter(wordObj => wordObj.word !== wordToDelete));
    }
  };
  
  const handleGenerateClick = async () => {
    if (!newWordText.trim()) {
      alert("Please enter a word before generating an image.");
      return;
    }
    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(newWordText.trim());
      setNewWordImage(imageUrl); // DALL-E returns a URL
    } catch (error) {
      alert("Failed to generate image. Make sure your API key is set correctly in a .env file.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewWordImage(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-3xl font-bold text-center">Manage Word List</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Word</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow">
              <label htmlFor="newWord" className="block text-sm font-medium text-gray-700 mb-1">Word</label>
              <Input
                id="newWord"
                type="text"
                value={newWordText}
                onChange={(e) => setNewWordText(e.target.value)}
                placeholder="E.g., Dinosaur"
                className="mt-1 block w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
              <Button onClick={() => fileInputRef.current.click()} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Upload Image
              </Button>
              <Button onClick={handleGenerateClick} disabled={isGenerating}>
                <Wand2 className="mr-2 h-4 w-4" /> 
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          </div>
          {newWordImage && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">Image Preview:</p>
              <img 
                src={typeof newWordImage === 'string' ? newWordImage : URL.createObjectURL(newWordImage)} 
                alt="Preview" 
                className="mt-2 h-24 w-24 object-cover rounded-md border"
              />
            </div>
          )}
          <Button onClick={handleAddWord} className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white">
            Add Word to List
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Current Words</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wordList.map((wordObj, index) => (
              <div key={index} className="bg-white border p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <img src={wordObj.image} alt={wordObj.word} className="w-24 h-24 object-contain mb-4 rounded-md" />
                <p className="text-xl font-semibold mb-4">{wordObj.word}</p>
                <Button onClick={() => handleDelete(wordObj.word)} variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onHome} 
        className="fixed bottom-4 right-4 bg-green-500/70 hover:bg-green-600/70 text-white px-4 py-2 border-0 z-50"
        title="Home (Ctrl+Shift+H)"
      >
        <Home className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default WordListManager; 