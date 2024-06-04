"use client";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/components/context/AuthContext";
import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import UsersPopup from "./usersPopup";
import Image from "next/image";
import DoughnutChart from "./mainPage/DoughnutChart";
import LineChart from "./mainPage/LineChart";
import RecentGoals from "./mainPage/recentGoals";
import { IoPersonAdd, IoPersonRemove } from "react-icons/io5";
import { VscRemove } from "react-icons/vsc";

const MainPage = () => {
  const { user, loading, users, updateData } = useAuth();

  const [showPopup, setShowPopup] = useState(false);

  const [friends, setFriends] = useState([]);

  const [notFriends, setNotFriends] = useState([]);
  const [removingFriendId, setRemovingFriendId] = useState();
  const [popUser, setPopUser] = useState();

  useEffect(() => {
    const getFriendsOfUser = () => {
      if (!user || !users) return [];
      const authenticatedUser = users.find((u) => u.uid === user.uid);

      if (!authenticatedUser || !authenticatedUser.friends) return [];

      return authenticatedUser.friends;
    };
    const getNotFriendsOfUser = () => {
      if (!user || !users) return [];
      const authenticatedUser = users.find((u) => u.uid === user.uid);
      if (!authenticatedUser || !authenticatedUser.friends) return [];

      const friendIds = authenticatedUser.friends
        ?.filter((friend) => friend?.uid)
        .map((friend) => friend.uid);

      const notFriendsList = users.filter(
        (u) => u.uid !== user.uid && !friendIds.includes(u.uid)
      );

      return notFriendsList;
    };
    const getUser = () => {
      if (!user || !users) return null;
      const authenticatedUser = users.find((u) => u.uid === user.uid);

      return authenticatedUser;
    };

    setPopUser(getUser());
    setNotFriends(getNotFriendsOfUser());
    setFriends(getFriendsOfUser());
  }, [user, users]);
  console.log(popUser);
  if (loading) {
    return <p>Loading...</p>;
  }

  const handleUnfriend = async (friendId) => {
    try {
      setRemovingFriendId(friendId);
      const friendDocRef = doc(db, "authUsers", friendId);
      const userDocRef = doc(db, "authUsers", user.uid);
      await updateDoc(userDocRef, {
        friends: arrayRemove(friendDocRef),
      });
      await updateDoc(friendDocRef, {
        friends: arrayRemove(userDocRef),
      });
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.uid !== friendId)
      );

      console.log("Friend removed successfully");
      updateData();

      setRemovingFriendId(null);
    } catch (error) {
      setRemovingFriendId(null);

      console.error("Error removing friend:", error.message);
    }
  };

  const handleAddFriend = async (receiverID) => {
    try {
      const friendDocRef = doc(db, "authUsers", receiverID);

      const userDocRef = doc(db, "authUsers", user.uid);

      await addDoc(collection(db, "friendRequests"), {
        senderID: userDocRef,
        receiverID: friendDocRef,
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
  };

  const getGoalsThisMonth = (goals) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let lessonCount = 0;

    Object.values(goals).forEach((lessonsArray) => {
      const insights = lessonsArray.insights;
      console.log(insights);
      const createdDate = new Date(insights.createdDate);
      if (
        createdDate.getMonth() + 1 === currentMonth &&
        createdDate.getFullYear() === currentYear
      ) {
        lessonCount++;
      }
    });

    return lessonCount;
  };
  const getCompletedGoalsThisMonth = (goals) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let lessonCount = 0;

    Object.values(goals).forEach((lessonsArray) => {
      const insights = lessonsArray.insights;
      console.log(insights);
      const completedDate = new Date(insights.completedDate);
      if (
        completedDate.getMonth() + 1 === currentMonth &&
        completedDate.getFullYear() === currentYear
      ) {
        lessonCount++;
      }
    });

    return lessonCount;
  };
  const getCompletedGoalsThisYear = (goals) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyCounts = new Array(currentMonth).fill(0); // Initialize an array with length based on current month

    Object.values(goals).forEach((lessonsArray) => {
      const insights = lessonsArray.insights;
      const completedDate = new Date(insights.completedDate);

      if (completedDate.getFullYear() === currentYear) {
        const monthIndex = completedDate.getMonth();
        if (monthIndex < currentMonth) {
          // Ensure the month index is within the range
          monthlyCounts[monthIndex]++;
        }
      }
    });

    return monthlyCounts;
  };

  const getCreatedGoalsThisYear = (goals) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyCounts = new Array(currentMonth).fill(0); 

    Object.values(goals).forEach((lessonsArray) => {
      const insights = lessonsArray.insights;
      const createdDate = new Date(insights.createdDate);

      if (createdDate.getFullYear() === currentYear) {
        const monthIndex = createdDate.getMonth();
        if (monthIndex < currentMonth) {
          // Ensure the month index is within the range
          monthlyCounts[monthIndex]++;
        }
      }
    });

    return monthlyCounts;
  };


  const goalsStartedThisMonth = popUser ? getGoalsThisMonth(popUser.goals) : 0;
  const goalsCompletedThisMonth = popUser
    ? getCompletedGoalsThisMonth(popUser.goals)
    : 0;
  const goalsCompletedThisYearDataSet = popUser
    ? getCompletedGoalsThisYear(popUser.goals)
    : [0];
  const goalsCreatedThisYearDataSet = popUser
    ? getCreatedGoalsThisYear(popUser.goals)
    : [0];
  console.log(goalsCompletedThisYearDataSet);
  return (
    <div className="flex h-full w-full gap-4 px-10">
      <div className="w-2/3 flex flex-col h-fit gap-4">
        <div className="w-full flex gap-4 h-fit">
          <div className="w-1/2 bg-[#1976D2] rounded-lg p-4 text-white space-y-4 shadow-xl ">
            <div className="flex gap-4 items-center ">
              <div>
                <Image src={"/flag.png"} alt="flag" width={50} height={50} />
              </div>
              <h2 className="text-4xl">{goalsStartedThisMonth}</h2>
            </div>
            <p className="text-sm">Total goals started this Month</p>
          </div>
          <div className="w-1/2 bg-[#2EB46B] rounded-lg p-4 text-white space-y-4 shadow-xl">
            <div className="flex gap-4 items-center ">
              <div>
                <Image
                  src={"/checkmark.png"}
                  alt="checkmark"
                  width={50}
                  height={50}
                />
              </div>
              <h2 className="text-4xl">{goalsCompletedThisMonth}</h2>
            </div>
            <p className="text-sm">Total lessons completed this Month</p>
          </div>
        </div>
        <div className="w-full"></div>
        <div className="w-full ">
          <LineChart
            goalsCompletedThisYearDataSet={goalsCompletedThisYearDataSet}
            goalsCreatedThisYearDataSet={goalsCreatedThisYearDataSet}
            style={{ paddingBottom: "20px" }}
          />
        </div>
      </div>
      <div className="w-1/3 h-full flex flex-col gap-4">
        <div className="bg-backgroundSecondary w-full h-fit   rounded-xl p-4">
          <div className="flex justify-between">
            <h3>Friends</h3>
            <button
              onClick={handleTogglePopup}
              className="bg-buttonColor rounded-lg hover:scale-105 hover:shadow-lg p-2  text-white"
            >
              <IoPersonAdd />
            </button>
            {showPopup && (
              <UsersPopup
                handleTogglePopup={handleTogglePopup}
                notFriends={notFriends}
                handleAddFriend={handleAddFriend}
              />
            )}
          </div>
          <div className="h-fit min-h-[20vh] max-h-[30vh] overflow-auto">
            {friends?.map((friend, index) => (
              <div
                key={index}
                className="flex items-center my-1 justify-between border border-green-600 w-full p-2 bg-green-600/10"
              >
                <div className="w-fit flex gap-4 items-center justify-center">
                  <p>{friend?.displayName}</p>
                  <button
                    disabled={removingFriendId === friend?.uid}
                    className="bg-red-600 rounded-lg hover:scale-105 hover:shadow-lg p-2  text-white"
                    onClick={() => handleUnfriend(friend?.uid)}
                  >
                    <IoPersonRemove />
                  </button>
                </div>
                <p className="text-green-600">
                  {friend && friend.goals
                    ? Object.keys(friend?.goals).length
                    : 0}{" "}
                  goals
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-backgroundSecondary w-full h-full   rounded-xl p-4">
          <DoughnutChart />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
