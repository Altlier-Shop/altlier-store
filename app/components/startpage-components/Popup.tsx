interface PopupProps {
  onClose(): void;
  onShill(): void;
}
export default function Popup(props: PopupProps) {
  return (
    <div className="retro-border border-4 text-xl">
      <div className="bg-gradient-to-r from-neutral-900 from-5% to-neutral-500 to-85%  p-2 flex justify-between items-center">
        <span className="font-bold text-white">ERROR 404: FUDDER</span>
        <button
          onClick={props.onClose}
          className="w-8 h-8 bg-popup active:bg-neutral-400 border-2 retro-border"
        >
          X
        </button>
      </div>
      <div className="bg-popup px-8 py-6 flex">
        <div className="w-1/4">HI</div>
        <div className="w-3/4 grid">
          <span className="text-black mb-4">
            Seems like the page you are trying to enter does not exist.
          </span>
          <button
            onClick={props.onShill}
            className="w-fit retro-border border-2 bg-popup active:bg-neutral-400 py-2 px-6 my-4 justify-self-center"
          >
            Become a shill instead :)
          </button>
        </div>
      </div>
    </div>
  );
}
