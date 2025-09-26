export const imgUri = (imagePath: string): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `http://localhost:5270${imagePath}`;
};
