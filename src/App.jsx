import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Toolbar from './components/Toolbar'; // Import your Toolbar
import Dashboard from './components/Dashboard';
import StudentForm from './components/StudentForm'; // You might not use this directly in routes but good to keep if needed elsewhere
import GroupList from './components/GroupList';
import './style/App.css';
import StudentProfile from './components/StudentProfile'; // Import your StudentProfile component
import StudentList from './components/StudentList';

// Define your HomePage component, as it's used in your routes
// If this is a separate file, then import it: import HomePage from './components/HomePage';
const HomePage = () => <h2>Bienvenue sur l'Accueil!</h2>;


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <Router>
                    <Toolbar />
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/classes/groups" element={<GroupList />} />
                            <Route path="/classes/students" element={<StudentList />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/students/:id" element={<StudentProfile />} />
                            <Route path="*" element={<div>404 - Page Not Found</div>} />
                        </Routes>
                    </div>
                </Router>
            </header>
            <main>
            </main>
        </div>
    );
}

export default App;