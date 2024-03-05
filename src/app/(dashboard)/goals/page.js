"use client";
import React, { useEffect, useState } from "react";
import { db, auth } from "@/app/firebase";
import { doc, getDoc, setDoc} from "firebase/firestore";
import Practice from "../practice/page";

const Goals = () => {
  const [userData, setUserData] = useState("");
  const userId = auth.currentUser.uid
  const docRef = doc(db,"authUsers",userId);

  const fetchUserData = async () => {
    try {
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  console.log(userData.goals) 
  const deleteGoal = async (goalName) => {
    let currData = userData.goals

    delete currData[goalName]
    setUserData(((prevUserData) => ({
      ...prevUserData,
      goals: { ...currData },
    })))
    setDoc(docRef,{goals:{...currData}},{merge:true})
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="flex flex-col w-11/12 mx-auto">
      <div className="flex justify-between flex-grow mb-2">
        <div className="w-3/5">
          <Practice userId={userId} user={userData}/>
        </div>
        <div className="flex flex-col p-4 w-2/5 ml-2 bg-slate-400 rounded-md">
          <div className='text-3xl mx-auto font-extrabold'>
            Recent Goals
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full mx-auto  bg-slate-400 rounded-md">
        <div className='text-3xl mx-auto font-extrabold'>
          All Goals
        </div>
        {userData && Object.keys(userData.goals).length > 0 && Object.entries(userData.goals).map(([key, value], index) => (
            <div key={key} className="flex p-2 mx-2 bg-white mb-2 rounded-md flex-grow justify-between">
              <div className="">{key}</div>
              <button className="p-1 bg-primary rounded-md text-white text-lg font-medium" onClick={() => deleteGoal(key)}>Remove</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Goals;
