import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./styles/globals.css";

import { AppRoutes } from "./AppRoutes";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <>
      {location.pathname == "/login" ? (<></>) : (<Navbar />)}
      <AppRoutes />
    </>
  )
}

export default App