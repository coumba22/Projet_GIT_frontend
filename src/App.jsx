import React from 'react';
import Dashboard from './components/Dashboard';
import StudentForm from './components/StudentForm';

function App() {
    return (
        <div>
            <h1>Gestion des Rapports et des Élèves</h1>
            <StudentForm />
            <Dashboard />
        </div>
    );
}

export default App;
