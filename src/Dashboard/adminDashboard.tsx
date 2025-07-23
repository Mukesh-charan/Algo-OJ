import "./dashboard.css";
import Particles from "react-tsparticles";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const particlesInit = async (engine: Engine) => {
        try {
          await loadSlim(engine);
        } catch (error) {
          console.error("Error initializing particles:", error);
        }
      };
    
      const particlesOptions: RecursivePartial<IOptions> = {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: "#ffffff",
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.5,
            random: false,
          },
          size: {
            value: 3,
            random: true,
          },
          links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "repulse",
            },
            onclick: {
              enable: true,
              mode: "push",
            },
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
            push: {
              particles_nb: 4,
            },
          },
        },
        retina_detect: true,
      };
    const navigate = useNavigate();
    return (
        <div>
        <Particles
            id="welcome-particles"
            init={particlesInit}
            options={particlesOptions}
            className="particles-container"
          />
          
        <div>
      <header className="header">
        <h1>Random(Compile)</h1>
      </header>
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div style={{ display: "flex", gap: "100px", width: "100%"}}>
        <button style={{ flex: 1}} onClick={() => navigate("/problemDashboard")}><h2>Problem Dashboard</h2></button>
        <button style={{ flex: 1}} onClick={() => navigate("/userDashboard")}><h2>User Dashboard</h2></button>
        </div>
      </div>
      </div>
      </div>
    )
}
export default AdminDashboard;