import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Editor from "./Editor";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents/:id" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
