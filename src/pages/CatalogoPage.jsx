import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/css/catalogoPage.css";
import Images from "../assets/img";
import Filtros from "../components/Filtros";
import Cadastro from "../components/Cadastro";
import SacolaLogo from "../assets/img/sacola-logo.png";

export default function CatalogoPage() {
  const { t, i18n } = useTranslation();
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState({});
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [abaMobileAtiva, setAbaMobileAtiva] = useState("novidades");
  const isFirstRender = useRef(true);

  const location = useLocation();
  const navigate = useNavigate();
  const LIMIT = 12;

  // Mapeamento de nomes de cores para hex
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

  // Lista de categorias válidas para verificação
  const categoriasValidas = [
    'vestido', 'camiseta', 'canga', 'short', 'saia',
    'biquini', 'maio', 'sandalia', 'chinelo', 'sombrinha', 'bolsa'
  ];

  // Função para obter o código hex da cor
  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#cccccc";
  };

  // Função para obter a imagem de novidade baseada no idioma
  const getImagemNovidade = () => {
    return i18n.language === "pt" ? Images.simboloNovidade : Images.TraducaoNovidade;
  };

  // Função para formatar nome da categoria
  const formatarCategoria = (cat) => {
    if (!cat) return "";
    const primeiraLetra = cat.charAt(0).toUpperCase() + cat.slice(1);
    return primeiraLetra.endsWith("s") ? primeiraLetra : primeiraLetra + "s";
  };

  // Função para traduzir categorias
  const traduzirCategoria = (categoria) => {
    if (!categoria) return "";
    
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
    
    return categoriasTraduzidas[categoria.toLowerCase()] || formatarCategoria(categoria);
  };

  // Buscar produtos com filtros
  const fetchProdutos = async (filtros = {}) => {
    try {
      setCarregando(true);
      
      const params = new URLSearchParams({
        page: '1',
        limit: LIMIT.toString(),
        ...filtros,
      });

      if (categoriaSelecionada) {
        params.set('categoria', categoriaSelecionada);
      }

      console.log('🔍 Buscando produtos com filtros:', { ...filtros, categoria: categoriaSelecionada });
      console.log('📄 URL:', `http://localhost:3000/products?${params.toString()}`);

      const response = await fetch(
        `http://localhost:3000/products?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(t("Erro ao buscar produtos"));
      }

      const data = await response.json();
      
      console.log("📦 Produtos recebidos:", data.data.length);
      console.log("📊 Total de produtos:", data.pagination.total);

      setProdutos(data.data);
      setTotalProdutos(data.pagination.total);
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Verificar e definir categoria da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("categoria");

    if (cat) {
      const categoriaLower = cat.toLowerCase();

      if (!categoriasValidas.includes(categoriaLower)) {
        navigate("/404", { replace: true });
        return;
      }

      setCategoriaSelecionada(categoriaLower);
    } else {
      setCategoriaSelecionada(null);
    }
  }, [location.search, navigate]);

  // Buscar produtos quando a categoria mudar
  useEffect(() => {
    if (categoriaSelecionada) {
      console.log('🔄 Categoria mudou, buscando produtos:', categoriaSelecionada);
      fetchProdutos({});
      isFirstRender.current = false;
    } else {
      // Se não houver categoria na URL (fluxo geral do mobile), busca geral inicial
      fetchProdutos({});
    }
  }, [categoriaSelecionada]);

  // Buscar produtos quando os filtros mudarem
  useEffect(() => {
    if (!isFirstRender.current && categoriaSelecionada) {
      console.log('🎯 Filtros mudaram, buscando produtos:', filtrosAtivos);
      fetchProdutos(filtrosAtivos);
    }
  }, [filtrosAtivos]);

  // Handler para mudanças nos filtros
  const handleFiltrosChange = (novosFiltros) => {
    console.log('🎯 Filtros atualizados:', novosFiltros);
    setFiltrosAtivos(novosFiltros);
  };

  const getProductKey = (produto, index) => {
    return produto.id ? `${produto.id}-${index}` : `produto-${index}`;
  };

  const handleAbaMobileClick = (aba) => {
    setAbaMobileAtiva(aba);
  };

  const produtoEhDaCategoria = (produto, categoria) => {
    const termo = categoria.toLowerCase();
    const categoriaProduto = String(produto?.category ?? produto?.categoria ?? "").toLowerCase();
    const nomeProduto = String(produto?.name ?? "").toLowerCase();
    const descricaoProduto = String(produto?.description ?? "").toLowerCase();

    return categoriaProduto.includes(termo) || nomeProduto.includes(termo) || descricaoProduto.includes(termo);
  };

  // Lógica do useMemo unificada
  const produtosExibidos = useMemo(() => {
    if (categoriaSelecionada) {
      return produtos;
    }

    if (!abaMobileAtiva) {
      return produtos;
    }

    if (abaMobileAtiva === "novidades") {
      return produtos.filter((produto) => produto?.new === true || produto?.new === "true" || produto?.new === 1);
    }

    if (abaMobileAtiva === "desconto") {
      return produtos.filter((produto) => {
        const descontoDireto = Number(produto?.discount ?? produto?.desconto ?? 0);
        if (!Number.isNaN(descontoDireto) && descontoDireto >= 50) {
          return true;
        }

        const precoAtual = Number(produto?.price ?? 0);
        const precoAntigo = Number(produto?.oldPrice ?? produto?.originalPrice ?? produto?.precoOriginal ?? 0);

        if (precoAtual > 0 && precoAntigo > precoAtual) {
          const percentual = ((precoAntigo - precoAtual) / precoAntigo) * 100;
          return percentual >= 50;
        }

        return false;
      });
    }

    if (abaMobileAtiva === "biquini") {
      return produtos.filter((produto) => produtoEhDaCategoria(produto, "biquini"));
    }

    if (abaMobileAtiva === "vestido") {
      return produtos.filter((produto) => produtoEhDaCategoria(produto, "vestido"));
    }

    return produtos;
  }, [abaMobileAtiva, produtos, categoriaSelecionada]);

  const renderTopoMobileCategorias = () => (
    <div className="mobile-categorias-topo" aria-label="Cabeçalho da página de categorias no mobile">
      <div className="mobile-categorias-titulo-linha">
        <h2>{t("Categorias")}</h2>
        <Link to="/sacola" className="mobile-categorias-carrinho" aria-label={t("Sacola")}>
          <img src={SacolaLogo} alt={t("Carrinho de compras")} />
        </Link>
      </div>

      <div className="mobile-categorias-divisor" />

      <nav className="mobile-categorias-mini-header" aria-label="Links rápidos de categorias">
        <button
          type="button"
          className={abaMobileAtiva === "novidades" ? "ativo" : ""}
          onClick={() => handleAbaMobileClick("novidades")}
        >
          Novidades
        </button>
        <button
          type="button"
          className={abaMobileAtiva === "desconto" ? "ativo" : ""}
          onClick={() => handleAbaMobileClick("desconto")}
        >
          50% de desconto
        </button>
        <button
          type="button"
          className={abaMobileAtiva === "biquini" ? "ativo" : ""}
          onClick={() => handleAbaMobileClick("biquini")}
        >
          Biquíni
        </button>
        <button
          type="button"
          className={abaMobileAtiva === "vestido" ? "ativo" : ""}
          onClick={() => handleAbaMobileClick("vestido")}
        >
          Vestido
        </button>
      </nav>
    </div>
  );
  
  // Se estiver carregando e não há produtos
  if (carregando && produtos.length === 0) {
    return (
      <div className="catalogo-page">
        {renderTopoMobileCategorias()}
        <div className="cabecalhoProduto">
          <div className="links-catalogo">
            <Link to="/">{t("Inícial")}</Link>
            {categoriaSelecionada && (
              <>
                {" "}-{" "}
                <Link to={`/catalogo?categoria=${categoriaSelecionada}`}>
                  {traduzirCategoria(categoriaSelecionada)}
                </Link>
                : <span>{traduzirCategoria(categoriaSelecionada)}</span>
              </>
            )}
          </div>

          <Filtros onFiltrosChange={handleFiltrosChange} />
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          fontSize: '18px',
          color: '#666',
          fontFamily: 'poppins'
        }}>
          <p style={{paddingBottom: "600px"}}>{t("Carregando produtos")}{categoriaSelecionada ? ` ${t("da categoria")} ${traduzirCategoria(categoriaSelecionada)}` : ''}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo-page">
      {renderTopoMobileCategorias()}

      <div className="cabecalhoProduto">
        <div className="links-catalogo">
          <Link to="/">{t("Inícial")}</Link>
          {categoriaSelecionada && (
            <>
              {" "}-{" "}
              <Link to={`/catalogo?categoria=${categoriaSelecionada}`}>
                {traduzirCategoria(categoriaSelecionada)}
              </Link>
              : <span>{traduzirCategoria(categoriaSelecionada)}</span>
            </>
          )}
        </div>

        <Filtros onFiltrosChange={handleFiltrosChange} />
      </div>

      {/* CONTAINER PRINCIPAL */}
      {produtosExibidos.length === 0 && !carregando ? (
        <div className="catalogo-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          width: '100%',
          marginLeft: '0'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px 0px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            color: '#6b6161',
            gridColumn: '1 / -1'
          }}>
            <p style={{ 
              fontSize: '22px', 
              color: '#6b6161', 
              marginBottom: '15px', 
              fontWeight: 600, 
              fontFamily: 'poppins',
              lineHeight: '1.4'
            }}>
              {t("Nenhum produto encontrado")} {Object.keys(filtrosAtivos).length > 0 ? t('com os filtros selecionados.') : categoriaSelecionada ? `${t('na categoria')} ${traduzirCategoria(categoriaSelecionada)}` : ''}
            </p>
            <p style={{ 
              fontSize: '16px', 
              color: '#9e9e9e', 
              margin: 0, 
              fontFamily: 'poppins',
              lineHeight: '1.5'
            }}>
              {Object.keys(filtrosAtivos).length > 0 
                ? t('Tente ajustar os filtros ou limpar todos para ver mais opções.')
                : categoriaSelecionada 
                  ? `${t('Não há produtos disponíveis na categoria')} ${traduzirCategoria(categoriaSelecionada)} ${t('no momento.')}`
                  : t('Não há produtos disponíveis no momento.')
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="catalogo-container">
          <div className="produtos">
            {produtosExibidos.map((produto, index) => (
              <div className="produto-card" key={getProductKey(produto, index)}>
                <div className="img-container">
                  <Link to={`/produto/${produto.id}`}>
                    <img
                      src={produto.image1 || Images.produtoPadrao}
                      alt={produto.name}
                      className="produto-img"
                      onError={(e) => {
                        e.target.src = Images.produtoPadrao;
                      }}
                    />
                  </Link>

                  {produto.new && (
                    <div className="novidade-badge">
                      <img src={getImagemNovidade()} alt={t("Novidade")} />
                    </div>
                  )}
                </div>

                <h3>{produto.name}</h3>
                <p>{produto.description}</p>

                <div className="preco-cores">
                  <p className="preco">
                    R$ {produto.price ? parseFloat(produto.price).toFixed(2).replace(".", ",") : "0,00"}
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
                              border: cor.toLowerCase() === "branco" ? "1px solid #999" : "none",
                            }}
                            title={cor}
                          />
                        ))
                      ) : (
                        <div
                          className="cor-bolinha"
                          style={{
                            backgroundColor: getCorHex(produto.color),
                            border: produto.color.toLowerCase() === "branco" ? "1px solid #999" : "none",
                          }}
                          title={produto.color}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {carregando && produtos.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#dc143c',
          fontSize: '16px',
          fontWeight: 500
        }}>
          <p style={{paddingBottom: "600px"}}>{t("Carregando produtos...")}</p>
        </div>
      )}

      <Cadastro />
    </div>
  );
}