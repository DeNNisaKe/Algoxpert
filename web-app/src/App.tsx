import { BrowserRouter, Route, Routes } from "react-router-dom";
import ImportDataComponent from "./components/import-data.component";
import Navbar from "./components/navbar";
import MySessionsComponent from "./components/my-sessions.component";
import MyAlgorithms from "./components/my-algorithms";
import NewAlgorithm from "./components/new-algorithm";
import AllResults from "./components/all-results";

function App() {
  return (
    <div style={{ position: "relative" }}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ImportDataComponent />} />
          <Route path="/sessions" element={<MySessionsComponent />}></Route>
          <Route path="/algorithms" element={<MyAlgorithms />}></Route>
          <Route path="/new-algorithm" element={<NewAlgorithm />}></Route>
          <Route path="/results" element={<AllResults />}></Route>
          <Route path="*">"404 Not Found"</Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
