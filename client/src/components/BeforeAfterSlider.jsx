import { useState, useRef, useEffect } from 'react';

export function BeforeAfterSlider({ beforeImage, afterImage, title }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
      
      const handleResize = () => setContainerWidth(containerRef.current.offsetWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSliderChange = (e) => {
    setSliderPosition(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
      <h3 className="h3" style={{ textAlign: 'center', margin: 0 }}>{title}</h3>
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        {/* Before Image (Background) */}
        <img
          src={beforeImage}
          alt="Before"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none'
          }}
        />

        {/* After Image (Foreground, clipped) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            clipPath: `inset(0 0 0 ${sliderPosition}%)`
          }}
        >
          <img
            src={afterImage}
            alt="After"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              userSelect: 'none'
            }}
          />
        </div>

        {/* Slider Handle UI */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPosition}%`,
            width: '4px',
            backgroundColor: '#ffffff',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            zIndex: 10
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              color: '#333'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            pointerEvents: 'none',
            opacity: sliderPosition < 10 ? 0 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          Before
        </div>
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            pointerEvents: 'none',
            opacity: sliderPosition > 90 ? 0 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          After
        </div>

        {/* Range Input (Invisible overlay for interaction) */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'ew-resize',
            margin: 0,
            zIndex: 20
          }}
        />
      </div>
    </div>
  );
}
