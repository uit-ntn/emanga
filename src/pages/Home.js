import React from 'react';
import Layout from '../components/Layout';
import MangaList from '../components/MangaList';

const Home = () => {

    return (
        <div className='Home'>
            <Layout>
                {/* Hero banner section */}
                <div className="bg-dark text-white mb-4 position-relative overflow-hidden">
                    <div
                        className="hero-image position-absolute w-100 h-100"
                        style={{
                            backgroundImage: "url('https://cdn.mangaeden.com/mangasimg/200x/88/88a79d54ee67b273110f93dce8aadc8bf48dda5cca45cbb098a49d1f.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(8px)",
                            opacity: 0.3
                        }}
                    ></div>
                    <div className="container py-5 position-relative">
                        <div className="row align-items-center">
                            <div className="col-md-6 mb-4 mb-md-0">
                                <h1 className="display-4 fw-bold mb-3">Discover Amazing Manga</h1>
                                <p className="lead mb-4">Explore our collection of the best manga series from around the world. Read online and enjoy the art of storytelling.</p>
                                <div className="d-flex gap-3">
                                    <button className="btn btn-primary btn-lg rounded-pill px-4">
                                        <i className="bi bi-book me-2"></i>Start Reading
                                    </button>
                                    <button className="btn btn-outline-light btn-lg rounded-pill px-4">
                                        <i className="bi bi-collection me-2"></i>Browse All
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <img
                                    src="https://scontent.fsgn19-1.fna.fbcdn.net/v/t1.6435-1/116264906_340041997020888_6356968955999431305_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=101&ccb=1-7&_nc_sid=e99d92&_nc_ohc=mbe59pHzJCMQ7kNvwFXCDaW&_nc_oc=Adk-m7dX9PdvTkbDGu7MDMnT67kKB53oGnb_kF2d218Hl4Xk1wgadPNkZuGHKJP1yJE&_nc_zt=24&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=G1FSZBRPQWyttiT2vZY5RA&oh=00_AfNtO3tGEQGTExNdDSKP-LCwZVbSAJj5S0lSP8IDhE4EHQ&oe=687E5745"
                                    alt="Featured Manga"
                                    className="img-fluid rounded-3 shadow"
                                    style={{ maxHeight: "350px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <MangaList></MangaList>
            </Layout>
        </div>
    )
}
export default Home;
