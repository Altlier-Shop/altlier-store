import {useState} from 'react';

export default function ArrowIcon({
  direction,
  width,
  still,
}: {
  direction: string;
  width: string;
  still?: boolean;
}) {
  const [useMotionClass, setUseMotionClass] = useState(false);
  // we reuse this component for multiple arrows, hence we need to switch out some classes
  let directionClass = ''; // for arrow direction
  let motionClass = ''; // for motion of arrows on hover
  if (direction === 'left') {
    directionClass = 'rotate-90';
    motionClass = still ? '' : 'arrow-left';
  } else if (direction === 'right') {
    directionClass = '-rotate-90';
    motionClass = still ? '' : 'arrow-right';
  } else if (direction === 'down') {
    directionClass = 'arrow-down';
  } else {
    directionClass = 'arrow-up';
  }

  // console.log(useMotionClass, motionClass);

  return (
    <svg
      id={'arrow-' + direction}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 75 104.07"
      width={width}
      className={`${directionClass} ${useMotionClass ? motionClass : ''}`}
      onMouseOver={() => setUseMotionClass(true)}
      onMouseLeave={() => setUseMotionClass(false)}
    >
      <defs>
        <style>{`.cls-1-arrow{stroke-width:0px;}`}</style>
      </defs>
      <polygon
        id="Arrow"
        className="cls-1-arrow"
        points="75 77.75 75 56.12 46.58 73.27 46.58 0 28.41 0 28.41 73.27 0 56.12 0 77.75 37.5 104.07 75 77.75"
      />
    </svg>
  );
}
