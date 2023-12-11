import {useState, useEffect} from 'react';
export default function GridPage() {
  const [gridSize, setGridSize] = useState(40); // Default grid size
  const updateGridSize = () => {
    // Calculate the grid size based on window width
    const size = Math.max(40, Math.floor(window.innerWidth / 30));
    setGridSize(size);
  };

  useEffect(() => {
    updateGridSize();
    window.addEventListener('resize', updateGridSize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', updateGridSize);
  }, []);

  return (
    <div
      className="h-screen w-full"
      style={{
        backgroundImage: `
          linear-gradient(to right, gray 1px, transparent 1px),
          linear-gradient(to bottom, gray 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    >
      {' '}
    </div>
  );
}
