import {Routes, Route} from 'react-router-dom';
import Home from "./pages/Home.jsx";
import BoardView from "./pages/BoardView.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board/:id" element={<BoardView />} />
        </Routes>
    );
}

export default  App;