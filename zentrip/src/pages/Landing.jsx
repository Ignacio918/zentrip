// src/pages/Landing.jsx
import Chat from "../components/Chat";
import "../styles/LandingPage.css";

const Landing = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Descubre la manera{" "}
          <span className="serif-highlight">más fácil</span>{" "}
          de planificar<br />tu próxima aventura
        </h1>
        <Chat />
      </div>
    </section>
  );
};

export default Landing;
