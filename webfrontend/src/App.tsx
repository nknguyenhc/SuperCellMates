import NavBar from "./components/navbar/navbar";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { triggerErrorMessage } from "./utils/locals";
import { login, logout, setStaff, setSuperuser } from "./redux/auth-slice";
import { Outlet } from "react-router-dom";
import BottomMessage from "./components/popup/bottom-message";
import FilterMessage from "./components/popup/filter-message";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // determine current user
    fetch("/async").then((res) => {
      if (res.status !== 200) {
        triggerErrorMessage();
        return;
      }
      res.json().then((res) => {
        if (res.is_logged_in) {
          dispatch(
            login({
              username: res.username,
            })
          );
        } else {
          dispatch(logout());
        }
        if (res.is_admin) {
          dispatch(setStaff());
        }
        if (res.is_superuser) {
          dispatch(setSuperuser());
        }
      });
    });

    // clear session storage
    sessionStorage.clear();
  }, [dispatch]);

  return (
    <div className="App">
      <NavBar />
      <Outlet />
      <BottomMessage />
      <FilterMessage />
    </div>
  );
}
