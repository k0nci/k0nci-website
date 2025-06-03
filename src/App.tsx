import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MyPortfolio from './components/MyPortfolio';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MyPortfolio />} />
        {/* Redirect all unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
