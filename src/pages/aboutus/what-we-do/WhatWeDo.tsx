import './WhatWeDo.css';

const WhatWeDo = () => {
  const sections = [
    {
      title: "Avionics",
      description:
        "Responsible for the central flight computer and main interfaces between other satellite subsystems. Also responsible for the attitude determination and control system (ADCS), which allows for orientation adjustment of the satellite in orbit to ensure optimal power collection and to comply with payload requirements.",
      image: "", // Add your image URL here
    },
    {
      title: "Communications",
      description:
        "Handles communication between the satellite and ground stations. Ensures stable data transmission and real-time command execution for the satellite.",
      image: "", // Add your image URL here
    },
    {
      title: "Structures",
      description:
        "Provides the physical framework of the satellite, ensuring strength and durability while minimizing weight to meet launch constraints.",
      image: "", // Add your image URL here
    },
    {
      title: "Power",
      description:
        "Manages the energy systems of the satellite, including solar panels and batteries, to maintain continuous power supply for all subsystems.",
      image: "", // Add your image URL here
    },
  ];

  return (
    <div className="what-we-do-container">
      {sections.map((section, index) => (
        <div
          key={index}
          className={`section ${index % 2 === 1 ? "reverse" : ""}`}
        >
          <div className="image-box">
            <img
              src={section.image || "/placeholder.png"}
              alt={`${section.title} image`}
              width={400}
              height={300}
            />
          </div>
          <div className="text-box">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WhatWeDo; 