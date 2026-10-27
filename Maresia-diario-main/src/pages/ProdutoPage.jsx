import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link, useNavigate } from "react-router-dom";
import imagens from "../assets/img";
import "../assets/css/produtoPage.css";
import CatalogoRelacionado from "../components/CatalogoRelacionado";
import Cadastro from "../components/Cadastro";
import { getStoredUser } from "../utils/auth";
import { cartService } from "../services/cartService";
// do carrossel de 600px
import { useRef } from "react"; 

export default function ProdutoPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [verMais, setVerMais] = useState(false);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [corSelecionada, setCorSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // do carrossel de 600px
  const DURATION = 3000;
  const [dots, setDots] = useState([]);
  const timerRef = useRef(null);
  
  
  //  Estados para adicionar à sacola
  const [adicionandoSacola, setAdicionandoSacola] = useState(false);
  const [comprandoAgora, setComprandoAgora] = useState(false);
  const [alerta, setAlerta] = useState({ mensagem: "", tipo: "" });

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

  // FUNÇÃO DE ALERTA FORÇADO 
  const criarAlertaForcado = (mensagem, tipo) => {
    const alertasAntigos = document.querySelectorAll('.alerta-forcado-manual');
    alertasAntigos.forEach(alerta => alerta.remove());

    const alerta = document.createElement('div');
    alerta.className = 'alerta-forcado-manual';

    let bgColor = '#28a745';
    let borderColor = '#1e7e34';

    if (tipo === 'error' || tipo === 'erro') {
      bgColor = '#dc3545';
      borderColor = '#a71e2a';
    }

    alerta.style.position = 'fixed';
    alerta.style.left = '50%';
    alerta.style.top = '20px';
    alerta.style.transform = 'translateX(-50%) translateZ(0)';
    alerta.style.zIndex = '2147483647';
    alerta.style.padding = '17px 20px';
    alerta.style.borderRadius = '5px';
    alerta.style.color = '#fff';
    alerta.style.fontFamily = 'Arimo, sans-serif';
    alerta.style.minWidth = '500px';
    alerta.style.maxWidth = '90vw';
    alerta.style.backgroundColor = bgColor;
    alerta.style.borderLeft = `4px solid ${borderColor}`;
    alerta.style.textAlign = 'start';
    alerta.style.opacity = '0.97';
    alerta.style.willChange = 'transform';
    alerta.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    alerta.textContent = mensagem;
    document.body.appendChild(alerta);

    setTimeout(() => {
      if (alerta.parentNode) {
        alerta.remove();
      }
    }, 4000);

    alerta.onclick = () => alerta.remove();
  };

  
  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#cccccc";
  };

  
  const getImagemNovidade = () => {
    return i18n.language === "pt" ? imagens.simboloNovidade : imagens.TraducaoNovidade;
  };


  const formatarDataReview = (review) => {
  // Se já tiver data e hora formatadas do backend, usa elas
  if (review.data && review.hora) {
    return `${review.data} ${t("às")} ${review.hora}`;
  }
  
  // Se tiver timestamp, formata
  if (review.timestamp) {
    const data = new Date(Number(review.timestamp));
    return data.toLocaleDateString('pt-BR') + ` ${t("às")} ` + data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Se tiver dataDePublicacao, usa ela
  if (review.dataDePublicacao) {
    const data = new Date(review.dataDePublicacao);
    return data.toLocaleDateString('pt-BR') + ` ${t("às")} ` + data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return t('Data não disponível');
};

  // Função para mostrar alerta
  const mostrarAlerta = (mensagem, tipo = "success") => {
    setAlerta({ mensagem: t(mensagem), tipo });
    setTimeout(() => {
      setAlerta({ mensagem: "", tipo: "" });
    }, 3000);
  };

  // TRADUZIR CATEGORIAS
  const traduzirCategoria = (categoria) => {
    if (!categoria) return "";
    
    const catLower = categoria.toLowerCase();
    
    const categoriasTraduzidas = {
      // Categorias principais
      "biquinis": t("Biquinis"),
      "biquínis": t("Biquinis"),
      "maiôs": t("Maiôs"),
      "maios": t("Maiôs"),
      "saídas": t("Saídas"),
      "acessórios": t("Acessórios"),
      "acessorios": t("Acessórios"),
      "roupas": t("Roupas"),
      
      // Roupas específicas
      "vestidos": t("Vestidos"),
      "vestido": t("Vestidos"),
      "camisetas": t("Camisetas"),
      "camiseta": t("Camisetas"),
      "cangas": t("Cangas"),
      "canga": t("Cangas"),
      "shorts": t("Shorts"),
      "short": t("Shorts"),
      "saias": t("Saias"),
      "saia": t("Saias"),
      
      // Calçados
      "sandálias": t("Sandálias"),
      "sandalias": t("Sandálias"),
      "sandália": t("Sandálias"),
      "sandalia": t("Sandálias"),
      "chinelos": t("Chinelos"),
      "chinelo": t("Chinelos"),
      
      // Acessórios específicos
      "sombrinhas": t("Sombrinhas"),
      "sombrinha": t("Sombrinhas"),
      "bolsas": t("Bolsas"),
      "bolsa": t("Bolsas"),
      
      // Categorias em inglês 
      "bikinis": t("Biquinis"),
      "swimwear": t("Maiôs"),
      "beachwear": t("Saídas"),
      "accessories": t("Acessórios"),
      "clothing": t("Roupas"),
      "dresses": t("Vestidos"),
      "tshirts": t("Camisetas"),
      "sarongs": t("Cangas"),
      "skirts": t("Saias"),
      "footwear": t("Sandálias"),
      "flipflops": t("Chinelos"),
      "umbrellas": t("Sombrinhas"),
      "bags": t("Bolsas")
    };
    
    
    return categoriasTraduzidas[categoria] || 
           categoriasTraduzidas[catLower] || 
           categoria;
  };

  // Adicionar à sacola 
  const adicionarNaSacola = async () => {
    const usuario = getStoredUser();
    
    if (!usuario?.id) {
      criarAlertaForcado(t("Você precisa estar logado para adicionar itens à sacola"), "error");
      setTimeout(() => navigate("/cadastro"), 1500);
      return;
    }

    // DEBUG: Ver dados do produto e seleções
    console.log('🔍 DEBUG - Adicionar à sacola:', {
      produtoSize: produto.size,
      tamanhoSelecionado,
      produtoColor: produto.color,
      corSelecionada
    });

    // Validação: se produto tem múltiplos tamanhos, usuário deve selecionar
    const tamanhos = Array.isArray(produto.size) && produto.size.length > 0 
      ? produto.size.filter(t => t && t.trim() !== '') 
      : [t("Único")];
    
    console.log('📏 Tamanhos disponíveis:', tamanhos);
    
    // Só valida se tiver mais de 1 tamanho E não for "Único"
    if (tamanhos.length > 1 && !tamanhoSelecionado) {
      criarAlertaForcado(t("Por favor, selecione um tamanho"), "error");
      return;
    }

    // Validação: se produto tem cores, usuário deve selecionar (só se tiver mais de uma)
    const cores = produto.color && produto.color.trim() !== '' ? [produto.color] : [];
    console.log('🎨 Cores disponíveis:', cores);
    
    if (cores.length > 1 && !corSelecionada) {
      criarAlertaForcado(t("Por favor, selecione uma cor"), "error");
      return;
    }

    try {
      setAdicionandoSacola(true);

      const dadosParaEnviar = {
        userId: usuario.id,
        productId: produto.id,
        quantidade: 1,
        tamanho: tamanhoSelecionado === t("Único") ? null : tamanhoSelecionado,
        cor: corSelecionada
      };

      console.log('📤 Enviando para API:', dadosParaEnviar);

      await cartService.addItem(
        usuario.id,
        produto.id,
        1, // quantidade inicial
        tamanhoSelecionado === t("Único") ? null : tamanhoSelecionado,
        corSelecionada
      );

      criarAlertaForcado(t("Produto adicionado à sacola!"), "success");
      
      // Dispara evento customizado para atualizar o Header
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('❌ Erro ao adicionar à sacola:', error);
      criarAlertaForcado(error.message || t("Erro ao adicionar à sacola"), "error");
    } finally {
      setAdicionandoSacola(false);
    }
  };

  //  Comprar Agora - Adiciona na sacola e redireciona
  const comprarAgora = async () => {
    const usuario = getStoredUser();
    
    if (!usuario?.id) {
      criarAlertaForcado(t("Você precisa estar logado para comprar"), "error");
      setTimeout(() => navigate("/cadastro"), 1500);
      return;
    }

    // DEBUG: Ver dados do produto e seleções
    console.log('🚀 DEBUG - Comprar agora:', {
      produtoSize: produto.size,
      tamanhoSelecionado,
      produtoColor: produto.color,
      corSelecionada
    });

    // Validação: se produto tem múltiplos tamanhos, usuário deve selecionar
    const tamanhos = Array.isArray(produto.size) && produto.size.length > 0 
      ? produto.size.filter(t => t && t.trim() !== '') 
      : [t("Único")];
    
    console.log('📏 Tamanhos disponíveis:', tamanhos);
    
    // Só valida se tiver mais de 1 tamanho E não for "Único"
    if (tamanhos.length > 1 && !tamanhoSelecionado) {
      criarAlertaForcado(t("Por favor, selecione um tamanho"), "error");
      return;
    }

    // Validação: se produto tem cores, usuário deve selecionar (só se tiver mais de uma)
    const cores = produto.color && produto.color.trim() !== '' ? [produto.color] : [];
    console.log('🎨 Cores disponíveis:', cores);
    
    if (cores.length > 1 && !corSelecionada) {
      criarAlertaForcado(t("Por favor, selecione uma cor"), "error");
      return;
    }

    try {
      setComprandoAgora(true);

      const dadosParaEnviar = {
        userId: usuario.id,
        productId: produto.id,
        quantidade: 1,
        tamanho: tamanhoSelecionado === t("Único") ? null : tamanhoSelecionado,
        cor: corSelecionada
      };

      console.log('🚀 Comprar agora - Enviando para API:', dadosParaEnviar);

      // Adiciona o item na sacola
      await cartService.addItem(
        usuario.id,
        produto.id,
        1, // quantidade inicial
        tamanhoSelecionado === t("Único") ? null : tamanhoSelecionado,
        corSelecionada
      );

      // Dispara evento customizado para atualizar o Header
      window.dispatchEvent(new Event('cartUpdated'));
      
      // REDIRECIONA INSTANTANEAMENTE PARA A SACOLA
      console.log('🛒 Redirecionando para a sacola...');
      navigate("/sacola");
      
    } catch (error) {
      console.error('❌ Erro ao comprar agora:', error);
      criarAlertaForcado(error.message || t("Erro ao processar compra"), "error");
    } finally {
      setComprandoAgora(false);
    }
  };

  // Buscar produto do banco de dados

//   useEffect(() => {
//   window.scrollTo(0, 0);
// }, [id]);

  useEffect(() => {
    const fetchProduto = async () => {
      if (!id || isNaN(parseInt(id))) {
        navigate("/404", { replace: true });
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        const response = await fetch(`http://localhost:3000/products/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            navigate("/404", { replace: true });
            return;
          }
          throw new Error(t("Erro ao buscar produto"));
        }

        const data = await response.json();

        if (data.available === false) {
          navigate("/404", { replace: true });
          return;
        }

        console.log('📅 Reviews recebidas:', data.reviews.map(r => ({
          username: r.user.username,
          timestamp: r.timestamp,
          data: r.data,
          hora: r.hora,
          dataDePublicacao: r.dataDePublicacao
        })));

        setProduto(data);
        
        // ✅ Auto-seleciona tamanho/cor
        let tamanhosValidos = [];
        if (Array.isArray(data.size) && data.size.length > 0) {
          tamanhosValidos = data.size.filter(t => t && t.trim() !== '');
        } else if (typeof data.size === 'string' && data.size.trim() !== '') {
          tamanhosValidos = [data.size];
        }
        
        // Se não tem tamanhos ou só tem "Único", deixa null
        if (tamanhosValidos.length === 0) {
          setTamanhoSelecionado(null);
        } else if (tamanhosValidos.length === 1) {
          setTamanhoSelecionado(tamanhosValidos[0]);
        } else {
          setTamanhoSelecionado(null);
        }
        
        // Auto-seleciona cor se houver apenas uma
        const cores = data.color && data.color.trim() !== '' ? [data.color] : [];
        if (cores.length === 1) {
          setCorSelecionada(cores[0]);
        } else {
          setCorSelecionada(null);
        }
        
        setImagemAtiva(0);
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        setErro(t("Erro ao carregar produto"));
      } finally {
        setCarregando(false);
      }
    };

    fetchProduto();
  }, [id, navigate, t]);

  // mudança aqui
  useEffect(() => {
  if (carregando) return;

  const voltarAoTopo = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(voltarAoTopo);
  });
}, [id, carregando]);

  // USEEFFECT DO CARROSSEL 600
  useEffect(() => {
  if (window.innerWidth > 600) return;
  if (!produto?.images) return;

  if (!imagensProduto.length) return;

  if (timerRef.current) clearTimeout(timerRef.current);

  timerRef.current = setTimeout(() => {
    setImagemAtiva((prev) => (prev + 1) % imagensProduto.length);
  }, DURATION);

  return () => clearTimeout(timerRef.current);
}, [imagemAtiva, produto]);
// FIM DO USEEFFECT DO CARROSSEL 600
 

  if (carregando) {
    return (
      <div className="loading-container">
        <p style={{paddingBottom: "600px"}}>{t("Carregando produto...")}</p>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div className="error-container">
        <p>{erro || t("Produto não encontrado")}</p>
      </div>
    );
  }

  const imagensProduto = [
    produto.images.image1,
    produto.images.image2,
    produto.images.image3,
    produto.images.image4,
    produto.images.image5,
  ].filter(Boolean);
  


  const nextImage = () => {
    setImagemAtiva((prev) => (prev + 1) % imagensProduto.length);
  };

  const prevImage = () => {
    setImagemAtiva((prev) => (prev - 1 + imagensProduto.length) % imagensProduto.length);
  };

  

  const notaMedia = produto.reviewStats.averageStars;
  const comentarios = produto.reviews || [];

  let tamanhos = [];
  
  if (Array.isArray(produto.size) && produto.size.length > 0) {
    const tamanhosValidos = produto.size.filter(t => t && t.trim() !== '');
    
    if (tamanhosValidos.length > 0) {
      tamanhos = tamanhosValidos;
    } else {
      tamanhos = [t("Único")];
    }
  } else if (typeof produto.size === 'string' && produto.size.trim() !== '') {
    tamanhos = [produto.size];
  } else {
    tamanhos = [t("Único")];
  }
  
  const cores = produto.color && produto.color.trim() !== '' ? [produto.color] : [];

  return (
    <div className="product-page">
      <div className="productcontainer">
        <div className="product-images">
          <div className="product-thumbs">
            {imagensProduto.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${produto.name} ${index + 1}`}
                className={`thumb ${index === imagemAtiva ? "active" : ""}`}
                onClick={() => setImagemAtiva(index)}
              />
            ))}
          </div>

          {/* maining antigo */}
          <div className="mainimg">
            <img
              id="displayimg"
              src={imagensProduto[imagemAtiva]}
              alt={produto.name}
            />

            {produto.new && (
              <img
                src={getImagemNovidade()}
                alt={t("Novidade")}
                className="novidade"
              />
            )}

            <button className="arrow left" onClick={prevImage}>
              <img src={imagens["setaBaixo"]} alt={t("Anterior")} />
            </button>

            <button className="arrow right" onClick={nextImage}>
              <img src={imagens["setaBaixo"]} alt={t("Próxima")} />
            </button>

            {/* do carrossel de 600px */}
            <div className="dots-container">
                {imagensProduto.map((_, index) => (
            <div
                key={index}
                className={`dot ${index === imagemAtiva ? "active" : ""}`}
                onClick={() => setImagemAtiva(index)}
  />
  ))}
            </div>
          </div>

          
        </div>

        <div className="product-info">
          <div className="breadcrumb">
            <Link to="/">{t("início")}</Link> <span>-</span>{" "}
            <Link
              to={`/catalogo?categoria=${produto.category?.toLowerCase()}`}
            >
              {traduzirCategoria(produto.category)}
            </Link>
          </div>

          <h1 className="product-title">{produto.name}</h1>

          <p className="price">
            R$ {parseFloat(produto.price).toFixed(2).replace(".", ",")}
          </p>
          <p className="installments">
            {t("ou 3x de")} R$ {(parseFloat(produto.price) / 3).toFixed(2).replace(".", ",")} {t("sem juros")}
          </p>

          <p className="description">
            {produto.detailedDescription || produto.description}
          </p>

          <div className="options">
            <div className="sizes">
              <h3>{t("Tamanhos")}</h3>
              {tamanhos.length === 1 && tamanhos[0] === t("Único") ? (
                <p className="tamanho-unico">{t("Tamanho único")}</p>
              ) : (
                <div className="size-buttons">
                  {tamanhos.map((tam, i) => (
                    <button
                      key={i}
                      className={`size-btn ${tamanhoSelecionado === tam ? "active" : ""}`}
                      onClick={() => setTamanhoSelecionado(tam)}
                    >
                      {tam}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {cores.length > 0 && (
              <div className="colors">
                <h3>{t("Cores")}</h3>
                <div className="color-options">
                  {cores.map((cor, i) => (
                    <div
                      key={i}
                      className={`color-btn ${corSelecionada === cor ? "active" : ""}`}
                      style={{
                        backgroundColor: getCorHex(cor),
                        border: cor.toLowerCase() === "branco" ? "1px solid #999" : "none",
                      }}
                      onClick={() => setCorSelecionada(cor)}
                      title={cor}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <div className="buttons">
            {/* BOTÃO "COMPRAR AGORA" ATUALIZADO */}
            <button 
              className="buy-btn" 
              onClick={comprarAgora}
              disabled={comprandoAgora}
            >
              {comprandoAgora ? t("Processando...") : t("Comprar agora")}
            </button>
            
            <button 
              className="cart-btn" 
              onClick={adicionarNaSacola}
              disabled={adicionandoSacola}
            >
              {adicionandoSacola ? t("Adicionando...") : t("Adicionar na sacola")}
            </button>
          </div>

          </div>

          
        </div>
      </div>

      <section className="avaliacoes-section">
        <h2>{t("avaliações")}</h2>
        <div className="avaliacoes-media">
          <h3>{notaMedia}</h3>
          <p>{"★".repeat(Math.round(notaMedia))}</p>
          <p>{t("Total de avaliações:")} {produto.reviewStats.total}</p>
        </div>

        {comentarios.length > 0 ? (
          <>
            <div className="avaliacoes-lista">
              {(verMais ? comentarios : comentarios.slice(0, 2)).map((c) => (
                <div key={c.id} className="avaliacao">
                  <div className="avaliacao-header">
                    <h4>@{c.user.username}</h4>
                    {/* Exibe a data formatada ao lado do username */}
                    <span className="data-avaliacao">
                      {formatarDataReview(c)}
                    </span>
                  </div>
                  <p className="estrelas">{"★".repeat(c.estrelas)}</p>
                  <p className="texto">{c.comentario}</p>
                </div>
              ))}
            </div>

            {comentarios.length > 2 && (
              <button className="vermais-btn" onClick={() => setVerMais(!verMais)}>
                <img
                  src={imagens["setaBaixo"]}
                  alt={t("Ver mais")}
                  className={verMais ? "seta-ativa" : ""}
                />
              </button>
            )}
          </>
        ) : (
          <p className="sem-avaliacoes">
            {t("Ainda não há avaliações para este produto.")}
          </p>
        )}
      </section>

      <section className="mais-produtos">
        <h2>{t("Veja produtos semelhantes")}</h2>
        <CatalogoRelacionado produtoAtualId={produto.id} />
      </section>

      <Cadastro />

      {/* Alerta */}
      {alerta.mensagem && (
        <div className={`alerta ${alerta.tipo}`}>
          {alerta.mensagem}
        </div>
      )}
    </div>
  );
}