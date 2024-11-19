import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomeScreen from './Screens/HomeScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<HomeScreen />} exact/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
