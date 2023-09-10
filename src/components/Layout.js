import React from "react";
import Header from "./Header";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="Layout d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-light">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
