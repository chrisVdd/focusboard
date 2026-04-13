import {Routes, Route} from 'react-router-dom';
import Home from "./pages/Home.jsx";
import BoardView from "./pages/BoardView.jsx";
import VictoryLane from "./pages/VictoryLane.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board/:id" element={<BoardView />} />
            <Route path="/victory-lane" element={<VictoryLane />} />
        </Routes>
    );
}

export default  App;