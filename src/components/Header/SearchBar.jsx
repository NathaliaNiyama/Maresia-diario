import { useRef } from "react";
import Images from "../../assets/img";

export default function SearchBar({
  termoBusca,
  setTermoBusca,
  mostrarBusca,
  setMostrarBusca,
  realizarBusca,
  buscaRef,
  t
}) {
  const inputRef = useRef(null);

  return (
    <div className="acoes-pesquisa desktop-only" ref={buscaRef}>

      {/* Ícone da lupa - agora foca o input */}
      <div
        className="icone-lupa-container"
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        <img
          src={Images.Lupa}
          alt={t("Lupa")}
          className="icone-pesquisa"
        />
      </div>

      {/* Input de busca sempre visível e com tamanho fixo centralizado */}
      <input
        ref={inputRef}
        type="text"
        placeholder={t("Pesquisar produtos...")}
        className={`barra-pesquisa-header`}
        value={termoBusca}
        onChange={(e) => setTermoBusca(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            realizarBusca(termoBusca);
          }
        }}
        aria-label={t("Pesquisar produtos")}
        autoComplete="off"
      />
    </div>
  );
}