import React, { useEffect, useState } from "react";
import "./header.css";

export default function NameAnimation() {
  const [name, setName] = useState("");
  const fullName = `
 Spatial Laser Take Home Assessment
 By Long Nguyen`;

  useEffect(() => {
    let index = 0;
    let intervalId;

    const animateName = () => {
      if (index < fullName.length - 1) {
        setName((prevName) => prevName + fullName[index]);
        index++;
      } else {
        clearInterval(intervalId);
      }
    };

    intervalId = setInterval(animateName, 40); // Adjust the interval duration for the desired speed

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const lines = name.split("\n").map((line, index) => {
    let fontSize = "30px"; 
    if (window.innerWidth <= 1024) {
      fontSize = "20px"; 
    }
    if (window.innerWidth <= 768) {
      fontSize = "15px"; 
    }
    if (window.innerWidth <= 390) {
      fontSize = "10px"; 
    }

    return (
      <div key={index} style={{ marginBottom: "50px", fontSize }}>
        {line}
      </div>
    );
  });

  return (
    <div className="name-animation-container">
      <div className="text" style={{ whiteSpace: "pre-wrap" }}>{lines}</div>
    </div>
  );
}
