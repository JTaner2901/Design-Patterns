import { Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import DesignPattern from "./DesignPattern";
import Fullscreenvideo from "./components/Fullscreenvideo";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/design-pattern" element={<DesignPattern />} />
      <Route path="/fullscreen-video" element={<Fullscreenvideo />} />
    </Routes>
  );
}
