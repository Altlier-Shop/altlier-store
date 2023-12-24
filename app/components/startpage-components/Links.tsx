import ArrowIcon from '../svg-components/ArrowIcon';
import DiscordIcon from '../svg-components/DiscordIcon';
import InstagramIcon from '../svg-components/InstagramIcon';
import TelegramIcon from '../svg-components/TelegramIcon';
import TwitterIcon from '../svg-components/TwitterIcon';
import WhitePaperIcon from '../svg-components/WhitePaperIcon';
interface LinksProps {
  onShill(): void;
  onFud(): void;
}
export default function Links(props: LinksProps) {
  const handleArrowClick = () => {
    window.scrollBy({left: 0, top: window.innerHeight, behavior: 'smooth'});
  };
  return (
    <div className="flex">
      <div className="max-w-lg w-full">
        <div className="flex gap-6 w-full">
          <button
            onClick={props.onShill}
            className="btn homepage-btn w-full btn-dark pointer-events-auto"
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

        <div className="mt-10 flex justify-between">
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
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
          >
            <WhitePaperIcon />
          </a>
        </div>
      </div>
      <button
        className="ml-[10%] h-fit pointer-events-auto"
        onClick={handleArrowClick}
      >
        <ArrowIcon direction={'top'} width={'4rem'} />
      </button>
    </div>
  );
}
