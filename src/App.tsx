import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./styles/globals.css";

import { Navbar } from "./components/Navbar";
import { CustomersPage } from "./pages/customers";

function App() {
  return (
    <>
      <Navbar />
      <CustomersPage />
    </>
  )
}

export default App