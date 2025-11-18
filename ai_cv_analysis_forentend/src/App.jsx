import React from "react";
import RoutesConfig from "./routes";
import Navbar from "./components/Navbar.jsx";
import { useState } from "react";
const App = () => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="App">
        <RoutesConfig />
      </div>
    </>
  );
};

export default App;
