import {useState, useEffect, useRef} from 'react';
import testIcon from '../../../public/icons/moneys.svg';
import handleRequest from '~/entry.server';
export default function GridPage() {
  const [gridSize, setGridSize] = useState(40); // Default grid size
  const gridDiv = useRef<HTMLDivElement>(null);

  const updateGridSize = () => {
    const currentGrid = gridDiv.current;
    if (currentGrid) {
      // Calculate the grid size based on window width
      const size = Math.max(40, Math.floor(currentGrid.clientWidth / 15));
      setGridSize(size);
    }
  };

  useEffect(() => {
    updateGridSize();
    window.addEventListener('resize', updateGridSize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', updateGridSize);
  }, []);

  return (
    <div
      ref={gridDiv}
      className="h-screen w-full"
      style={{
        backgroundImage: `
          linear-gradient(to right, gray 1px, transparent 1px),
          linear-gradient(to bottom, gray 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    >
      <div className="w-full h-full flex flex-col justify-center items-end pr-20 gap-6">
        <a href="#cart-aside">
          <img
            className="icon pointer-events-auto"
            src={testIcon}
            alt="testIcon"
          />
        </a>

        <a href="/account">
          <img
            className="icon pointer-events-auto"
            src={testIcon}
            alt="testIcon"
          />
        </a>
      </div>
    </div>
  );
}
