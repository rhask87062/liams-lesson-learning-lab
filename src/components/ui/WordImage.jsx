import React from 'react';

const WordImage = ({ image, word, className = "text-6xl md:text-8xl mb-6 tablet-emoji" }) => {
  // Check if it's a base64 image, a file path, or an emoji
  const isBase64Image = typeof image === 'string' && image.startsWith('data:image/');
  const isImagePath = typeof image === 'string' && (image.includes('/') || image.includes('.png') || image.includes('.jpg'));
  const isImage = isBase64Image || isImagePath;

  if (isImage) {
    return (
      <div className={className}>
        <img 
          src={image} 
          alt={word} 
          className="h-32 md:h-40 w-auto object-contain mx-auto"
        />
      </div>
    );
  }

  // It's an emoji or text
  return <div className={className}>{image}</div>;
};

export default WordImage; 