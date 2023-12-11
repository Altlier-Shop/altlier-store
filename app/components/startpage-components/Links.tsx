import testIcon from '../../../public/icons/moneys.svg';
export default function Links() {
  return (
    <div className="flex justify-between">
      <div>
        <div className="flex gap-6">
          <button className="btn homepage-btn btn-dark text-emerald pixel-font">
            SHILL
          </button>
          <button className="btn homepage-btn btn-light pixel-font">FUD</button>
        </div>
        <div className="mt-16">
          <div className="flex gap-8">
            <img className="icon" src={testIcon} alt="testIcon" />
            <img className="icon" src={testIcon} alt="testIcon" />
            <img className="icon" src={testIcon} alt="testIcon" />
            <img className="icon" src={testIcon} alt="testIcon" />
            <img className="icon" src={testIcon} alt="testIcon" />
            <img className="icon" src={testIcon} alt="testIcon" />
          </div>
        </div>
      </div>
      <span className="text-8xl font-bold arrow-down">&darr;</span>
    </div>
  );
}
