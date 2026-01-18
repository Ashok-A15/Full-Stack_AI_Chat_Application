import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
      <Outlet /> {/* Nested routes will render here */}
    </div>
  );
};

export default App;
