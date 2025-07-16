import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import PickAndPack1 from './pages/PickAndPack1';
import PickAndPack2 from './pages/PickAndPack2';
import WashAndPack1 from './pages/WashAndPack1';
import WashAndPack2 from './pages/WashAndPack2';
import MakeAndPack1 from './pages/MakeAndPack1';
import MakeAndPack2 from './pages/MakeAndPack2';
import MakeAndPack3 from './pages/MakeAndPack3';
import MakeAndPack4 from './pages/MakeAndPack4';
import DashboardPage from './pages/DashboardPage';
import AdminLogin from './pages/AdminLogin';
import FileUpload from './pages/FileUpload';
import DashboardUI from './pages/DashboardUI';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Router>
        <Routes>
        <Route path="/" element={<MainPage />} /> 

        <Route path="/pick-pack1" element={<PickAndPack1 />} />
        <Route path="/pick-pack2" element={<PickAndPack2 />} />

        <Route path="/wash-pack1" element={<WashAndPack1 />} />
        <Route path="/wash-pack2" element={<WashAndPack2 />} />
        
        <Route path="/make-pack1" element={<MakeAndPack1 />} />
        <Route path="/make-pack2" element={<MakeAndPack2 />} />
        <Route path="/make-pack3" element={<MakeAndPack3 />} />
        <Route path="/make-pack4" element={<MakeAndPack4 />} />

        <Route path="/admin-login" element={<AdminLogin onLogin={() => setIsAuthenticated(true)}/>} />
          
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/admin-login" replace />}/> */}

        <Route path="/dashboardUI" element={<DashboardUI />} />
        {/* <Route path="/dashboardUI" element={isAuthenticated ? <DashboardUI /> : <Navigate to="/admin-login" replace />}/> */}

        {/* <Route path="/file-upload" element={<FileUpload />} /> */}
        <Route path="/file-upload" element={isAuthenticated ? <FileUpload /> : <Navigate to="/admin-login" replace />}/>
       
        </Routes>
    </Router>
  );
}

export default App;