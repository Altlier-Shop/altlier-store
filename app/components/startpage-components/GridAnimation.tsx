import {useEffect, useState} from 'react';
import Frame1 from '../../../public/landing-page-animation/Frame1.png';
import Frame2 from '../../../public/landing-page-animation/Frame2.png';
import Frame3 from '../../../public/landing-page-animation/Frame3.png';
import Frame4 from '../../../public/landing-page-animation/Frame4.png';
import Frame5 from '../../../public/landing-page-animation/Frame5.png';
import Frame6 from '../../../public/landing-page-animation/Frame6.png';
import Frame7 from '../../../public/landing-page-animation/Frame7.png';
import Frame8 from '../../../public/landing-page-animation/Frame8.png';
import Frame9 from '../../../public/landing-page-animation/Frame9.png';
import Frame10 from '../../../public/landing-page-animation/Frame10.png';
import Frame11 from '../../../public/landing-page-animation/Frame11.png';
import Frame12 from '../../../public/landing-page-animation/Frame12.png';
import Frame13 from '../../../public/landing-page-animation/Frame13.png';
import Frame14 from '../../../public/landing-page-animation/Frame14.png';
import Frame15 from '../../../public/landing-page-animation/Frame15.png';
import Frame16 from '../../../public/landing-page-animation/Frame16.png';
import Frame17 from '../../../public/landing-page-animation/Frame17.png';
import Frame18 from '../../../public/landing-page-animation/Frame18.png';
import Frame19 from '../../../public/landing-page-animation/Frame19.png';
import Frame20 from '../../../public/landing-page-animation/Frame20.png';
import Frame21 from '../../../public/landing-page-animation/Frame21.png';
import Frame22 from '../../../public/landing-page-animation/Frame22.png';
import Frame23 from '../../../public/landing-page-animation/Frame23.png';
import Frame24 from '../../../public/landing-page-animation/Frame24.png';
import Frame25 from '../../../public/landing-page-animation/Frame25.png';
import Frame26 from '../../../public/landing-page-animation/Frame26.png';
import Frame27 from '../../../public/landing-page-animation/Frame27.png';
import Frame28 from '../../../public/landing-page-animation/Frame28.png';
import Frame29 from '../../../public/landing-page-animation/Frame29.png';
import Frame30 from '../../../public/landing-page-animation/Frame30.png';

interface GridProps {
  scrollProportion: number;
}

export default function GridAnimation(props: GridProps) {
  const [gridImage, setGridImage] = useState<number | null>(null);

  const imageList = [
    Frame1,
    Frame2,
    Frame3,
    Frame4,
    Frame5,
    Frame6,
    Frame7,
    Frame8,
    Frame9,
    Frame10,
    Frame11,
    Frame12,
    Frame13,
    Frame14,
    Frame15,
    Frame16,
    Frame17,
    Frame18,
    Frame19,
    Frame20,
    Frame21,
    Frame22,
    Frame23,
    Frame24,
    Frame25,
    Frame26,
    Frame27,
    Frame28,
    Frame29,
    Frame30,
  ];
  const imageListLength = imageList.length;

  useEffect(() => {
    let newFrame = Math.floor(imageListLength * props.scrollProportion);
    newFrame = newFrame === imageListLength ? newFrame - 1 : newFrame;
    // console.log(newFrame, props.scrollProportion, imageList[newFrame]);

    setGridImage(newFrame);
  }, [props, imageListLength]);

  return (
    <div className="absolute -top-[5%] z-10">
      {gridImage !== null ? (
        <img src={imageList[gridImage]} alt="grid-animation" />
      ) : (
        <div />
      )}
    </div>
  );
}
