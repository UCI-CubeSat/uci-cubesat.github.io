import ImageCarousel from "../components/Carousel/Carousel"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"


function Home() {
  return (
    <div className="h-screen flex flex-col gap-y-3">
      <Navbar route={"/"} />
      <div className="flex flex-col items-center justify-start h-full p-4 gap-y-4">
        <ImageCarousel />

        <h2>Welcome to UCI CubeSat</h2>
        <p className="w-1/2">
          The UCI CubeSat project is a student-led initiative at the University of California, Irvine to design, build, and launch a CubeSat into low-Earth orbit. The project is a collaboration between the UCI Aerospace Engineering program and the Aerospace Systems and Propulsion Integration Lab (ASPIN) at UCI. The project is led by a team of undergraduate and graduate students from the Henry Samueli School of Engineering at UCI.
          {/* The CubeSat team at UCI is a student-led undergraduate interdisciplinary research and design project with the goal of launching a 2U nanosatellite into orbit to test a UCI research payload. The satellite operates with six main engineering subsystems: Avionics, Communications, Structures, Power, Developer Operations, and Systems, in addition to housing our research payload.
         The goal of the UCI CubeSat project is to design, test, integrate, and launch a modular microsatellite into low-Earth orbit in conjunction with Professor Copp and the ASPIN lab at UCI to test multiple payloads in orbit. The team hopes to be the first student launch at UCI, creating a standard for future student launches and orbital research at UCI.  */}
         
        </p>

        <h3 className="mt-10">Thank you to our Sponsors</h3>
        <img src="/sponsors/ng.png" alt="Northrop Grumman" className="h-20" />
        <img src="/sponsors/terran.jpg" alt="Terran Orbital" className="h-20" />
      </div>
      <Footer />
    </div>
  )
}

export default Home
