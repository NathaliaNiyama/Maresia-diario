import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Images from "../assets/img";
import conteudos from "../assets/conteudos.json";
import conteudosTraduzidos from "../assets/conteudos-traduzido.json";
import "../assets/css/sobreNos.css";
import Cadastro from "../components/Cadastro";
import Footer from "../components/Footer";

export default function SobreNos() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const secaoInicial = queryParams.get("secao") || "nossaHistoria";

  const [conteudoAtivo, setConteudoAtivo] = useState(secaoInicial);
  const [menusAbertos, setMenusAbertos] = useState({});

  // ✅ ESCOLHE O ARQUIVO CORRETO BASEADO NO IDIOMA
  const conteudosAtuais = i18n.language === "en" ? conteudosTraduzidos : conteudos;

  // Lista de todas as seções válidas (incluindo submenus)
  const todasSecoesValidas = [
    "nossaHistoria",
    "regulamento", "freteGratis", "prazosEntregas", "formasPagamento", "pixParcelado",
    "mareSerena", "floralAtlantico", "ecosDoMar", "perolaSalgada",
    "melhorMarca", "tecidosLeves", "designInovador", "sustentabilidade",
    "vivaPraia", "sonhoVerde"
  ];

  const menuEstrutura = [
    { key: "nossaHistoria", titulo: conteudosAtuais.nossaHistoria.titulo },
    {
      key: "politicasMaresia",
      titulo: i18n.language === "en" ? "Maresia Policies" : "Políticas Maresia",
      submenus: [
        "regulamento",
        "freteGratis",
        "prazosEntregas",
        "formasPagamento",
        "pixParcelado",
      ],
    },
    {
      key: "colecoes",
      titulo: i18n.language === "en" ? "Collections" : "Coleções",
      submenus: ["mareSerena", "floralAtlantico", "ecosDoMar", "perolaSalgada"],
    },
    {
      key: "premiosMaresia",
      titulo: i18n.language === "en" ? "Maresia Awards" : "Prêmios Maresia",
      submenus: ["melhorMarca", "tecidosLeves", "designInovador", "sustentabilidade"],
    },
    {
      key: "projetosFuturos",
      titulo: i18n.language === "en" ? "Future Projects" : "Projetos Futuros",
      submenus: ["vivaPraia", "sonhoVerde"],
    },
  ];

  function toggleMenu(nome) {
    setMenusAbertos((prev) => {
      const novoEstado = {};
      menuEstrutura.forEach((item) => {
        if (item.submenus) {
          novoEstado[item.key] = item.key === nome ? !prev[item.key] : false;
        }
      });
      return novoEstado;
    });
  }

  // Quando a página abre ou o parâmetro muda
  useEffect(() => {
    // Se a seção da URL não existe, redireciona para a página padrão (sem 404)
    if (secaoInicial && !todasSecoesValidas.includes(secaoInicial)) {
      // Remove parâmetro inválido da URL
      navigate('/sobrenos', { replace: true });
      setConteudoAtivo("nossaHistoria");
      return;
    }

    setConteudoAtivo(secaoInicial);

    // Verifica se a seção inicial pertence a algum submenu
    const submenuPai = menuEstrutura.find(
      (item) => item.submenus && item.submenus.includes(secaoInicial)
    );

    if (submenuPai) {
      setMenusAbertos({ [submenuPai.key]: true });
    } else {
      setMenusAbertos({});
    }
  }, [secaoInicial, navigate]);

  // ✅ ATUALIZA OS CONTEÚDOS QUANDO O IDIOMA MUDAR
  useEffect(() => {
    // Força a atualização do componente quando o idioma mudar
    setConteudoAtivo(prev => prev); // Isso força o re-render
  }, [i18n.language]);

  // Função para verificar se o conteúdo existe
  const conteudoExiste = conteudoAtivo && conteudosAtuais[conteudoAtivo];

  return (
    <main className="conteudo">
      <div className="container">
        {/* Menu lateral */}
        <aside className="menu-lateral">
          <h2>{i18n.language === "en" ? "Sections" : "Seções"}</h2>
          <ul>
            {menuEstrutura.map((item) => (
              <li key={item.key}>
                {item.submenus ? (
                  <>
                    <button
                      className={conteudoAtivo === item.key ? "ativo" : ""}
                      onClick={() => toggleMenu(item.key)}
                    >
                      {item.titulo}
                    </button>
                    <ul style={{ display: menusAbertos[item.key] ? "block" : "none" }}>
                      {item.submenus.map((sub) => (
                        <li key={sub}>
                          <button
                            className={conteudoAtivo === sub ? "ativo" : ""}
                            onClick={() => setConteudoAtivo(sub)}
                          >
                            {conteudosAtuais[sub]?.titulo || sub}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <button
                    className={conteudoAtivo === item.key ? "ativo" : ""}
                    onClick={() => setConteudoAtivo(item.key)}
                  >
                    {item.titulo}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Menu simplificado */}
        <div className="menu-simplificado">
          <span className="menu-colunaa">{i18n.language === "en" ? "Sections" : "Seções"}</span>
          {menuEstrutura.map((item) => (
            <div className="menu-coluna" key={item.key}>
              {item.submenus ? (
                <>
                  <button
                    className={conteudoAtivo === item.key ? "ativo" : ""}
                    onClick={() => toggleMenu(item.key)}
                  >
                    <span>{item.titulo}</span>
                    <img
                      src={Images.Seta}
                      className="seta"
                      alt="seta"
                      style={{
                        transform: menusAbertos[item.key] ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <ul style={{ display: menusAbertos[item.key] ? "block" : "none" }}>
                    {item.submenus.map((sub) => (
                      <li key={sub}>
                        <button
                          className={conteudoAtivo === sub ? "ativo" : ""}
                          onClick={() => setConteudoAtivo(sub)}
                        >
                          {conteudosAtuais[sub]?.titulo || sub}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <button
                  className={conteudoAtivo === item.key ? "ativo" : ""}
                  onClick={() => setConteudoAtivo(item.key)}
                >
                  {item.titulo}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo dinâmico */}
        <div id="conteudo-dinamico" className="conteudo-dinamico">
          {conteudoExiste ? (
            <section>
              <h2>{conteudosAtuais[conteudoAtivo].titulo}</h2>
              {conteudosAtuais[conteudoAtivo].paragrafos?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ) : (
            <section className="conteudo-nao-encontrado">
              <h2>{i18n.language === "en" ? "Section not found" : "Seção não encontrada"}</h2>
              <p>
                {i18n.language === "en" ? "The section" : "A seção"} 
                "<strong>{conteudoAtivo}</strong>" 
                {i18n.language === "en" ? "does not exist in our content." : "não existe em nosso conteúdo."}
              </p>
              <p>
                {i18n.language === "en" 
                  ? "Please select one of the available options in the menu." 
                  : "Por favor, selecione uma das opções disponíveis no menu ao lado."}
              </p>
              <button
                onClick={() => setConteudoAtivo("nossaHistoria")}
                className="btn-voltar-padrao"
              >
                {i18n.language === "en" ? "View Our Story" : "Ver Nossa História"}
              </button>
            </section>
          )}
        </div>
      </div>

      {/* Rodapé */}
      <section className="rodape-info">
        <div className="info-contato">
          <img src={Images.LogoWhatsapp} alt="whatsapp" />
          <p>
            <strong>(12) 33456-7890</strong>
          </p>
          <hr className="hr1" />
          <p className="ha">
            <strong>
              {i18n.language === "en" ? "Service" : "Horário de"} <br /> 
              {i18n.language === "en" ? "Hours:" : "atendimento:"}
            </strong>
          </p>
        </div>
        <div className="ss">
          {i18n.language === "en" ? "Mon to Fri from 7am to 8pm" : "Seg à Sex entre 7h até 20h"} <br />
          {i18n.language === "en" ? "Sat, Sun and holidays from 10am to 3pm" : "Sáb, Dom e feriados entre 10h até 15h"}
        </div>
      </section>
      <Cadastro />
      <Footer />
    </main>
  );
}