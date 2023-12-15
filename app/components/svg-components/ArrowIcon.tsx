export default function ArrowIcon({direction}: {direction: string}) {
  let extraClass = '';
  if (direction === 'left') {
    extraClass = 'rotate-90';
  } else if (direction === 'right') {
    extraClass = '-rotate-90';
  } else {
    extraClass = 'arrow-down';
  }

  return (
    <svg
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 75 104.07"
      width="72"
      className={`ml-[10%] ${extraClass}`}
    >
      <defs>
        <style>{`.cls-1{stroke-width:0px;}`}</style>
      </defs>
      <polygon
        id="Arrow"
        className="cls-1"
        points="75 77.75 75 56.12 46.58 73.27 46.58 0 28.41 0 28.41 73.27 0 56.12 0 77.75 37.5 104.07 75 77.75"
      />
    </svg>
  );
}
