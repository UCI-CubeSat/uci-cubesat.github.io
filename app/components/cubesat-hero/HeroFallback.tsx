export function HeroFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <img
        src="/renders/antsat01.png"
        alt=""
        aria-hidden="true"
        className="max-w-[420px] max-sm:max-w-[260px] h-auto opacity-70 animate-pulse"
        draggable={false}
      />
    </div>
  );
}
