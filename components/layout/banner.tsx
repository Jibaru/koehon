export function Banner() {
  return (
    <div className="border-b border-zinc-200 bg-zinc-100 px-6 py-2 text-center text-sm dark:border-white/10 dark:bg-zinc-950">
      <span className="text-zinc-600 dark:text-zinc-400">
        Made by{" "}
        <a href="#" className="text-foreground underline hover:no-underline dark:text-white">
          Crafter Station
        </a>
      </span>
    </div>
  );
}
