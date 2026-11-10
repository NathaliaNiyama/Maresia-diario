import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../assets/css/busca.css";
import Images from "../assets/img";

export default function Busca() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const termoBusca = searchParams.get("q");

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);

  const limite = 12;

  // Mapeamento de nomes de cores para hex - ATUALIZADO com cores em português
  const paletaDeCores = {
    "Vermelho": "#dc143c",
    "Coral": "#dc143c",
    "Canela": "#992e04",
    "Vinho": "#720c2e",
    "Laranja": "#ffa500",
    "Amarelo": "#ffff00",
    "Narciso": "#ffff00",
    "Verde": "#32cd32",
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

  // Função para obter o código hex da cor - ATUALIZADA
  const getCorHex = (nomeCor) => {
    if (!nomeCor) return "#cccccc";
    
    // Normaliza o nome da cor (primeira letra maiúscula)
    const corNormalizada = nomeCor.charAt(0).toUpperCase() + nomeCor.slice(1).toLowerCase();
    
    return paletaDeCores[corNormalizada] || "#cccccc";
  };

  // Função para obter a imagem de novidade baseada no idioma
  const getImagemNovidade = () => {
    return i18n.language === "pt" ? Images.simboloNovidade : Images.TraducaoNovidade;
  };

  // ✅ FUNÇÃO PARA TRADUZIR CORES
  const traduzirCor = (cor) => {
    if (!cor) return "";
    
    const coresTraduzidas = {
      "red": t("Vermelho"),
      "coral": t("Coral"),
      "cinnamon": t("Canela"),
      "wine": t("Vinho"),
      "orange": t("Laranja"),
      "yellow": t("Amarelo"),
      "narcissus": t("Narciso"),
      "green": t("Verde"),
      "lime": t("Lima"),
      "moss": t("Musgo"),
      "pool": t("Piscina"),
      "blue": t("Azul"),
      "marine": t("Marine"),
      "purple": t("Roxo"),
      "lilac": t("Lilás"),
      "pink": t("Rosa"),
      "beige": t("Bege"),
      "brown": t("Marrom"),
      "gray": t("Cinza"),
      "grey": t("Cinza"),
      "black": t("Preto"),
      "white": t("Branco")
    };
    
    return coresTraduzidas[cor.toLowerCase()] || cor;
  };

  useEffect(() => {
    if (termoBusca) {
      buscarProdutos();
    }
  }, [termoBusca, paginaAtual]);

  const buscarProdutos = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const url = `${API_URL}/products/search`;
      
      console.log('🔍 Fazendo requisição para:', url);
      console.log('📝 Parâmetros:', { q: termoBusca, page: paginaAtual, limit: limite });
      
      const response = await axios.get(url, {
        params: {
          q: termoBusca,
          page: paginaAtual,
          limit: limite,
        },
      });

      console.log('✅ Resposta recebida:', response.data);

      // ✅ ATUALIZADO: Use a nova estrutura da API
      setProdutos(response.data.data || []);
      setTotalResultados(response.data.search?.resultsFound || 0);
      setTotalPaginas(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
      console.error("Detalhes do erro:", error.response?.data);
      console.error("Status:", error.response?.status);
      
      let mensagemErro = t("Erro ao buscar produtos");
      
      if (error.response?.status === 400) {
        mensagemErro = t("Termo de busca inválido");
      } else if (error.response?.status === 404) {
        mensagemErro = t("Nenhum produto encontrado");
      } else if (error.response?.data?.error) {
        mensagemErro = error.response.data.error;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <Header />
      <main className="busca-page">
        <div className="busca-header">
          <h1>
            {t("Resultados para")}: <span>"{termoBusca}"</span>
          </h1>
          <p className="total-resultados">
            {totalResultados} {totalResultados === 1 ? t("produto encontrado") : t("produtos encontrados")}
          </p>
        </div>

        {carregando ? (
          <div className="loading-container" style={{
            textAlign: 'center',
            padding: '60px 20px',
            fontSize: '18px',
            color: '#666'
          }}>
            <p style={{paddingBottom: "600px"}}>{t("Carregando produtos...")}</p>
          </div>
        ) : erro ? (
          <div className="erro">
            <p>{erro}</p>
          </div>
        ) : produtos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            borderRadius: '16px',
            margin: '40px 20px'
          }}>
            <p style={{ fontSize: '22px', color: '#6b6161', marginBottom: '15px', fontWeight: 600 }}>
               {t("Nenhum produto encontrado para")} "{termoBusca}"
            </p>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              {t("Tente usar palavras-chave diferentes ou verificar a ortografia.")}
            </p>
          </div>
        ) : (
          <>

            {/* Grid de Produtos - igual ao Catalogo */}
            <div className="catalogo-container">
              <div id="produtos-container" className="produtos">
                {produtos.map((produto) => (
                  <div key={produto.id} className="produto-card">
                    <div className="img-container">
                      <Link to={`/produto/${produto.id}`}>
                        <img
                          src={
                            produto.image1 ||
                            produto.images?.image1 || // ✅ ATUALIZADO: Suporte para nova estrutura de imagens
                            produto.collection?.image ||
                            "/imagem-padrao.png"
                          }
                          alt={produto.name}
                          onError={(e) => {
                            e.target.src = "/imagem-padrao.png";
                          }}
                        />
                      </Link>

                      {/* ✅ ATUALIZADO: Mostra badge de novidade baseado no campo 'new' com imagem dinâmica */}
                      {produto.new && (
                        <div className="novidade-badge">
                          <img src={getImagemNovidade()} alt={t("Novidade")} />
                        </div>
                      )}
                    </div>

                    <h3>{produto.name}</h3>
                    <p>{produto.description}</p>

                    <div className="preco-cores">
                      <p style={{ fontWeight: "bold" }}>
                        R$ {Number(produto.price).toFixed(2).replace(".", ",")}
                      </p>

                      {produto.color && (
                        <div className="cores">
                          {Array.isArray(produto.color) ? (
                            produto.color.map((cor, idx) => (
                              <div
                                key={idx}
                                className="cor-bolinha"
                                style={{
                                  backgroundColor: getCorHex(cor),
                                  // ✅ ATUALIZADO: Suporte para cores em português
                                  border: cor.toLowerCase() === "branco" || cor.toLowerCase() === "white" ? "1px solid #999" : "none",
                                }}
                                title={traduzirCor(cor)}
                              />
                            ))
                          ) : (
                            <div
                              className="cor-bolinha"
                              style={{
                                backgroundColor: getCorHex(produto.color),
                                // ✅ ATUALIZADO: Suporte para cores em português
                                border: produto.color.toLowerCase() === "branco" || produto.color.toLowerCase() === "white" ? "1px solid #999" : "none",
                              }}
                              title={traduzirCor(produto.color)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="paginacao">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className="btn-paginacao"
                >
                  {t("Anterior")}
                </button>

                <div className="paginas">
                  {[...Array(totalPaginas)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => mudarPagina(index + 1)}
                      className={`btn-pagina ${
                        paginaAtual === index + 1 ? "ativo" : ""
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className="btn-paginacao"
                >
                  {t("Próxima")}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}