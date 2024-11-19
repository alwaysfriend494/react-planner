import React, { useState } from "react";

const ProjectInformationModal = () => {
  const [visibleModal, setVisibleModal] = useState(true);

  const baseStyles = {
    width: 600,
    height: 350,
    position: "absolute",
    top: 200,
    left: "50%", // Center horizontally
    transform: "translateX(-50%)", // Adjust for centering
    padding: 30,
    zIndex: 100,
    background: "#fff",
    boxShadow: "10px 10px 100px -5px rgba(0,0,0,0.75)",
    borderRadius: 5,
  };

  const hiddenStyles = {
    display: "none",
  };

  const modalStyles = visibleModal ? baseStyles : { ...baseStyles, ...hiddenStyles };

  const closeModal = () => setVisibleModal(false);

  return (
    <div style={modalStyles}>
      <button
        onClick={closeModal}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ✖
      </button>
      <div style={{}}>This project is updated from <a target="_blank" href="https://github.com/cvdlab/react-planner">https://github.com/cvdlab/react-planner</a></div>
      <div style={{}}>You can see last project through <a target="_blank" href="https://cvdlab.github.io/react-planner/">https://cvdlab.github.io/react-planner</a></div>
      <img src="https://ibb.co/TrjQXhC" width={500} alt="Preview Image"/>
    </div>
  )
}

export default ProjectInformationModal