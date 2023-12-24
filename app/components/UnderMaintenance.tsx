export default function UnderMaintenance() {
  return (
    <div className="h-screen w-screen flex flex-col items-center">
      <h1 className="mt-[20%] text-2xl text-center pixel-font">
        This View is currently under maintenance
      </h1>
      <h1 className="mt-8 text-lg text-center pixel-font">
        We'll soon have a mobile view but for now please use the desktop
      </h1>
    </div>
  );
}
