import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import OutagePage from "./pages/OutagePage";
import RouterPage from "./pages/RouterPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/outage" element={<OutagePage />} />
        <Route path="/router" element={<RouterPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;