import { Outlet } from 'react-router-dom';
import Header from './Header';

//it is like MainTemplate from your Computer-Shop project
const Layout = () => {
    return (
        <>
            <Header />
            <main className="App">
                <Outlet />
            </main>
        </>
    );
};

export default Layout;
