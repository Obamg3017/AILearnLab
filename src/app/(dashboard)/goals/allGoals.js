import React, { useState, useEffect } from "react";
import SingleGoal from "./singleGoal";

const AllGoals = ({ userData, deleteGoal, setUserData }) => {
  const [parsedUserData, setParsedUserData] = useState(userData);

  useEffect(() => {
    setParsedUserData(userData);
  }, [userData]);

  return (
    <div className="flex flex-col w-full mx-auto  bg-backgroundSecondary rounded-md">
      <div className="text-2xl mx-auto my-4 font-extrabold">All Goals</div>
      {parsedUserData &&
        Object.keys(parsedUserData.goals).length > 0 &&
        Object.entries(parsedUserData.goals).map(([key, value], index) => (
          <div
            key={key}
            className="flex  flex-col p-2 mx-2 bg-gray-200 mb-2 rounded-md flex-grow"
          >
            <div className="flex px-2 pt-2 mx-2 rounded-md flex-grow justify-between items-center">
              <div className="p-2 text-2xl font-bold">{key}</div>
              <button
                className="p-1 mt-2 bg-primary rounded-md text-white text-lg font-medium"
                onClick={() => deleteGoal(key)}
              >
                Remove
              </button>

            </div>
            <SingleGoal
              title={key}
              lessons={value}
              uid={parsedUserData.uid}
              userData={parsedUserData}
              setUserData={setUserData}
            />
          </div>
        ))}
    </div>
  );
};

export default AllGoals;
