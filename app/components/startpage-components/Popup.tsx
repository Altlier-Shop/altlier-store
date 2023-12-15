import WarningIcon from '../svg-components/WarningIcon';

interface PopupProps {
  onClose(): void;
  onShill(): void;
}
export default function Popup(props: PopupProps) {
  return (
    <div className="retro-border border-4 text-xl w-1/4">
      <div className="bg-gradient-to-r from-neutral-900 from-5% to-neutral-500 to-85%  p-2 flex justify-between items-center">
        <span className="font-bold text-white">ERROR 404: FUDDER</span>
        <button
          onClick={props.onClose}
          className="w-8 h-8 bg-root-tertiary active:bg-neutral-400 border-2 retro-border"
        >
          X
        </button>
      </div>
      <div className="bg-root-tertiary">
        <div className="px-8 pt-6 flex justify-around items-end">
          <div className="w-1/5">
            <WarningIcon />
          </div>
          <div className="w-3/4 grid">
            <span className="text-black mb-2">
              Seems like the page you are trying to enter does not exist.
            </span>
          </div>
        </div>
        <div className="w-full grid justify-end py-6">
          <button
            onClick={props.onShill}
            className="w-fit retro-border mr-24 border-2 bg-root-tertiary active:bg-neutral-400 py-2 px-6 my-4 justify-self-center"
          >
            Become a shill instead :)
          </button>
        </div>
      </div>
    </div>
  );
}
