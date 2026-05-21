import { useState } from "react";
import "./App.css";
import DesignPattern from "./DesignPattern";
import MainPage from "./MainPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MainPage />
    </>
  );
}

export default App;
