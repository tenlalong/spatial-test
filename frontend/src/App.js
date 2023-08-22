import './App.css';
import Map from './components/maps/Map.js';
import NameAnimation from './components/header/NameAnimation.js';

function App() {
  return (
    <div className="App">
      <NameAnimation></NameAnimation>
      <Map></Map>
    </div>
  );
}

export default App;
