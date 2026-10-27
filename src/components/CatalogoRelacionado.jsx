import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "../assets/css/catalogoRelacionado.css";
import Images from "../assets/img";

export default function CatalogoRelacionado({ produtoAtualId }) {
  const { t, i18n } = useTranslation();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const LIMIT = 12; // Apenas 12 produtos

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

  // Função para obter o código hex da cor
  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#cccccc"; // Fallback para cinza
  };

  // Função para obter a imagem de novidade baseada no idioma
  const getImagemNovidade = () => {
    return i18n.language === "pt" ? Images.simboloNovidade : Images.TraducaoNovidade;
  };

  // Buscar produtos do backend
  const fetchProdutos = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:3000/products?page=1&limit=${LIMIT + 5}` // +5 para ter margem após filtrar
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar produtos");
      }

      const data = await response.json();

      console.log('🔍 Produto atual ID:', produtoAtualId);
      console.log('📦 Todos os produtos:', data.data.map(p => ({ 
        id: p.id, 
        name: p.name,
        color: p.color 
      })));

      // Filtrar o produto atual para não aparecer
      const produtosFiltrados = data.data
        .filter((produto) => {
          const isDiferente = produto.id !== parseInt(produtoAtualId);
          console.log(`Produto ${produto.id} (${produto.name}): ${isDiferente ? '✅ Incluir' : '❌ Filtrar'}`);
          return isDiferente;
        })
        .slice(0, LIMIT); // Garantir apenas 12 produtos

      console.log('✅ Produtos filtrados:', produtosFiltrados.length);

      setProdutos(produtosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega produtos ao montar componente ou quando o produtoAtualId mudar
  useEffect(() => {
    fetchProdutos();
  }, [produtoAtualId]);

  if (loading) {
    return <p>{t("Carregando produtos...")}</p>;
  }

  return (
    <section className="catalogo-relacionado-section">
      <div className="catalogo-relacionado-container">
        <div className="produtos-relacionados">
          {produtos.map((produto) => (
            <div key={produto.id} className="produto-card-relacionado">
              <div className="img-container-relacionado">
                <Link to={`/produto/${produto.id}`}>
                  <img
                    src={
                      produto.image1 ||
                      produto.collection?.image ||
                      "/imagem-padrao.png"
                    }
                    alt={produto.name}
                  />
                </Link>

                {produto.new && (
                  <div className="novidade-badge-relacionado">
                    {/* Imagem dinâmica baseada no idioma */}
                    <img src={getImagemNovidade()} alt={t("Novidade")} />
                  </div>
                )}
              </div>

              <h3>{produto.name}</h3>
              <p id="mais-produto-descricao">{produto.description}</p>

              <div className="preco-cores-relacionado">
                <p style={{ fontWeight: "bold" }}>
                  R$ {Number(produto.price).toFixed(2).replace(".", ",")}
                </p>

                {/* CORREÇÃO DAS CORES */}
                {produto.color && (
                  <div className="cores-relacionado">
                    <div
                      className="cor-bolinha-relacionado"
                      style={{
                        backgroundColor: getCorHex(produto.color),
                        border: produto.color.toLowerCase() === "branco" ? "1px solid #999" : "none",
                      }}
                      title={produto.color}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}