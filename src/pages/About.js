import React from 'react';
import Layout from '../components/Layout';

const About = () => {
    return (
        <Layout>
            <div className="About py-5">
                <div className="container">
                    {/* Hero Section */}
                    <div className="row mb-5">
                        <div className="col-12 text-center">
                            <h1 className="display-4 fw-bold text-primary mb-4">About eManga</h1>
                            <div className="divider-custom mx-auto mb-4">
                                <div className="divider-custom-line bg-secondary" style={{ height: "4px", width: "80px", margin: "0 auto" }}></div>
                            </div>
                            <p className="lead text-muted mb-0 mx-auto" style={{ maxWidth: "700px" }}>
                                Your digital gateway to the world of manga - where stories come to life
                            </p>
                        </div>
                    </div>

                    {/* Our Mission */}
                    <div className="row mb-5 align-items-center">
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                                <div className="card-body p-5">
                                    <h2 className="fw-bold mb-4">Our Mission</h2>
                                    <p className="lead">
                                        At eManga, we're passionate about making the wonderful world of manga accessible to everyone.
                                    </p>
                                    <p>
                                        Our platform aims to provide a seamless, user-friendly experience for manga enthusiasts worldwide.
                                        We believe that stories transcend boundaries and that manga offers unique narratives and artistic expressions
                                        that should be shared with a global audience.
                                    </p>
                                    <p className="mb-0">
                                        Whether you're a longtime fan or new to manga, our goal is to connect you with content you'll love
                                        while supporting the creators and publishers who bring these amazing works to life.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="bg-light p-5 rounded-3 h-100">
                                <div className="row text-center">
                                    <div className="col-6 mb-4">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                                                <i className="bi bi-book text-white fs-1"></i>
                                            </div>
                                            <h3 className="h5 fw-bold">10,000+</h3>
                                            <p className="text-muted">Manga Titles</p>
                                        </div>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                                                <i className="bi bi-people text-white fs-1"></i>
                                            </div>
                                            <h3 className="h5 fw-bold">1M+</h3>
                                            <p className="text-muted">Happy Users</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="bg-info rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                                                <i className="bi bi-translate text-white fs-1"></i>
                                            </div>
                                            <h3 className="h5 fw-bold">25+</h3>
                                            <p className="text-muted">Languages</p>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex flex-column align-items-center">
                                            <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                                                <i className="bi bi-globe text-white fs-1"></i>
                                            </div>
                                            <h3 className="h5 fw-bold">190+</h3>
                                            <p className="text-muted">Countries</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Our Story */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <div className="bg-dark text-white p-5 rounded-3 position-relative overflow-hidden">
                                <div
                                    className="position-absolute top-0 start-0 w-100 h-100"
                                    style={{
                                        backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/background/20230618/pngtree-abstract-neon-tunnel-corridors-in-futuristic-sci-fi-3d-rendering-image_3635158.jpg')",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        opacity: "0.2"
                                    }}
                                ></div>
                                <div className="position-relative">
                                    <h2 className="fw-bold mb-4">Our Story</h2>
                                    <p>
                                        eManga started as a project between two university students passionate about manga and technology.
                                        What began as a simple web application for our own use quickly evolved into something bigger as
                                        friends and classmates asked for access.
                                    </p>
                                    <p>
                                        In 2023, we officially launched eManga with a mission to create the most user-friendly manga
                                        reading platform available. We focused on clean design, intuitive navigation, and a
                                        powerful recommendation engine to help users discover new series they would love.
                                    </p>
                                    <p>
                                        Today, eManga continues to grow and improve based on our community's feedback.
                                        We're constantly adding new features, expanding our library, and working with publishers
                                        to bring you the best manga reading experience possible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Our Team */}
                    <div className="row mb-5">
                        <div className="col-12 text-center mb-4">
                            <h2 className="fw-bold">Meet Our Team</h2>
                            <p className="text-muted">The passionate people behind eManga</p>
                        </div>

                        <div className="col-md-6 mb-4 mb-md-0">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                    <img
                                        src='https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-6/473128914_1335085934183151_3770948212612554431_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=boEmOPvXArgQ7kNvwE9Bnqg&_nc_oc=AdlEtdZREE_qC2DXUzY_kCblt0CREzCBeYtv9vmKgAdaTAPwSOM5b6tLUjpqZ1krmcQ&_nc_zt=23&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=jnQBTksmp1JL0_x03zkg8w&oh=00_AfNG5RgOQw5RpmcpH-ZcvcJ79LNG_3C5OUUYY7Ko_Fqaog&oe=685E9D0C'
                                        alt="Nhan"
                                        className="rounded-circle mb-3"
                                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                    />
                                    <h3 className="h5 fw-bold mb-1">Nhan Nguyen</h3>
                                    <p className="text-primary mb-3">Co-Founder & Developer</p>
                                    <p className="mb-3">
                                        Passionate about both manga and web development, Nhan combines technical expertise with a deep
                                        understanding of what manga readers are looking for in a digital platform.
                                    </p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <a href="https://uit-ntn.github.io/portfolio/" className="btn btn-outline-primary btn-sm rounded-circle" target="_blank" rel="noopener noreferrer">
                                            <i className="bi bi-globe"></i>
                                        </a>
                                        <a href="https://www.linkedin.com/in/nguyen-nhan-732a66247/" className="btn btn-outline-primary btn-sm rounded-circle">
                                            <i className="bi bi-linkedin"></i>
                                        </a>
                                        <a href="https://github.com/uit-ntn" className="btn btn-outline-primary btn-sm rounded-circle">
                                            <i className="bi bi-github"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                    <img
                                        src="https://scontent.fsgn2-6.fna.fbcdn.net/v/t39.30808-6/505427881_2906699982870167_8078582579785188929_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=6SynFTdb3q8Q7kNvwEffuUd&_nc_oc=AdmGHQBD1sJUrYSukWv0KiEr5Yd6RXfEwiWsFcbi0VRgDp1h1OJVsrON1jRgsesCVEY&_nc_zt=23&_nc_ht=scontent.fsgn2-6.fna&_nc_gid=6Gqh7sslF86K6wpZbDm4Dw&oh=00_AfMuVgzjzRmFZYSmTU5ooGvHOBlz8jyWTspVvppW8p0Hpw&oe=685EA4A2"
                                        alt="Thi"
                                        className="rounded-circle mb-3"
                                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                    />
                                    <h3 className="h5 fw-bold mb-1">Thi</h3>
                                    <p className="text-primary mb-3">Co-Founder & Designer</p>
                                    <p className="mb-3">
                                        With a background in UX/UI design and a lifelong love of manga, Thi ensures that eManga
                                        delivers an intuitive, beautiful experience that puts the focus on the content.
                                    </p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <a href="https://www.facebook.com/aithi.992969" className="btn btn-outline-primary btn-sm rounded-circle">
                                            <i className="bi bi-globe"></i>
                                        </a>
                                        <a href="https://www.instagram.com/thibattery/" className="btn btn-outline-primary btn-sm rounded-circle">
                                            <i className="bi bi-instagram"></i>
                                        </a>
                                        <a href="https://github.com/DT2K3" className="btn btn-outline-primary btn-sm rounded-circle">
                                            <i className="bi bi-github"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default About;