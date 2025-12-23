import { useState } from 'react';
import './MeetTheTeam.css';

const MeetTheTeam = () => {
  const [activeRole, setActiveRole] = useState("All");
  
  const teamMembers = [
    {
      name: "Sonia Cruze",
      role: "Executive",
      position: "Project Manager",
      image: "/Headshots/Sonia.png",
    },
    {
      name: "Alex Amadeo-Ranch",
      role: "Executive",
      position: "Chief Integration Officer",
      image: "/Headshots/Alex_R.png",
    },
    {
      name: "Praneet Iddamsetty",
      role: "Executive",
      position: "Chief Software Engineer",
      image: "",
    },
    {
      name: "Erick Rosales",
      role: "Executive",
      position: "Chief Hardware Engineer",
      image: "/Headshots/Erick.png",
    },
    {
      name: "Cosmo Daniels",
      role: "Avionics",
      position: "Subteam Lead",
      image: "",
    },
    {
      name: "Zarif Hossain",
      role: "Avionics",
      position: "Software",
      image: "",
    },
    {
      name: "Kyle Tran",
      role: "Avionics",
      position: "Software",
      image: "",
    },
    {
      name: "Rohit De",
      role: "Avionics",
      position: "Hardware",
      image: "",
    },
    {
      name: "Joel Akiyoshi",
      role: "Communications",
      position: "Software",
      image: "",
    },
    {
      name: "Jonathan Lin",
      role: "Communications",
      position: "Subteam Lead",
      image: "",
    },
    {
      name: "Styles Shortridge",
      role: "Communications",
      position: "Hardware",
      image: "",
    },
    {
      name: "Sriharshini Gubbala",
      role: "Operations",
      position: "Subteam Lead",
      image: "/Headshots/Sri.png",
    },
    {
      name: "Alexander Nguyen",
      role: "Operations",
      position: "Finance",
      image: "",
    },
    {
      name: "Claire Phan",
      role: "Operations",
      position: "Webmaster",
      image: "",
    },
    {
      name: "Byren Cheema",
      role: "Operations",
      position: "Webmaster",
      image: "",
    },
    {
      name: "Nathan Nguyen",
      role: "Operations",
      position: "Webmaster",
      image: "",
    },
    {
      name: "Aaditya Borse",
      role: "Operations",
      position: "Marketing",
      image: "",
    },
    {
      name: "Matthew Quach",
      role: "Operations",
      position: "Marketing",
      image: "",
    },
    {
      name: "Supreya Saxena",
      role: "Operations",
      position: "Executive Assistant",
      image: "",
    },
    {
      name: "Fabian Hernandez",
      role: "Power",
      position: "Hardware Lead",
      image: "/Headshots/Fabian.png",
    },
    {
      name: "Hee Jean Kwon",
      role: "Power",
      position: "Software Lead",
      image: "/Headshots/Jean.png",
    },
    {
      name: "Jenavieve Steward",
      role: "Power",
      position: "Subteam Lead",
      image: "",
    },
    {
      name: "Andy Li",
      role: "Power",
      position: "Hardware",
      image: "",
    },
    {
      name: "Gloria McMaster-Sanchez",
      role: "Structures",
      position: "Subteam Lead",
      image: "/Headshots/Gloria.png",
    },
    {
      name: "Charles Maldonado Rios",
      role: "Structures",
      position: "Burn Wire Development & 3D Modeling",
      image: "",
    },
    {
      name: "Emmanuel Bivian",
      role: "Structures",
      position: "3D Modeling",
      image: "",
    },
    {
      name: "Alan Duong",
      role: "Structures",
      position: "Assembly Engineer",
      image: "",
    },
    {
      name: "Isaiah Lu",
      role: "Structures",
      position: "Assembly Engineer",
      image: "",
    },
    {
      name: "Keiko Yamamuro",
      role: "Structures",
      position: "Simulations Engineer",
      image: "",
    },
    {
      name: "Nicholas Lins",
      role: "Systems",
      position: "Subteam Lead",
      image: "",
    },
    {
      name: "Marco Cheng",
      role: "Systems",
      position: "Integration and Design",
      image: "",
    },
    {
      name: "Sijia Zhang",
      role: "Systems",
      position: "Integration and Design",
      image: "",
    },
    {
      name: "Xavier Marciano",
      role: "Systems",
      position: "Integration and Design",
      image: "",
    },
  ];

  const roles = [
    "All",
    "Executive",
    "Avionics",
    "Communications",
    "Operations",
    "Power",
    "Structures",
    "Systems",
  ];

  const filteredMembers = activeRole === "All" 
    ? teamMembers 
    : teamMembers.filter(member => member.role === activeRole);

  return (
    <>
      <div className="our-mission-container">
        <div className="mission-text">
          <h1>Our Mission</h1>
          <p>
            At UCI CubeSat, we are developing, testing, and launching Ant01, a
            2U CubeSat, into Low Earth Orbit (LEO) to conduct groundbreaking
            research. Our mission focuses on testing the Variable Emissivity
            Device (VED), a cutting-edge technology for cost-effective
            spacecraft thermal regulation.
          </p>
          <p>
            By evaluating Ant01's performance in orbit, we gather critical data
            that will drive future innovations in microsatellite design and
            performance.
          </p>
        </div>
        <div className="mission-image">
          <img src="/photos/Mission.png" alt="Mission Placeholder" />
        </div>
      </div>
      <div className="meet-the-team-container">
        <div className="header">
          <h1>
            Meet <span className="highlight">Our Team.</span>
          </h1>
          <p>
            A driven set of undergraduates backed by industry leaders such as
            Northrop Grumman and General Atomics.
          </p>
        </div>
        <div className="roles-navigation">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={activeRole === role ? "active" : ""}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="team-grid">
          {filteredMembers.map((member, index) => (
            <div className="team-member" key={index}>
              <div className="member-photo">
                {member.image ? (
                  <img src={member.image} alt={member.name} />
                ) : (
                  <div className="initials-placeholder">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div className="member-info">
                <h3>{member.role}</h3>
                <p className="position">{member.position}</p>
                <span className="member-name">{member.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MeetTheTeam; 