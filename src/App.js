import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import './App.scss';
import Auction from './components/Auction/Auction';
import AuctionInfor from './components/Auction/AuctionInfor';
import AuctionsList from './components/Auction/AuctionsList.jsx';
import ForgotPassword from './components/Auth/ForgotPassword/ForgotPassword';
import Login from './components/Auth/Login/Login';
import Register from './components/Auth/Register/Register';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import HotNews from './components/News/categorizeNews/HotNews';
import LatestNews from './components/News/categorizeNews/LatestNews';
import News from './components/News/News';
import PostPage from './components/News/PostPage';
import NotFound from './components/NotFound';
import Notification from './components/Notification/Notification';
import Search from './components/Search/Search';
import VipUpgrade from './components/VipUpgrade/VipUpgrade.jsx';
import './index.css';
import AdminPage from './pages/Admin/Dashboard';
import LayoutAdmin from './pages/Admin/LayoutAdmin';
import TableBox from './pages/Admin/ListBox';
import TableGroup from './pages/Admin/ListGroup';
import TablePost from './pages/Admin/ListPost';
import TableUser from './pages/Admin/ListUser';
import Checkout from './pages/Payment/Checkout.jsx';
import OrderCanceled from './pages/Payment/OrderCanceled.jsx';
import OrderSuccess from './pages/Payment/OrderSuccess.jsx';
import Profile from './pages/ProfileUser/Profile';
import './styles/boundingboxDataList.scss';
import './styles/checkout.scss';
import './styles/listRegulation.scss';
import './styles/map.scss';
import './styles/coin.scss';
import BoxNews from './components/News/BoxNews/index.jsx';
import GroupNews from './components/News/GroupNews/index.jsx';

const Layout = () => {
    return (
        <div className="App" style={{ position: 'relative', height: '100vh', width: '100%' }}>
            <div className="app-header">
                <Header />
            </div>

            <div className="app-content">
                <Outlet />
            </div>

            {/* <Ads /> */}
        </div>
    );
};

const AppRoutes = ({ onLocationChange }) => {
    const location = useLocation();

    useEffect(() => {
        if (onLocationChange) {
            onLocationChange(location.pathname);
        }
    }, [location, onLocationChange]);

    return null;
};

function App() {
    const datauser = useSelector((state) => state.account.dataUser);
    const item = [
        {
            path: '/',
            element: <Layout />,
            // errorElement: <NotFound />,
            // eslint-disable-next-line no-sparse-arrays
            children: [
                {
                    index: true,
                    element: <Home />,
                },
                {
                    path: '/:name',
                    element: <Home />,
                },
                {
                    path: '/notifications',
                    element: <Notification />,
                },
                {
                    path: '/news',
                    element: <News />,
                    children: [
                        {
                            index: true,
                            element: <BoxNews />,
                        },
                        {
                            path: 'group/:id',
                            element: <GroupNews />,
                        },
                    ],
                },
                {
                    path: 'news/:slug',
                    element: <PostPage />,
                },
                {
                    path: 'news/latest',
                    element: <LatestNews />,
                },
                {
                    path: 'news/hot',
                    element: <HotNews />,
                },
                {
                    path: '/auctions',
                    element: <Auction />,
                },
                {
                    path: 'auctions/information/:LandAuctionID',
                    element: <AuctionInfor />,
                },
                {
                    path: '/search',
                    element: <Search />,
                },
                {
                    path: '/userprofile',
                    element: <Profile />,
                },
                ,
                {
                    path: '/vipupgrade',
                    element: <VipUpgrade />,
                },
                {
                    path: '/instruction',
                    element: <Home />,
                },
                {
                    path: '/test',
                    element: <AuctionsList />,
                },
                {
                    path: '/checkout',
                    element: <Checkout />,
                },
                {
                    path: '/order-success',
                    element: <OrderSuccess />,
                },
                {
                    path: '/order-canceled',
                    element: <OrderCanceled />,
                },
            ],
        },
        {
            path: '/login',
            element: <Login />,
        },
        {
            path: '/register',
            element: <Register />,
        },

        {
            path: '/forgotPassword',
            element: <ForgotPassword />,
        },
    ];

    if (datauser?.role === true) {
        item.unshift({
            path: '/admin',
            element: <LayoutAdmin />,
            errorElement: <NotFound />,
            children: [
                {
                    index: true,
                    element: <AdminPage />,
                },
                {
                    path: '/admin/listbox',
                    element: <TableBox />,
                },
                {
                    path: '/admin/listgroup',
                    element: <TableGroup />,
                },
                {
                    path: '/admin/listpost',
                    element: <TablePost />,
                },
                {
                    path: '/admin/listuser',
                    element: <TableUser />,
                },
            ],
        });
    }

    const router = createBrowserRouter(item);

    const handleLocationChange = (path) => {
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_path: path,
                page_title: document.title,
            });
        }
    };
    return (
        <>
            <RouterProvider router={router}>
                <AppRoutes onLocationChange={handleLocationChange} />
            </RouterProvider>
        </>
    );
}

export default App;
