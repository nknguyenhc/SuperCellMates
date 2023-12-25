import { useSelector } from "react-redux";
import { RootState } from '../../redux/store';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Popover from "react-bootstrap/Popover";

type PublicRoute = {
    href: string,
    text: string,
};

type LoggedInRoute = {
    href?: string,
    image: string,
    text: string,
    id: string,
    children?: JSX.Element,
}

type AdminRoute = {
    href: string,
    image: string,
    text: string,
    id: string,
};

type SuperuserRoute = {
    href: string,
    image: string,
    text: string,
    id: string,
}


export default function NavBar(): JSX.Element {
    const authState = useSelector((state: RootState) => state.auth);
    const publicRoutes = useMemo<Array<PublicRoute>>(() => [
        {
            href: '/login',
            text: 'Login',
        },
        {
            href: '/register',
            text: 'Register',
        },
    ], []);
    const loggedInRoutes = useMemo<Array<LoggedInRoute>>(() => [
        {
            href: '/',
            image: 'home.png',
            text: 'Home',
            id: 'nav-home'
        },
        {
            image: 'request-tag.png',
            text: 'Request tag',
            id: 'nav-request-tag',
        },
        {
            href: '/profile',
            image: 'profile.png',
            text: 'Profile',
            id: 'nav-profile',
        },
        {
            href: '/messages',
            image: 'message.png',
            text: 'Message',
            id: 'nav-message',
            children: <span className="position-absolute top-100 start-100 translate-middle badge rounded-pill bg-danger" id="message-count-badge" />,
        },
        {
            image: 'notification-icon.png',
            text: 'Notification',
            id: 'nav-notification',
            children: <>
                <span className="position-absolute top-100 start-100 translate-middle badge rounded-pill bg-danger" id="notification-count-badge" />
                <div className="position-absolute" id="notification-centre" style={{ display: "none" }} />
            </>,
        },
        {
            href: '/settings',
            image: 'settings.png',
            text: 'Settings',
            id: 'nav-settings',
        },
    ], []);
    const adminRoutes = useMemo<Array<AdminRoute>>(() => [
        {
            href: '/manage_page',
            image: 'admin.png',
            text: 'Admin',
            id: 'nav-admin',
        }
    ], []);
    const superuserRoutes = useMemo<Array<SuperuserRoute>>(() => [
        {
            href: '/manage_admin',
            image: 'manage-admin.png',
            text: 'Manage admin',
            id: 'nav-manage-admin',
        }
    ], []);

    return (
      <div id="navbar-container" className="sticky-top">
        <nav className="navbar navbar-expand bg-body-tertiary">
          <div className="container-fluid navbar-container">
            <div
              className="navbar-collapse justify-content-between"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav">
                {!authState.isLoggedIn
                  ? publicRoutes.map((route, routeIndex) => (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`bottom`}>
                            <strong>{route.text}</strong>
                          </Tooltip>
                        }
                      >
                        <Link to={route.href} key={routeIndex}>
                          <li className="nav-item layout-nav-item">
                            <div className="nav-link">{route.text}</div>
                          </li>
                        </Link>
                      </OverlayTrigger>
                    ))
                  : loggedInRoutes.map((route, routeIndex) => (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`bottom`}>
                            <strong>{route.text}</strong>
                          </Tooltip>
                        }
                      >
                        <li
                          className="nav-item layout-nav-item"
                          id={route.id}
                          data-bs-toggle="tooltip"
                          data-bs-placement="bottom"
                          data-bs-title={route.text}
                          key={routeIndex}
                        >
                          {route.href ? (
                            <Link to={route.href}>
                              <div className="nav-link">
                                <img
                                  src={
                                    process.env.PUBLIC_URL +
                                    "/media/nav-bar/" +
                                    route.image
                                  }
                                  alt={route.text}
                                />
                              </div>
                            </Link>
                          ) : (
                            <div className="nav-link">
                              <img
                                src={
                                  process.env.PUBLIC_URL +
                                  "/media/nav-bar/" +
                                  route.image
                                }
                                alt={route.text}
                              />
                            </div>
                          )}
                          {route.children && route.children}
                        </li>
                      </OverlayTrigger>
                    ))}
                {authState.isStaff &&
                  adminRoutes.map((route, routeIndex) => (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`bottom`}>
                          <strong>{route.text}</strong>
                        </Tooltip>
                      }
                    >
                      <li
                        className="nav-item layout-nav-item"
                        id={route.id}
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        data-bs-title={route.text}
                        key={routeIndex}
                      >
                        <Link to={route.href} className="nav-link">
                          <img
                            src={
                              process.env.PUBLIC_URL +
                              "/media/nav-bar/" +
                              route.image
                            }
                            alt={route.text}
                          />
                        </Link>
                      </li>
                    </OverlayTrigger>
                  ))}
                {authState.isSuperuser &&
                  superuserRoutes.map((route, routeIndex) => (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id={`bottom`}>
                          <strong>{route.text}</strong>
                        </Tooltip>
                      }
                    >
                      <li
                        className="nav-item layout-nav-item"
                        id={route.id}
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        data-bs-title={route.text}
                        key={routeIndex}
                      >
                        <Link to={route.href} className="nav-link">
                          <img
                            src={
                              process.env.PUBLIC_URL +
                              "/media/nav-bar/" +
                              route.image
                            }
                            alt={route.text}
                          />
                        </Link>
                      </li>
                    </OverlayTrigger>
                  ))}
              </ul>
              {authState.isLoggedIn && (
                <div className="position-relative">
                  <form
                    autoComplete="off"
                    id="search-form"
                    className="d-flex"
                    role="search"
                  >
                    <input
                      id="search-input"
                      className="form-control me-2"
                      type="search"
                      name="username"
                      placeholder="Find user"
                      aria-label="Search"
                    />
                    <button className="btn btn-outline-primary" type="submit">
                      Search
                    </button>
                  </form>
                  <div id="search-result-box" style={{ display: "none" }} />
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    );
}