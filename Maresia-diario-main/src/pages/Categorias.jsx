import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../assets/css/catalogoPage.css";
import Images from "../assets/img";

export default function Categorias() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState("novidades");

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setCarregando(true);
        const res = await fetch("http://localhost:3000/products?page=1&limit=100");
        if (!res.ok) throw new Error("Erro ao buscar produtos");
        const data = await res.json();
        setProdutos(data.data || []);
      } catch (e) {
        console.error(e);
        setProdutos([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchProdutos();
  }, []);

  const produtoEhDaCategoria = (produto, categoria) => {
    const termo = categoria.toLowerCase();
    const categoriaProduto = String(produto?.category ?? produto?.categoria ?? "").toLowerCase();
    const nomeProduto = String(produto?.name ?? "").toLowerCase();
    const descricaoProduto = String(produto?.description ?? "").toLowerCase();

    return (
      categoriaProduto.includes(termo) ||
      nomeProduto.includes(termo) ||
      descricaoProduto.includes(termo)
    );
  };

  const produtosFiltrados = useMemo(() => {
    if (selecionado === "novidades") {
      return produtos.filter(p => p?.new === true || p?.new === "true" || p?.new === 1);
    }
    if (selecionado === "biquini") return produtos.filter(p => produtoEhDaCategoria(p, "biquini"));
    if (selecionado === "vestido") return produtos.filter(p => produtoEhDaCategoria(p, "vestido"));
    if (selecionado === "maio") return produtos.filter(p => produtoEhDaCategoria(p, "maio") || produtoEhDaCategoria(p, "maiô"));
    return produtos;
  }, [produtos, selecionado]);

  return (
    <div className="catalogo-page categorias-page">
      <div style={{ padding: '18px 20px' }}>
        <div className="categorias-topo-nova" style={{ display: 'flex', gap: 12, marginBottom: 18, justifyContent: 'flex-start', alignItems: 'center' }}>
          <a href="#" onClick={(e)=>{e.preventDefault(); setSelecionado('novidades')}} className={`texto-categoria-nova ${selecionado === 'novidades' ? 'ativo' : ''}`}>Novidades</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setSelecionado('biquini')}} className={`texto-categoria-nova ${selecionado === 'biquini' ? 'ativo' : ''}`}>Biquíni</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setSelecionado('vestido')}} className={`texto-categoria-nova ${selecionado === 'vestido' ? 'ativo' : ''}`}>Vestido</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setSelecionado('maio')}} className={`texto-categoria-nova ${selecionado === 'maio' ? 'ativo' : ''}`}>Maiô</a>
        </div>

        {carregando ? (
          <p>Carregando produtos...</p>
        ) : (
          <div className="produtos">
            {produtosFiltrados.map((produto, idx) => (
              <div className="produto-card" key={produto.id || idx}>
                <div className="img-container">
                  <Link to={`/produto/${produto.id}`}>
                    <img src={produto.image1 || Images.produtoPadrao} alt={produto.name} onError={(e)=>e.target.src=Images.produtoPadrao} />
                  </Link>
                  {produto.new && (
                    <div className="novidade-badge">
                      <img src={Images.simboloNovidade} alt="Novidade" />
                    </div>
                  )}
                </div>

                <h3>{produto.name}</h3>
                <p>{produto.description}</p>
                <div className="preco-cores">
                  <p className="preco">R$ {produto.price ? parseFloat(produto.price).toFixed(2).replace('.', ',') : '0,00'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
