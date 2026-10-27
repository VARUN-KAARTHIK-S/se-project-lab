import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signinpage from "./pages/Signinpage";
import Signuppage from "./pages/Signuppage";

import AvailableCars from "./pages/AvailableCars";
import BookCar from "./pages/BookCar";
import ListCar from "./pages/ListCar";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signinpage />} />
        <Route path="/signup" element={<Signuppage />} />
        <Route path="/available-cars" element={<AvailableCars />} />
        <Route path="/book-car" element={<BookCar />} />
        <Route path="/list-car" element={<ListCar />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
