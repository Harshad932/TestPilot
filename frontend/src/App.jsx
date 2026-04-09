import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Home from "./components/Home";
import TestCaseGenerator from "./components/TestCaseGenerator/TestCaseGenerator";

function App() {

  return (
    
      <Router>
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generator" element={<TestCaseGenerator />} />
         </Routes>
      </Router>
  );
}

export default App
