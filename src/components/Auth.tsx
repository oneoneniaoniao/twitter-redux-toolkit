import React, { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { updateUserProfile } from "../features/userSlice";
import {
  Avatar,
  Button,
  Modal,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  IconButton,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import EmailIcon from "@mui/icons-material/Email";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import styles from "./Auth.module.css";
import { auth, provider, storage } from "../firebase";
import {
  updateProfile,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AccountCircleOutlined, EmailOutlined } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import GoogleIcon from "@mui/icons-material/Google";
import { AccountCircle } from "@mui/icons-material";
import { async } from "@firebase/util";

const getModalStyle = () => {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

const theme = createTheme();

const Auth: React.FC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const sendResetEmail = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmail("");
      setOpenModal(false);
    } catch (e: any) {
      alert(e.message);
      setResetEmail("");
    }
  };

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      e.target.value = "";
    }
  };

  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async () => {
    const authUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    let url = "";
    if (avatarImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImage.name;
      const storage = getStorage();

      const storageRef = ref(storage, `avatars/${fileName}`);
      uploadBytes(storageRef, avatarImage);
      getDownloadURL(storageRef).then((url) => {
        updateProfile(authUser.user, {
          displayName: username,
          photoURL: url,
        });
        dispatch(updateUserProfile({ displayName: username, photoUrl: url }));
      });
    }
  };

  const signInGoogle = async () => {
    await signInWithPopup(auth, provider).catch((error) => {
      console.log(error.message);
    });
  };

  const test = () => {
    const url = "test";
    console.log(username, url)
    dispatch(updateUserProfile({ displayName: username, photoUrl: url }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        {/* <CssBaseline /> */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1520454974749-611b7248ffdb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Button onClick={test}>test</Button>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {isLogin ? "Sign in" : "Sign up"}
            </Typography>
            <form>
              {!isLogin && (
                <>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setUsername(e.target.value);
                    }}
                  />
                  <Box textAlign="center">
                    <IconButton>
                      <label>
                        <AccountCircleOutlined
                          fontSize="large"
                          className={
                            avatarImage
                              ? styles.login_addIconLoaded
                              : styles.login_addIcon
                          }
                        />
                        <input
                          className={styles.login_hiddenIcon}
                          type="file"
                          onChange={onChangeImageHandler}
                        />
                      </label>
                    </IconButton>
                  </Box>
                </>
              )}
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
                <Button
                  disabled={
                    isLogin
                      ? !email || password.length < 6
                      : !username ||
                        !email ||
                        password.length < 6 ||
                        !avatarImage
                  }
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  startIcon={<EmailIcon />}
                  onClick={
                    isLogin
                      ? async () => {
                          try {
                            await signInEmail();
                          } catch (e: any) {
                            alert(e.message);
                          }
                        }
                      : async () => {
                          try {
                            await signUpEmail();
                          } catch (e: any) {
                            alert(e.message);
                          }
                        }
                  }
                >
                  {isLogin ? "Sign in" : "Sign up"}
                </Button>
                <Grid container>
                  <Grid item xs>
                    <span
                      className={styles.login_reset}
                      onClick={() => setOpenModal(true)}
                    >
                      Forgot password?
                    </span>
                  </Grid>
                  <Grid item>
                    <span
                      className={styles.login_toggleMode}
                      onClick={() => {
                        setIsLogin(!isLogin);
                      }}
                    >
                      {isLogin ? "Create new account ?" : "Back to login"}
                    </span>
                  </Grid>
                </Grid>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={signInGoogle}
                  startIcon={<GoogleIcon />}
                >
                  Sign with Google
                </Button>
              </Box>
            </form>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
              <div style={getModalStyle()} className={styles.modal}>
                <div className={styles.login_modal}>
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="email"
                    name="email"
                    label="Reset E-mail"
                    value={resetEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setResetEmail(e.target.value);
                    }}
                  />
                  <IconButton onClick={sendResetEmail}>
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            </Modal>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Auth;
