import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import TweetInput from "./TweetInput";
import styles from "./Feed.module.css";
import {
  doc,
  onSnapshot,
  query,
  collection,
  orderBy,
} from "firebase/firestore";
import Post from "./Post";

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: "",
      avatar: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unSub = onSnapshot(q, (querySnapshot: any) => {
      setPosts(
        querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          image: doc.data().image,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      );
    });
    return () => {
      unSub();
    };
  }, []);

  return (
    <>
      <div className={styles.feed}>
        Feed
        <TweetInput />
        {posts[0]?.id &&(
        <>
          {posts.map((post: any) => (
            <Post
              key={post.id}
              postId={post.id}
              avatar={post.avatar}
              image={post.image}
              text={post.text}
              timestamp={post.timestamp}
              username={post.username}
            />
          ))}
        </>
        )}
        <button onClick={() => signOut(auth)}>Sign Out</button>
      </div>
    </>
  );
};

export default Feed;
