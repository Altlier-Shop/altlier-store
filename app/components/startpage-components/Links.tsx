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
        <div className="flex gap-6">
          <button
            onClick={props.onShill}
            className="btn homepage-btn btn-dark pixel-font pointer-events-auto"
          >
            SHILL
          </button>
          <button
            onClick={props.onFud}
            className="btn homepage-btn btn-light pixel-font pointer-events-auto"
          >
            FUD
          </button>
        </div>

        <div className="mt-10 flex justify-between">
          <a
            className="pointer-events-auto w-12"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
          >
            <TelegramIcon />
          </a>
          <a
            className="pointer-events-auto w-12"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
          >
            <TwitterIcon />
          </a>
          <a
            className="pointer-events-auto w-12"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
        <ArrowIcon direction={'top'} />
      </div>
    </div>
  );
}
