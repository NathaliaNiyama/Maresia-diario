import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "../assets/css/filtros.css";
import setaBaixo from "../assets/img/seta-baixo.png";

export default function Filtros({ onFiltrosChange }) {
  const { t } = useTranslation();
  
  const paletaDeCores = {
    "Coral": "#dc143c",
    "Canela": "#992e04",
    "Vinho": "#720c2e",
    "Laranja": "#ffa500",
    "Narciso": "#ffff00",
    "Lima": "#32cd32",
    "Musgo": "#006400",
    "Piscina": "#0c6f72",
    "Azul": "#00bfff",
    "Marine": "#191970",
    "Roxo": "#4B0082",
    "Lilás": "#9370DB",
    "Rosa": "#ff69b4",
    "Bege": "#f5f5dc",
    "Marrom": "#392620",
    "Cinza": "#696969",
    "Preto": "#000000",
    "Branco": "#ffffff",
  };

  const precosConfig = [
    { label: t("Até R$50"), valor: "ate50" },
    { label: t("R$50 a R$100"), valor: "50a100" },
    { label: t("R$100 a R$150"), valor: "100a150" },
    { label: t("R$150 a R$200"), valor: "150a200" },
    { label: t("+ R$200"), valor: "200mais" },
  ];

  // Materiais em português (valores originais para o backend)
  const materiaisOriginais = ["Algodão", "Poliéster", "Linho", "Lycra", "Jeans", "Crochê", "Couro"];
  
  // Materiais traduzidos (para exibição)
  const materiaisTraduzidos = [
    t("Algodão"), 
    t("Poliéster"), 
    t("Linho"), 
    t("Lycra"), 
    t("Jeans"), 
    t("Crochê"), 
    t("Couro")
  ];

  const tamanhos = ["PP", "P", "M", "G", "GG"];

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [precoSelecionado, setPrecoSelecionado] = useState(null);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [materialSelecionadoOriginal, setMaterialSelecionadoOriginal] = useState(null);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState([]);
  const [coresSelecionadas, setCoresSelecionadas] = useState([]);

  // Atualiza os filtros no componente pai sempre que algo mudar
  useEffect(() => {
    const filtros = {};

    if (precoSelecionado) {
      filtros.preco = precoSelecionado;
    }

    if (materialSelecionadoOriginal) {
      filtros.material = materialSelecionadoOriginal;
    }

    if (tamanhosSelecionados.length > 0) {
      filtros.tamanhos = tamanhosSelecionados.join(',');
    }

    if (coresSelecionadas.length > 0) {
      filtros.cores = coresSelecionadas.join(',');
    }

    console.log('🎯 Filtros montados:', filtros);

    // Notifica o componente pai sobre as mudanças
    if (onFiltrosChange) {
      onFiltrosChange(filtros);
    }
  }, [precoSelecionado, materialSelecionadoOriginal, tamanhosSelecionados, coresSelecionadas]);

  const toggleDropdown = () => {
    if (dropdownAberto) {
      setDropdownAberto(false);
      setTimeout(() => setDropdownVisivel(false), 400);
    } else {
      setDropdownVisivel(true);
      setTimeout(() => setDropdownAberto(true), 10);
    }
  };

  const togglePreco = (valorPreco) => {
    setPrecoSelecionado(precoSelecionado === valorPreco ? null : valorPreco);
  };

  const toggleMaterial = (index) => {
    if (materialSelecionadoOriginal === materiaisOriginais[index]) {
      // Desselecionar
      setMaterialSelecionado(null);
      setMaterialSelecionadoOriginal(null);
    } else {
      // Selecionar - usar o valor original para o filtro e o traduzido para exibição
      setMaterialSelecionado(materiaisTraduzidos[index]);
      setMaterialSelecionadoOriginal(materiaisOriginais[index]);
    }
  };

  const toggleTamanho = (t) => {
    setTamanhosSelecionados((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleCor = (nomeCor) => {
    setCoresSelecionadas((prev) =>
      prev.includes(nomeCor) ? prev.filter((c) => c !== nomeCor) : [...prev, nomeCor]
    );
  };

  const limparFiltros = () => {
    setPrecoSelecionado(null);
    setMaterialSelecionado(null);
    setMaterialSelecionadoOriginal(null);
    setTamanhosSelecionados([]);
    setCoresSelecionadas([]);
  };

  // Contador de filtros ativos
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (precoSelecionado) count++;
    if (materialSelecionadoOriginal) count++;
    if (tamanhosSelecionados.length > 0) count++;
    if (coresSelecionadas.length > 0) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <section className="filter">
      <div className="produtos-title">
        <h2>{t("Maresia")}</h2>
        <div className="dropdown">
          <button
            className={`filtrar ${dropdownAberto ? "ativo" : ""}`}
            onClick={toggleDropdown}
          >
            {t("Filtrar")}
            {/* {filtrosAtivos > 0 && <span className="filtros-count">({filtrosAtivos})</span>} */}
            <img src={setaBaixo} alt={t("Seta")} />
          </button>
        </div>
      </div>

      {dropdownVisivel && (
        <div className={`dropdown-content ${dropdownAberto ? "show" : ""}`}>
          <div className="dropdown-espacamento">

            {/* Preço */}
            <div className="filtro1">
              <h2>{t("Preço")}</h2>
              <ul>
                {precosConfig.map(({ label, valor }) => (
                  <li key={valor}>
                    <a
                      href="#"
                      className={precoSelecionado === valor ? "ativo" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        togglePreco(valor);
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Material */}
            <div className="filtro2">
              <h2>{t("Material")}</h2>
              <div className="material-lista">
                <ul>
                  {materiaisTraduzidos.slice(0, 4).map((m, index) => (
                    <li key={materiaisOriginais[index]}>
                      <a
                        href="#"
                        className={materialSelecionado === m ? "ativo" : ""}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMaterial(index);
                        }}
                      >
                        {m}
                      </a>
                    </li>
                  ))}
                </ul>
                <ul>
                  {materiaisTraduzidos.slice(4).map((m, index) => (
                    <li key={materiaisOriginais[index + 4]}>
                      <a
                        href="#"
                        className={materialSelecionado === m ? "ativo" : ""}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMaterial(index + 4);
                        }}
                      >
                        {m}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tamanhos */}
            <div className="filtro3">
              <h2>{t("Tamanhos")}</h2>
              <div className="medidas">
                {tamanhos.map((t) => (
                  <button
                    key={t}
                    className={`medida-btn ${tamanhosSelecionados.includes(t) ? "ativo" : ""}`}
                    onClick={() => toggleTamanho(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores */}
            <div className="filtro4">
              <h2>{t("Cores")}</h2>
              <ul className="dropdown-content-color">
                {Object.entries(paletaDeCores).map(([nome, hex]) => (
                  <li key={nome}>
                    <div
                      className={`cor-item ${coresSelecionadas.includes(nome) ? "selecionado" : ""}`}
                      style={{ backgroundColor: hex, border: hex === "#ffffff" ? "1px solid #999" : "none" }}
                      title={t(nome)}
                      onClick={() => toggleCor(nome)}
                    />
                  </li>
                ))}
              </ul>
              <div className="limpar-filtros-container">
                <button className="btn-limpar" onClick={limparFiltros}>
                  {t("Limpar Filtros")}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}