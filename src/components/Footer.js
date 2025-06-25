import React from "react";
import { Link } from "react-router-dom"
import img from "../image/goku_2.png"
const Footer = () => {
    return (
        <footer className="bg-dark text-white py-5 mt-5">
            <div className="container">
                <div className="row">
                    {/* About Us Section */}
                    <div className="col-lg-5 mb-4">
                        <h5 className="text-uppercase fw-bold mb-3">ABOUT US</h5>
                        <p className="small">
                            Welcome to our Web Manga Code Project!
                            We are Nhan and Thi, two individuals passionate about manga, technology, and creative endeavors.
                            This project was created to combine these two passions and provide a unique experience for manga enthusiasts worldwide.
                        </p>
                        <p className="small">
                            Our project is a perfect blend of programming expertise and a love for manga.
                            Our website offers you the opportunity to explore and read fantastic manga series with a user-friendly and accessible interface.
                            We continuously strive to create a safe, friendly, and diverse online environment for manga enthusiasts.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="col-lg-3 mb-4">
                        <h5 className="text-uppercase fw-bold mb-3">CONTACT</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><i className="bi bi-telephone-fill me-2"></i>0823 346 347</li>
                            <li className="mb-2"><i className="bi bi-envelope-fill me-2"></i>21521219@gm.uit.edu.vn</li>
                            <li className="mb-2"><a href="https://uit-ntn.github.io/portfolio/" className="text-white text-decoration-none">
                                <i className="bi bi-person-fill me-2"></i>About Nhan
                            </a></li>
                            <li className="mb-2"><a href="https://www.facebook.com/aithi.992969" className="text-white text-decoration-none">
                                <i className="bi bi-person-fill me-2"></i>About Thi
                            </a></li>
                            <li className="mb-2"><i className="bi bi-geo-alt-fill me-2"></i>University of Information Technology</li>
                        </ul>
                    </div>

                    {/* Follow Us Section */}
                    <div className="col-lg-2 mb-4">
                        <h5 className="text-uppercase fw-bold mb-3">FOLLOW US</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/" className="text-white text-decoration-none">
                                <i className="bi bi-facebook me-2"></i>Facebook
                            </Link></li>
                            <li className="mb-2"><Link to="/" className="text-white text-decoration-none">
                                <i className="bi bi-twitter me-2"></i>Twitter
                            </Link></li>
                            <li className="mb-2"><Link to="/" className="text-white text-decoration-none">
                                <i className="bi bi-instagram me-2"></i>Instagram
                            </Link></li>
                            <li className="mb-2"><Link to="/" className="text-white text-decoration-none">
                                <i className="bi bi-youtube me-2"></i>YouTube
                            </Link></li>
                        </ul>
                    </div>

                    {/* Footer Image */}
                    <div className="col-lg-2 mb-4 d-flex justify-content-center align-items-center">
                        <img src={img} alt="Goku" className="img-fluid" style={{ maxHeight: "150px" }} />
                    </div>
                </div>
                
                <div className="row border-top border-secondary pt-3 mt-3">
                    <div className="col-12 text-center">
                        <p className="small mb-0">© 2023 eManga. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
export default Footer;