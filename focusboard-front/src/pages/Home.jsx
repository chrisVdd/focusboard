import { useState, useEffect } from "react";
import BoardList from "../components/BoardList.jsx";
import BoardForm from "../components/BoardForm.jsx";

function Home() {

    // 1. The component memory
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Load datas
  const loadBoards = () => {
      fetch('https://localhost/api/boards', {
          headers: {
              'Accept': 'application/ld+json'
          }
      })
          .then(response => {
              if (!response.ok) throw new Error("Error during retrieving")
              return response.json()
          })
          .then(data => {
              setBoards(data.member || []);
              setIsLoading(false);
          })
          .catch(error => {
              console.error('Error while connecting: ', error);
              setIsLoading(false);
          });
  };

  // 3. Calling the data
  useEffect(() => {
      loadBoards();
  }, []);

  const handleBoardAdded = (newBoard) => {
      loadBoards();
  };

  // 3. Interface (JSX + Tailwind)
  return (
      <div className="min-h-screen bg-slate-900 p-8 text-white">
          <h1 className="text-4xl font-bold text-emerald-400 mb-8 tracking-wide">
              FocusBoard
          </h1>

          <BoardForm onBoardAdded={handleBoardAdded} />
          <BoardList boards={boards} isLoading={isLoading} />
      </div>
  );
}

export default Home