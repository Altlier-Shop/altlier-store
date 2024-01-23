import ArrowIcon from '../svg-components/ArrowIcon';
// import DiscordIcon from '../svg-components/DiscordIcon';
import InstagramIcon from '../svg-components/InstagramIcon';
import MirrorIcon from '../svg-components/MirrorIcon';
import TelegramIcon from '../svg-components/TelegramIcon';
import TwitterIcon from '../svg-components/TwitterIcon';
// import WhitePaperIcon from '../svg-components/WhitePaperIcon';
interface LinksProps {
  onShill(): void;
  onFud(): void;
}
export default function Links(props: LinksProps) {
  const handleArrowClick = () => {
    const landing = document.getElementById('landingPage');
    const products = document.getElementById('productPage');
    if (landing && products) {
      landing.classList.remove('currentPage', 'z-30');
      products.classList.add('topPage');
      products.classList.remove('bottomPage');
      products.classList.add('currentPage');
    }
    window.scrollBy({left: 0, top: window.innerHeight, behavior: 'smooth'});
  };
  return (
    <div className="flex">
      <div className="max-w-lg w-full">
        <div className="flex gap-6 w-full">
          <button
            onClick={handleArrowClick}
            className="btn homepage-btn w-full btn-dark pointer-events-auto "
          >
            SHILL
          </button>
          <button
            onClick={props.onFud}
            className="btn homepage-btn w-full btn-light pixel-font pointer-events-auto"
          >
            FUD
          </button>
        </div>

        <div className="mt-10 flex gap-8">
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
          {/* <a
            className="pointer-events-auto w-12"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
          >
            <DiscordIcon />
          </a> */}
          {/* <a
            className="pointer-events-auto w-12"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
          >
            <WhitePaperIcon />
          </a> */}
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
      <button
        className="ml-[10%] h-fit pointer-events-auto"
        onClick={handleArrowClick}
      >
        <ArrowIcon direction={'down'} width={'4rem'} />
      </button>
    </div>
  );
}
