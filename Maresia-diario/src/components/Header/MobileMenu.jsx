import { Link } from "react-router-dom";
import Images from "../../assets/img";

export default function MobileMenu({
  menuMobileAberto,
  setMenuMobileAberto,
  termoBuscaMobile,
  setTermoBuscaMobile,
  realizarBusca,
  t
}) {
  // Lista de categorias para renderizar no menu
  const categorias = [
    'vestido', 'camiseta', 'canga', 'short', 'saia',
    'biquini', 'maio', 'sandalia', 'chinelo', 'sombrinha', 'bolsa'
  ];

  // Função para traduzir e formatar a exibição no menu
  const traduzirCategoria = (categoria) => {
    const categoriasTraduzidas = {
      "vestido": t("Vestidos"),
      "camiseta": t("Camisetas"),
      "canga": t("Cangas"),
      "short": t("Shorts"),
      "saia": t("Saias"),
      "biquini": t("Biquinis"),
      "maio": t("Maiôs"),
      "sandalia": t("Sandálias"),
      "chinelo": t("Chinelos"),
      "sombrinha": t("Sombrinhas"),
      "bolsa": t("Bolsas")
    };
    
    return categoriasTraduzidas[categoria.toLowerCase()] || categoria;
  };

  return (
    <>
      <div className={`menu-mobile ${menuMobileAberto ? "aberto" : ""}`}>
        
        {/* FECHAR */}
        <div
          className="fechar-menu"
          onClick={() => setMenuMobileAberto(false)}
        >
          ✕
        </div>

        {/* 🔍 BUSCA */}
        <div className="busca-mobile">
          <input
            type="text"
            placeholder={t("Pesquisar produtos...")}
            value={termoBuscaMobile}
            onChange={(e) => setTermoBuscaMobile(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                realizarBusca(termoBuscaMobile);
              }
            }}
          />
        </div>

        {/* MENU */}
        <ul>
          {/* LINK GERAL DO CATÁLOGO */}
          <li>
            <Link to="/catalogo" onClick={() => setMenuMobileAberto(false)}>
              <strong>{t("Ver Tudo")}</strong>
            </Link>
          </li>

          {/* LINHA DIVISÓRIA (OPCIONAL) */}
          <li className="menu-divisor" style={{ padding: "5px 20px", fontSize: "12px", color: "#999" }}>
            {t("Categorias")}
          </li>

          {/* LISTA DINÂMICA DE CATEGORIAS */}
          {categorias.map((cat) => (
            <li key={cat}>
              <Link 
                to={`/catalogo?categoria=${cat}`} 
                onClick={() => setMenuMobileAberto(false)}
              >
                {traduzirCategoria(cat)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* OVERLAY */}
      <div
        className={`overlay-menu ${menuMobileAberto ? "ativo" : ""}`}
        onClick={() => setMenuMobileAberto(false)}
      />
    </>
  );
}