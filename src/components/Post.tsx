import React, { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { db } from "../firebase";
import { useAppSelector } from "../app/hooks";
import { selectUser } from "../features/userSlice";
import { Avatar, Button, IconButton } from "@mui/material";
import { Message, Send } from "@mui/icons-material";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

type PROPS = {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
};

type COMMENT = {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
};

const Post: React.FC<PROPS> = (props) => {
  const user = useAppSelector(selectUser);
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  useEffect(() => {
    const q = query(
      collection(db, "posts", props.postId, "comments"),
      orderBy("timestamp", "desc")
    );
    const unSub = onSnapshot(q, (querySnapshot: any) => {
      setComments(
        querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      );
    });
    return () => {
      unSub();
    };
  }, [props.postId]);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addDoc(collection(db, "posts", props.postId, "comments"), {
      avatar: user.photoUrl,
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };

  return (
    <div key={props.postId} className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar
          src={
            props.avatar
              ? props.avatar
              : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
          }
          alt=""
        />
      </div>
      <div className={styles.post_body}>
        <>
          <div className={styles.post_header}>
            <div className={styles.post_headerText}>
              <h3>
                <span className={styles.post_headerUser}>
                  @{props.username}
                </span>
                <span className={styles.post_headerTime}>
                  {new Date(props.timestamp?.toDate()).toLocaleString()}
                </span>
              </h3>
            </div>
            <div className={styles.post_tweet}>
              <p>{props.text}</p>
            </div>
          </div>
          {props.image && (
            <div className={styles.post_tweetImage}>
              <img src={props.image} alt="" />
            </div>
          )}
          <Message
            className={styles.post_commentIcon}
            onClick={() => setOpenComments(!openComments)}
          />
          {openComments && (
            <>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.post_comment}>
                  <Avatar
                    sx={{ width: 24, height: 24 }}
                    src={
                      comment.avatar
                        ? comment.avatar
                        : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                    }
                    alt=""
                  />
                  <p>
                    <span className={styles.post_commentUser}>
                      @{comment.username}
                    </span>
                    {comment.text} -{" "}
                  </p>
                  <span className={styles.post_commentTime}>
                    {new Date(comment.timestamp?.toDate()).toLocaleString()}
                  </span>
                </div>
              ))}
              <form onSubmit={newComment}>
                <div className={styles.post_form}>
                  <input
                    type="text"
                    placeholder="Type new comment"
                    value={comment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setComment(e.target.value)
                    }
                  />
                  <button
                    disabled={!comment}
                    type="submit"
                    className={
                      comment ? styles.post_button : styles.post_buttonDisable
                    }
                  >
                    <Send />
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default Post;
