import './App.css';
import HexGridExample from './components/grid/HexGridExample';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Heart RPG Delve Map Planner</h1>
        <p>Welcome to the Heart RPG Delve Map planning tool!</p>
      </header>
      <main>
        <HexGridExample />
      </main>
    </div>
  );
}

export default App;