import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { useAuth } from "@clerk/clerk-react";
import "./homepage.css";

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");
  const { getToken } = useAuth(); // currently unused, consider removing if not needed

  return (
    <div className="homepage">
      {/* Background Image */}
      <img src="/orbital.png" alt="orbital" className="orbital" />

      {/* Left Section */}
      <div className="left">
        <h1>LAMA AI</h1>
        <h2>Supercharge your creativity and productivity</h2>
        <h3>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Placeat sint
          dolorem doloribus, architecto dolor.
        </h3>

        <Link to="/dashboard" className="getStarted">
          Get Started
        </Link>
      </div>

      {/* Right Section with Bot Animation */}
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="AI Bot" className="bot" />

          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "/bot.png"
              }
              alt="chat user"
            />

            <TypeAnimation
              sequence={[
                "Human: We produce food for Mice",
                2000,
                () => setTypingStatus("bot"),
                "Bot: We produce food for Hamsters",
                2000,
                () => setTypingStatus("human2"),
                "Human2: We produce food for Guinea Pigs",
                2000,
                () => setTypingStatus("bot"),
                "Bot: We produce food for Chinchillas",
                2000,
                () => setTypingStatus("human1"),
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>

      {/* Footer Terms */}
      <div className="terms">
        <img src="/logo.png" alt="LAMA AI Logo" />
        <div className="links">
          <Link to="/">Terms of Service</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
