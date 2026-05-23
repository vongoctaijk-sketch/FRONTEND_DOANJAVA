import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import Book from "./page/Book";
import Author from "./page/Author";
import Category from "./page/Category";
import Customer from "./page/Customer";
import HoaDon from "./page/HoaDon";
import Report from "./page/Report";
import PhieuNhap from "./page/PhieuNhap";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./Layout/MainLayout";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* REDIRECT */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* PRIVATE */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="book" element={<Book />} />

        <Route path="author" element={<Author />} />

        <Route path="category" element={<Category />} />

        <Route path="customer" element={<Customer />} />

        <Route path="invoice" element={<HoaDon />} />
        <Route path="import" element={<PhieuNhap />} />
        <Route path="report" element={<Report />} />
      </Route>
    </Routes>
  );
}

export default App;
