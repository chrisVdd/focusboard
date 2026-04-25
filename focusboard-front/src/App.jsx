import {Routes, Route} from 'react-router-dom';
import Home from "./pages/Home.jsx";
import BoardView from "./pages/BoardView.jsx";
import VictoryLane from "./pages/VictoryLane.jsx";
import FocusMode from "./pages/FocusMode.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board/:id" element={<BoardView />} />
            <Route path="/victory-lane" element={<VictoryLane />} />
            <Route path="/focus/:taskId" element={<FocusMode />} />
        </Routes>
    );
}

export default  App;