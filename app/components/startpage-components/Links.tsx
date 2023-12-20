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
  return (
    <div className="flex">
      <div className="max-w-lg w-full">
        <div className="flex gap-6 w-full">
          <button
            onClick={props.onShill}
            className="btn homepage-btn w-1/2 btn-dark pixel-font pointer-events-auto 2xl:text-4xl lg:text-2xl md:text-lg"
          >
            SHILL
          </button>
          <button
            onClick={props.onFud}
            className="btn homepage-btn w-1/2 btn-light pixel-font pointer-events-auto 2xl:text-4xl lg:text-2xl md:text-lg"
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
      <div className="ml-[10%]">
        <ArrowIcon direction={'top'} width={'4rem'} />
      </div>
    </div>
  );
}
