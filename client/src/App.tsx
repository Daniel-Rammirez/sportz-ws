import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WebSocketProvider } from "./hooks/useWebSocket";
import Navbar from "./components/Navbar";
import MatchesHub from "./pages/MatchesHub";
import MatchDetail from "./pages/MatchDetail";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WebSocketProvider>
          <div className="relative min-h-screen bg-grid">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<MatchesHub />} />
                <Route path="/match/:id" element={<MatchDetail />} />
              </Routes>
            </main>
          </div>
        </WebSocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
