import React from "react";
import { Link } from "react-router-dom";
import logo from "../image/goku.png";
import SearchBar from "./SearchBar";

function Header() {
  return (
    <div className="Header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
        <div className="container-fluid px-4">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src={logo}
              alt="eManga Logo"
              height="40"
              className="d-inline-block me-2"
              style={{ filter: "drop-shadow(0px 0px 3px rgba(255,255,255,0.3))" }}
            />
            <span className="fw-bold" style={{ background: "linear-gradient(45deg, #ff6b6b, #6b47ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              eManga
            </span>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item px-1">
                <Link to="/" className="nav-link active fw-bold">
                  <i className="bi bi-house-door me-1"></i> HOME
                </Link>
              </li>
              <li className="nav-item px-1">
                <Link to="/about" className="nav-link fw-bold">
                  <i className="bi bi-info-circle me-1"></i> ABOUT
                </Link>
              </li>
              <li className="nav-item px-1">
                <Link to="/contact" className="nav-link fw-bold">
                  <i className="bi bi-envelope me-1"></i> CONTACT
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              {/* Enhanced Search Bar with more space */}
              <div className="nav-search d-none d-lg-block flex-grow-1" style={{ minWidth: "320px", maxWidth: "400px" }}>
                <SearchBar />
              </div>
            </div>
          </div>

          {/* Mobile Search Bar with full width */}
          <div className="d-lg-none w-100 mt-3 mb-2">
            <SearchBar />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
