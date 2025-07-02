import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Trash2, Plus, Download, Home, Loader2 } from 'lucide-react';
import { generateImage } from '../services/OpenAI_API.js';

const WordListManager = ({ wordList, onWordListUpdate, onHome }) => {
  const [newWord, setNewWord] = useState('');
  const [newImage, setNewImage] = useState('');
  const [generatingImage, setGeneratingImage] = useState(null);
  const [generatingNewImage, setGeneratingNewImage] = useState(false);

  // Helper function to download image and convert to base64
  const downloadAndConvertToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  };

  const handleAddWord = () => {
    if (newWord.trim()) {
      const newWordObj = {
        word: newWord.trim().toUpperCase(),
        image: newImage || '❓'
      };
      onWordListUpdate([...wordList, newWordObj]);
      setNewWord('');
      setNewImage('');
    }
  };

  const handleDeleteWord = (index) => {
    const updatedList = wordList.filter((_, i) => i !== index);
    onWordListUpdate(updatedList);
  };

  const handleGenerateImage = async (index) => {
    setGeneratingImage(index);
    try {
      const word = wordList[index].word;
      const imageUrl = await generateImage(word);
      
      // Download and convert to base64
      const base64Image = await downloadAndConvertToBase64(imageUrl);
      
      // Update the word list with the base64 image
      const updatedList = [...wordList];
      updatedList[index] = { ...updatedList[index], image: base64Image };
      onWordListUpdate(updatedList);
    } catch (error) {
      console.error('Error generating or saving image:', error);
      alert('Failed to generate image. Please check your OpenAI API key and billing.');
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleGenerateNewImage = async () => {
    if (!newWord.trim()) return;
    setGeneratingNewImage(true);
    try {
      const imageUrl = await generateImage(newWord.trim());
      const base64Image = await downloadAndConvertToBase64(imageUrl);
      setNewImage(base64Image);
    } catch (error) {
      console.error('Error generating or saving image:', error);
      alert('Failed to generate image. Please check your OpenAI API key and billing.');
    } finally {
      setGeneratingNewImage(false);
    }
  };

  const handleNewImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (index, newImage) => {
    const updatedList = [...wordList];
    updatedList[index] = { ...updatedList[index], image: newImage };
    onWordListUpdate(updatedList);
  };

  const exportWordList = () => {
    const dataStr = JSON.stringify(wordList, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'wordlist.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importWordList = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedList = JSON.parse(e.target.result);
          onWordListUpdate(importedList);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const isImageBase64 = (image) => {
    return typeof image === 'string' && image.startsWith('data:image/');
  };

  const isImagePath = (image) => {
    return typeof image === 'string' && (image.includes('/') || image.includes('.png') || image.includes('.jpg'));
  };

  return (
    <div className="h-full max-h-screen bg-gray-100 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-3xl font-bold text-center">Manage Word List</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
              placeholder="Add new word..."
              className="flex-1"
            />
            <label>
              <Button asChild className="bg-gray-500/80 hover:bg-gray-600/80">
                <span>Upload</span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewImageUpload}
                className="hidden"
              />
            </label>
            <Button
              onClick={handleGenerateNewImage}
              disabled={generatingNewImage || !newWord.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {generatingNewImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={handleAddWord} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {newImage && (
            <div className="flex items-center mb-4 gap-2">
              <img src={newImage} alt="preview" className="h-10 w-10 object-contain" />
              <Button onClick={() => setNewImage('')} size="sm" variant="destructive">
                Clear
              </Button>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <Button onClick={exportWordList} className="flex-1">
              Export Word List
            </Button>
            <label className="flex-1">
              <Button className="w-full" asChild>
                <span>Import Word List</span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importWordList}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Word
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wordList.map((wordObj, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {wordObj.word}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {isImageBase64(wordObj.image) ? (
                          <img src={wordObj.image} alt={wordObj.word} className="h-10 w-10 object-contain" />
                        ) : isImagePath(wordObj.image) ? (
                          <img src={wordObj.image} alt={wordObj.word} className="h-10 w-10 object-contain" />
                        ) : (
                          <span className="text-2xl">{wordObj.image}</span>
                        )}
                        <Input
                          type="text"
                          value={isImageBase64(wordObj.image) ? '[Generated Image]' : wordObj.image}
                          onChange={(e) => !isImageBase64(wordObj.image) && handleImageChange(index, e.target.value)}
                          className="w-24"
                          disabled={isImageBase64(wordObj.image)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleGenerateImage(index)}
                          disabled={generatingImage === index}
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          {generatingImage === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeleteWord(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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