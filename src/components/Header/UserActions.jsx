import { Link, useLocation } from "react-router-dom";
import i18n from "i18next";
import Images from "../../assets/img";
import NotificacaoPage from "../../pages/NotificacaoPage";
import { useState } from "react";
import "../../assets/css/notificacao.css";

export default function UserActions({
  usuarioLogado,
  itens,
  toggleCarrinho,
  carrinhoRef,
  t,
}) {
  const location = useLocation();
  const isCategorias = location.pathname === "/categorias";

  const [open, setOpen] = useState(false);

  return (
    <div className="acoes">
      {/* USUÁRIO */}
      {usuarioLogado ? (
        <Link to="/perfil" className="texto-entrar">
          <img
            src={Images.Login}
            alt={t("Ícone de conta")}
            className="icone-conta"
          />

          {usuarioLogado.username || usuarioLogado.name || t("Perfil")}
        </Link>
      ) : (
        <>
          <Link
            to={isCategorias ? "/" : "/categorias"}
            className="texto-categoria"
          >
            {isCategorias ? t("Página inicial") : t("Categoria")}
          </Link>

          <Link to="/cadastro" className="texto-entrar">
            <img
              src={Images.ContaIcon}
              alt={t("Ícone de conta")}
              className="icone-conta"
            />

            <span className="texto-entrar-text">{t("Entrar")}</span>
          </Link>
        </>
      )}

      {/* IDIOMA */}
      <div
        className="acoes-idioma"
        style={{ display: "flex", alignItems: "center" }}
      >
        <button
          type="button"
          onClick={() => {
            const novoIdioma = i18n.language === "pt" ? "en" : "pt";
            i18n.changeLanguage(novoIdioma);
          }}
          title={t("Mudar idioma")}
        >
          <img
            src={Images.Traducao}
            alt={t("Tradução")}
            className="icone-pesquisa"
          />
        </button>
      </div>

      {/* NOTIFICAÇÕES */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={t("Notificações")}
        style={{
          border: "none",
          background: "transparent",
          position: "relative",
        }}
      >
        <img
          src={Images.Notificacao}
          alt={t("Notificações")}
          className="icone-notificacao"
        />
      </button>

      <NotificacaoPage open={open} setOpen={setOpen} />

      {/* CARRINHO */}
      <button
        type="button"
        ref={carrinhoRef}
        onClick={toggleCarrinho}
        title={t("Carrinho")}
        style={{
          border: "none",
          background: "transparent",
          position: "relative",
        }}
      >
        <img
          src={Images.CarrinhoIconNova}
          alt={t("Carrinho de compras")}
          className="icone-carrinho"
        />

        {itens.length > 0 && (
          <span className="cart-badge">{itens.length}</span>
        )}
      </button>
    </div>
  );
}