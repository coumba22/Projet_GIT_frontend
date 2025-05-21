// src/components/Toolbar.jsx (or src/Toolbar.jsx)

import React, { useState } from 'react'; // Import useState for managing component state
import { Link } from 'react-router-dom';
import '../style/Toolbar.css'; // Ensure the path to your CSS file is correct
import logo from '../assets/logo_gitA.png'; 

function Toolbar() {
    // State to manage the open/closed status of each dropdown
    const [isClassesDropdownOpen, setIsClassesDropdownOpen] = useState(false);
    const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);

    // Function to toggle the "Mes classes" dropdown
    const toggleClassesDropdown = () => {
        setIsClassesDropdownOpen(!isClassesDropdownOpen);
        // Close the other dropdown if it's open to prevent multiple menus open simultaneously
        setIsDashboardDropdownOpen(false);
    };

    // Function to toggle the "Tableau de bord" dropdown
    const toggleDashboardDropdown = () => {
        setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
        // Close the other dropdown if it's open
        setIsClassesDropdownOpen(false);
    };

    // Function to close all dropdowns, typically called when a link within a dropdown is clicked
    const closeAllDropdowns = () => {
        setIsClassesDropdownOpen(false);
        setIsDashboardDropdownOpen(false);
    };

    return (
        <nav className="toolbar">
            <div className="toolbar-left">
                <Link to="/" className="toolbar-logo" onClick={closeAllDropdowns}>
                    <img src={logo} alt="Mon Application Logo" className="toolbar-logo-img" />
                </Link>
            </div>
            <ul className="toolbar-nav">
                {/* 'Mes classes' Dropdown Menu */}
                <li className="dropdown">
                    {/* Clickable element to toggle the dropdown */}
                    <span onClick={toggleClassesDropdown} className="dropdown-toggle">
                        Mes classes
                    </span>
                    {/* Conditionally render the dropdown menu if it's open */}
                    {isClassesDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li>
                                {/* CHANGE THIS LINE */}
                                <Link to="/classes/groups" onClick={closeAllDropdowns}>Groupes - Projet</Link>
                            </li>
                            <li>
                                <Link to="/classes/students" onClick={closeAllDropdowns}>Classes - TDs</Link>
                            </li>
                            {/* Add more sub-links for "Mes classes" here if needed */}
                        </ul>
                    )}
                </li>

                {/* 'Tableau de bord' Dropdown Menu */}
                <li className="dropdown">
                    {/* Clickable element to toggle the dropdown */}
                    <span onClick={toggleDashboardDropdown} className="dropdown-toggle">
                        Tableau de bord
                    </span>
                    {/* Conditionally render the dropdown menu if it's open */}
                    {isDashboardDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li>
                                {/* Assuming '/dashboard' is the main dashboard view */}
                                <Link to="/dashboard" onClick={closeAllDropdowns}>Vue Générale</Link>
                            </li>
                            {/* Add more sub-links for "Tableau de bord" here if needed */}
                        </ul>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default Toolbar;