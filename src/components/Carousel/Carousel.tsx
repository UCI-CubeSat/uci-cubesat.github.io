import { useState, useEffect } from 'react';
import "./Carousel.css"

const ImageCarousel = () => {
  const images = [
    '/power/img-1.jpg',
    '/structures/img-1.jpg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setFade(true);

    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true);
      }, 1000); 
    }, 20000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="image-carousel">
      <img
        src={images[currentIndex]}
        alt="carousel"
        className={`carousel-image ${fade ? 'fade-in' : 'fade-out'}`}
      />
    </div>
  );
};

export default ImageCarousel;
