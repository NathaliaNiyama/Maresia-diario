import { Link } from "react-router-dom";
import Images from "../assets/img";
import "../assets/css/MeusPedidos.css";
import "../assets/css/perfil.css";  


export default function Sidebar({ handleSair, t }) {
  return (
    <aside>
      <div className="usuario">
        <img src={Images.PerfilLogo} alt="perfil" />
        <h2>{t ? t("Bem-vindo!") : "Bem-vindo!"}</h2>
      </div>


      <hr />


      <ul>
        <li>
          <button
            onClick={handleSair}
            style={{
              color: "#d32f2f",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Sair da conta
          </button>
        </li>


        <li>
          <Link to="/sacola">Sacola</Link>
        </li>


        <li>
          <Link to="/meus-pedidos">Meus pedidos</Link>
        </li>


        <li>
          <Link to="/perfil">Dados pessoais</Link>
        </li>
      </ul>
    </aside>
  );
}

