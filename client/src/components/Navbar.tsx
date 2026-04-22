import { Link } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";

export default function Navbar() {
  const { isConnected } = useWebSocket();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-sportz-border bg-sportz-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <span className="font-display text-2xl font-bold tracking-wider text-sportz-text">
              SPORT<span className="text-sportz-live">Z</span>
            </span>
            <div className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-sportz-live/60 to-transparent" />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected
                  ? "bg-sportz-live animate-pulse-dot"
                  : "bg-red-500"
              }`}
            />
            <span className="font-mono text-[11px] tracking-wider text-sportz-text-secondary">
              {isConnected ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
