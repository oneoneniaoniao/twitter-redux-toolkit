import React, { useState } from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, storage, db } from "../firebase";
import { Avatar, Button, IconButton, } from "@mui/material";
import firebase from "firebase/app";
import { AddAPhoto } from "@mui/icons-material";
import { doc, addDoc, serverTimestamp , collection} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";

const TweetInput: React.FC = ()=> {
  const user = useSelector(selectUser);
  console.log("userSlice", user)
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = "";
    }
  };

  const sendTweet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tweetImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + tweetImage.name;
      const storage = getStorage();
      const tweetImageRef = ref(storage, `images/${fileName}`);
      const uploadTask = uploadBytesResumable(tweetImageRef, tweetImage);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          switch (error.code) {
            case "storage/unauthorized":
              alert(error.message);
              break;
            case "storage/canceled":
              alert(error.message);
              break;
            case "storage/unknown":
              alert(error.message);
              break;
          }
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            addDoc(collection(db, "posts"), {
              avatar: user.photoUrl,
              image: downloadURL,
              text: tweetMsg,
              timestamp: serverTimestamp(),
              username: user.displayName,
            });
          });
        }
      );
    } else {
      console.log("message to be sent")
      addDoc(collection(db, "tweets"), {
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMsg("");
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTweetMsg(e.target.value)
            }
          />
          <IconButton>
            <label>
              <AddAPhoto  
                className={tweetImage? styles.tweet_addIconLoaded : styles.tweet_addIcon}
              />
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          className={
            tweetMsg 
              ? styles.tweet_sendBtn
              : styles.tweet_sendDisableBtn
          }
          disabled={!tweetMsg}
        >
          Tweet
          </Button>
      </form>
    </>
  );
};

export default TweetInput;
