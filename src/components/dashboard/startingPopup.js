"use client";

import { db } from "@/app/firebase";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const StartingPopup = ({ handleSetPopup, handleClose }) => {
  const { user, loading, users } = useAuth();
  const [popUser, setPopUser] = useState();
  console.log(user);

  useEffect(() => {
    const getUser = () => {
      if (!user || !users) return null;
      const authenticatedUser = users.find((u) => u.uid === user.uid);

      return authenticatedUser;
    };

    setPopUser(getUser());
  }, [user, users]);
  console.log(popUser);
  useEffect(() => {
    if (popUser) {
      handleSetPopup(popUser.showPopup);
    }
  }, [popUser]);
  const handleAccept = async () => {
    try {
      const userQ = query(
        collection(db, "authUsers"),
        where("uid", "==", user.uid)
      );

      // Execute the user query
      const userQuerySnapshot = await getDocs(userQ);

      // Update the user document
      if (!userQuerySnapshot.empty) {
        const userDocRef = userQuerySnapshot.docs[0].ref;
        await updateDoc(userDocRef, {
          showPopup: false,
        });
        handleClose();
      } else {
        console.error("User document not found");
      }
    } catch (error) {
      console.error("Error closing popup:", error);
      // Handle error (e.g., show an error message)
    }
  };
  if (!popUser?.showPopup) {
    return null;
  }
  return (
    <div className="absolute flex items-center justify-center z-10 w-full h-full bg-[rgb(0,0,0,0.2)]">
      <div className="max-w-[800px] w-[80%] text-2xl text-bold flex items-center justify-center flex-col z-20 p-8  bg-popupBackground text-popupText">
        <p className=" ">
          Welcome to AILearnLab! This is the perfect place for you to master new
          skills and languages, one step at a time. You can set your goals,
          follow our guided learning pathways, and unleash your full potential
          with the power of AI. Don&apos;t settle for average - elevate your
          skills and seize new opportunities with AILearnLab!
        </p>
        <button
          onClick={handleAccept}
          className="bg-buttonColor mt-20 text-lg rounded-lg hover:scale-105 hover:shadow-lg px-10 py-4"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StartingPopup;
