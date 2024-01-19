import GridPage from './startpage-components/GridPage';
import footer_img from '../../public/footer_image.png';
import ArrowIcon from './svg-components/ArrowIcon';
import JoinAltlier from './svg-components/JoinAltlier';
import AltlierLogoCircular from './svg-components/AltlierLogoCircular';
import TelegramIcon from './svg-components/TelegramIcon';
import TwitterIcon from './svg-components/TwitterIcon';
import InstagramIcon from './svg-components/InstagramIcon';
import DiscordIcon from './svg-components/DiscordIcon';

import MirrorIcon from './svg-components/MirrorIcon';
import type {FooterQuery} from 'storefrontapi.generated';
import {Footer} from './Footer';
import {useState} from 'react';
import {setUserEmail} from '~/firebase-service';

export default function FooterPage({menu}: {menu: FooterQuery['menu']}) {
  const [email, setEmail] = useState('');
  const handleSubscribe = () => {
    if (email !== '') {
      setUserEmail(email);
      console.log('subscribed', email);
      setEmail('');
    }
  };
  const handleArrowClick = () => {
    const footer = document.getElementById('footerPage');
    const products = document.getElementById('productPage');
    if (footer && products) {
      footer.classList.remove('currentPage');
      footer.classList.add('bottomPage');
      footer.classList.remove('topPage');
      products.classList.add('currentPage');
    }
    window.scrollBy({left: 0, top: window.innerHeight, behavior: 'smooth'});
  };
  return (
    <div className="flex w-full h-full bg-root-primary relative">
      <div className="pl-[5%] pr-[12%] pt-24 xl:pt-32 w-[45%]">
        <div className="flex gap-6 items-center">
          <div className="h-[10%] w-full flex items-center">
            <JoinAltlier />
          </div>
          <div className="h-[10%] w-48 flex items-center animate-spinSlow">
            <AltlierLogoCircular />
          </div>
        </div>
        <div className="mt-2 xl:mt-8 w-full flex gap-2 items-end">
          <div className="w-full">
            <label htmlFor="email" className="text-lg default-font-bold">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              className="input-box"
            ></input>
          </div>
          <button
            disabled={email !== '' ? false : true}
            onClick={handleSubscribe}
            className={`btn homepage-btn ${
              email !== '' ? 'btn-dark' : 'pixel-font'
            } text-lg h-[42px] px-2 w-1/2`}
          >
            Subscribe
          </button>
        </div>
        <div className="mt-2 xl:mt-8 w-5/6">
          <span className="text-lg default-font-bold">Our Socials</span>

          <div className="mt-4 flex gap-6">
            <a
              className="pointer-events-auto w-12"
              href="https://t.me/altlier_co"
              target="_blank"
              rel="noreferrer"
            >
              <TelegramIcon />
            </a>
            <a
              className="pointer-events-auto w-12"
              href="https://twitter.com/Altlier_co"
              target="_blank"
              rel="noreferrer"
            >
              <TwitterIcon />
            </a>
            <a
              className="pointer-events-auto w-12"
              href="https://www.instagram.com/altlier.co/"
              target="_blank"
              rel="noreferrer"
            >
              <InstagramIcon />
            </a>
            <a
              className="pointer-events-auto w-12"
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              target="_blank"
              rel="noreferrer"
            >
              <DiscordIcon />
            </a>
            <a
              className="pointer-events-auto w-12"
              href="https://mirror.xyz/0xa4F906979A0886C4DB7b9683115fea2f3FfA84f2"
              target="_blank"
              rel="noreferrer"
            >
              <MirrorIcon />
            </a>
          </div>
        </div>
        <Footer menu={menu} shop={null} />
      </div>
      {/* <div className="absolute left-0 bottom-0 w-[45%] h-[30%] bg-altlierBlue pl-[5%] pr-[12%] pt-12 flex justify-between [&>*]:text-root-secondary"> */}

      {/* <div>
          <h1>LEGAL INFO</h1>
          <a>Privacy Policy</a>
        </div>
        <div>SUPPORT</div>
        <div>ABOUT</div> */}
      {/* </div> */}

      <div className="bg-root-secondary relative w-[55%]">
        <GridPage />
        <button
          onClick={handleArrowClick}
          className="absolute top-[5%] left-[30%] flex gap-6 items-center"
        >
          <ArrowIcon direction={'up'} width={'4rem'} />
          <h1 className="mt-6 pixel-font text-3xl">Back to Shop</h1>
        </button>
      </div>
      <div className="absolute top-[10%] left-[35%] h-screen">
        <img
          loading="lazy"
          className="max-h-[88%] object-contain"
          src={footer_img}
          alt="shirt-and-box-footer"
        />
      </div>
    </div>
  );
}
