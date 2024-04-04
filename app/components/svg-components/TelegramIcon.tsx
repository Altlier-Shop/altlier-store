import telegram_white from '~/../public/icons-white/telegram_white.png';
export default function TelegramIcon({color}: {color?: string}) {
  if (color === 'green') {
    return <></>;
  } else if (color === 'white') {
    return <img src={telegram_white} alt="telegram icon white" />;
  }
  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="36"
      height="36"
      viewBox="0 0 55 55"
      // style="enable-background:new 0 0 55 55;"
      xmlSpace="preserve"
    >
      <style type="text/css">
        {`
	.st0_tel{fill:#1D1B2F;}
	.st1_tel{fill:#F4EBE4;}
`}
      </style>
      <g id="Telegram">
        <circle className="st0_tel" cx="27.5" cy="27.5" r="27.5" />
        <path
          className="st1_tel"
          d="M40.89,16.33c-0.11-0.31-0.23-0.39-0.43-0.46c-0.43-0.16-1.15,0.08-1.15,0.08s-25.7,9.24-27.17,10.26
		c-0.32,0.22-0.42,0.35-0.47,0.5c-0.25,0.73,0.54,1.05,0.54,1.05l6.62,2.16c0,0,0.25,0.04,0.34-0.02
		c1.51-0.95,15.16-9.57,15.95-9.86c0.12-0.04,0.22,0.01,0.19,0.09c-0.32,1.11-12.18,11.65-12.18,11.65s-0.05,0.06-0.07,0.12
		l-0.02-0.01l-0.62,6.57c0,0-0.26,2.01,1.75,0c1.42-1.42,2.79-2.61,3.48-3.19c2.28,1.57,4.73,3.31,5.79,4.22
		c0.53,0.46,0.98,0.53,1.34,0.52c1-0.04,1.28-1.14,1.28-1.14s4.68-18.85,4.84-21.38c0.02-0.25,0.04-0.4,0.04-0.58
		C40.95,16.68,40.93,16.44,40.89,16.33z"
        />
      </g>
    </svg>
  );
}
