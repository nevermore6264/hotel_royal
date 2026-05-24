import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { NhaCungCapXacThuc } from "./context/NguCanhXacThuc";
import { NhaCungCapThongBao } from "./context/NguCanhThongBao";
import "./index.css";

const THEME_STORAGE_KEY = "themeRoyal";
try {
  if (localStorage.getItem(THEME_STORAGE_KEY) === "light") {
    document.documentElement.dataset.theme = "light";
  }
} catch {
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NhaCungCapThongBao>
        <NhaCungCapXacThuc>
          <App />
        </NhaCungCapXacThuc>
      </NhaCungCapThongBao>
    </BrowserRouter>
  </React.StrictMode>,
);
