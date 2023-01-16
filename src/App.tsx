import React, { useEffect } from "react";
import styles from "./App.module.css";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import Auth from "./components/Auth";
import Feed from "./components/Feed";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";

const App: React.FC = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unSub = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        //ログインしている
        dispatch(
          login({
            uid: userAuth.uid,
            photoUrl: userAuth.photoURL,
            displayName: userAuth.displayName,
          })
        );
      } else {
        //ログインしていない
        dispatch(logout());
      }
    });
    return () => {
      unSub();
    };
  }, [dispatch]);
  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default App;
