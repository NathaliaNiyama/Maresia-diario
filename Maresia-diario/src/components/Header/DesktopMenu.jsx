import { Link, useLocation } from "react-router-dom";

export default function DesktopMenu({
  t
}) {
  const location = useLocation();
  const isCategorias = location.pathname === "/categorias";
  return (
    <nav className="menu" aria-label={t("Menu principal")}>

      {/* COLEÇÕES */}
      <div className="categoria-link">
        <Link to={isCategorias ? "/" : "/categorias"} className="texto-categoria">{isCategorias ? t("Página inicial") : t("Categoria")}</Link>
      </div>
    </ nav>
  );
}