import Home from '../pages/Home';
import Contact from '../pages/Contact';
import Admin from '../pages/Admin';
import About from '../pages/About';
import Detail from '../pages/Detail';
import Chapter from '../pages/Chapter';


const publicRoutes = [
    { path: '/', component: Home },
    { path: '/contact', component: Contact },
    { path: '/about', component: About },
    { path: '/manga/:id', component: Detail },
    { path: '/manga/:mangaId/chapter/:chapterId', component: Chapter }
];

const privateRoutes = [
    { path: '/admin', component: Admin },
];

export { publicRoutes, privateRoutes };