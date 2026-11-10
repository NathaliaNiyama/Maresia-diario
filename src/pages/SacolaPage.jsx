import Alert from "../components/alerta";
import { useState, useEffect } from "react";
import "../assets/css/sacola.css";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../utils/auth";
import { cartService } from "../services/cartService";
import { useTranslation } from "react-i18next";
import Images from "../assets/img";

const API_URL = "http://localhost:3000";

// 🎨 PALETA DE CORES
const paletaDeCores = {
  Coral: "#dc143c",
  Canela: "#992e04",
  Vinho: "#720c2e",
  Laranja: "#ffa500",
  Narciso: "#ffff00",
  Lima: "#32cd32",
  Musgo: "#006400",
  Piscina: "#0c6f72",
  Azul: "#00bfff",
  Marine: "#191970",
  Roxo: "#4B0082",
  Lilás: "#9370DB",
  Rosa: "#ff69b4",
  Bege: "#f5f5dc",
  Marrom: "#392620",
  Cinza: "#696969",
  Preto: "#000000",
  Branco: "#ffffff",
};

export default function Sacola() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [userId, setUserId] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [selecionados, setSelecionados] = useState({});

  const criarAlertaForcado = (mensagem, tipo) => {
    const alerta = document.createElement("div");
    alerta.className = "alerta-forcado-manual";
    alerta.textContent = mensagem;
    alerta.style.cssText = `
      position:fixed; top:20px; left:50%;
      transform:translateX(-50%);
      background:${tipo === "error" ? "#dc3545" : "#28a745"};
      color:#fff; padding:15px; z-index:9999;
      border-radius:5px;
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 4000);
  };

  // ================= USER =================
  useEffect(() => {
    const user = getStoredUser();

    if (user?.id) {
      setUserId(user.id);
    } else {
      navigate("/cadastro");
    }
  }, [navigate]);

  // ================= PRODUTOS =================
  useEffect(() => {

    const todosSelecionados =
      produtos.length > 0 &&
      produtos.every((p) => selecionados[p.cartItemId]);

    const selecionarTodos = (e) => {
      const marcado = e.target.checked;

      const novosSelecionados = {};

      produtos.forEach((produto) => {
        novosSelecionados[produto.cartItemId] = marcado;
      });

      setSelecionados(novosSelecionados);
    };
    if (!userId) return;

    const itensSalvos = localStorage.getItem("checkoutItems");

    if (itensSalvos) {
      const itensParsed = JSON.parse(itensSalvos);

      const produtosFormatados = itensParsed.map((item) => ({
        id: Number(item.id),
        cartItemId: Number(item.id),
        nome: item.nome,
        preco: Number(item.preco),
        quantidade: Number(item.qtd),
        img: item.img,
        tamanho: item.medida,
        cor: item.cor,
      }));

      setProdutos(produtosFormatados);

      const selecionadosIniciais = {};

      produtosFormatados.forEach((item) => {
        selecionadosIniciais[item.cartItemId] = true;
      });

      setSelecionados(selecionadosIniciais);

    } else {
      carregarProdutos();
    }
  }, [userId]);

  const carregarProdutos = async () => {
    try {
      setCarregandoProdutos(true);

      const data = await cartService.getCart(userId);

      const produtosFormatados = data.items.map((item) => ({
        id: Number(item.id),
        cartItemId: Number(item.id),
        nome: item.product.name,
        preco: Number(item.product.price),
        quantidade: Number(item.quantidade),
        img: item.product.image1,
        descricao: item.product.description,
        tamanho: item.tamanho,
        cor: item.cor,
      }));

      setProdutos(produtosFormatados);

      const selecionadosIniciais = {};

      produtosFormatados.forEach((item) => {
        selecionadosIniciais[item.cartItemId] = true;
      });

      setSelecionados(selecionadosIniciais);

    } catch (error) {
      console.log(error);
      criarAlertaForcado("Erro ao carregar produtos", "error");
    } finally {
      setCarregandoProdutos(false);
    }
  };

  // ================= ALTERAR QUANTIDADE =================
  const alterarQuantidade = async (id, delta) => {
    const produto = produtos.find((p) => p.cartItemId === Number(id));

    if (!produto) return;

    const novaQuantidade = Number(produto.quantidade) + delta;

    try {
      // REMOVE ITEM
      if (novaQuantidade < 1) {
        await cartService.removeItem(Number(id));

        setProdutos((prev) =>
          prev.filter((p) => p.cartItemId !== Number(id))
        );

        // Atualiza localStorage
        const itensSalvos = localStorage.getItem("checkoutItems");

        if (itensSalvos) {
          const itensAtualizados = JSON.parse(itensSalvos).filter(
            (i) => Number(i.id) !== Number(id)
          );

          localStorage.setItem(
            "checkoutItems",
            JSON.stringify(itensAtualizados)
          );
        }

        // Remove dos selecionados
        setSelecionados((prev) => {
          const novo = { ...prev };
          delete novo[id];
          return novo;
        });

        window.dispatchEvent(new Event("cartUpdated"));

        criarAlertaForcado("Item removido com sucesso!", "success");

        return;
      }

      // UPDATE QUANTIDADE
      await cartService.updateQuantity(Number(id), novaQuantidade);

      setProdutos((prev) =>
        prev.map((p) =>
          p.cartItemId === Number(id)
            ? { ...p, quantidade: novaQuantidade }
            : p
        )
      );

      // Atualiza localStorage
      const itensSalvos = localStorage.getItem("checkoutItems");

      if (itensSalvos) {
        const itensAtualizados = JSON.parse(itensSalvos).map((i) =>
          Number(i.id) === Number(id)
            ? { ...i, qtd: novaQuantidade }
            : i
        );

        localStorage.setItem(
          "checkoutItems",
          JSON.stringify(itensAtualizados)
        );
      }

      window.dispatchEvent(new Event("cartUpdated"));

    } catch (error) {
      console.log(error);
      criarAlertaForcado("Erro ao atualizar item", "error");
    }
  };

  // ================= EXCLUIR SELECIONADOS =================
  const excluirSelecionados = async () => {
    const idsParaExcluir = Object.keys(selecionados)
      .filter((id) => selecionados[id] === true)
      .map(Number);

    if (idsParaExcluir.length === 0) {
      criarAlertaForcado(
        "Selecione pelo menos um item para excluir",
        "error"
      );
      return;
    }

    try {
      // Exclui no backend
      for (const id of idsParaExcluir) {
        await cartService.removeItem(Number(id));
      }

      // Remove da tela
      setProdutos((prev) =>
        prev.filter(
          (p) => !idsParaExcluir.includes(Number(p.cartItemId))
        )
      );

      // Atualiza localStorage
      const itensSalvos = localStorage.getItem("checkoutItems");

      if (itensSalvos) {
        const itensAtualizados = JSON.parse(itensSalvos).filter(
          (i) => !idsParaExcluir.includes(Number(i.id))
        );

        localStorage.setItem(
          "checkoutItems",
          JSON.stringify(itensAtualizados)
        );
      }

      // Remove dos selecionados
      setSelecionados((prev) => {
        const novo = { ...prev };

        idsParaExcluir.forEach((id) => {
          delete novo[id];
        });

        return novo;
      });

      window.dispatchEvent(new Event("cartUpdated"));

      criarAlertaForcado(
        "Itens excluídos com sucesso!",
        "success"
      );

    } catch (error) {
      console.log(error);
      criarAlertaForcado("Erro ao excluir itens", "error");
    }
  };

  // ================= CONTINUAR =================
  const handleContinuar = () => {
    const itensSelecionados = produtos.filter(
      (p) => selecionados[p.cartItemId]
    );

    if (itensSelecionados.length === 0) {
      criarAlertaForcado(
        "Selecione pelo menos um item para continuar",
        "error"
      );
      return;
    }

    localStorage.setItem(
      "checkoutSelecionados",
      JSON.stringify(itensSelecionados)
    );

    navigate("/checkout");
  };

  // ================= TOTAIS =================
  const itensSelecionados = produtos.filter(
    (p) => selecionados[p.cartItemId]
  );



  const totalItens = itensSelecionados.length;

  const valorTotal = itensSelecionados.reduce(
    (total, p) => total + p.preco * p.quantidade,
    0
  );

  const todosSelecionados =
    produtos.length > 0 &&
    produtos.every((p) => selecionados[p.cartItemId]);

  const selecionarTodos = (e) => {
    const marcado = e.target.checked;

    const novosSelecionados = {};

    produtos.forEach((produto) => {
      novosSelecionados[produto.cartItemId] = marcado;
    });

    setSelecionados(novosSelecionados);
  };

  // ================= COR HEX =================
  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#ccc";
  };

  return (
    <div className="container-sacola">

      {carregandoProdutos ? (
        <p>{t("Carregando...")}</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th id="produto-title">{t("Produto")}</th>
                <th>{t("quantidade")}</th>
                <th>{t("Preço")}</th>
                <th>{t("Ações")}</th>
              </tr>
            </thead>

            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>

                  {/* PRODUTO */}
                  <td>
                    <div className="produto-info">
                      <img src={p.img} alt={p.nome} />

                      <div className="description">
                        <h1>{p.nome}</h1>

                        <div className="variacoes">
                          {p.tamanho && (
                            <div className="size-buttons">
                              <button className="size-btn sacola-size">
                                {p.tamanho}
                              </button>
                            </div>
                          )}

                          {p.cor && (
                            <div className="color-options">
                              <div
                                className="color-btn"
                                style={{
                                  backgroundColor: getCorHex(p.cor),
                                  border:
                                    p.cor.toLowerCase() === "branco"
                                      ? "1px solid #999"
                                      : "none",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* QUANTIDADE */}
                  <td>
                    <div className="quantidade">
                      <button
                        onClick={() => alterarQuantidade(p.cartItemId, -1)}
                      >
                        -
                      </button>

                      <span>{p.quantidade}</span>

                      <button
                        onClick={() => alterarQuantidade(p.cartItemId, 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* PREÇO */}
                  <td>
                    <span className="preco-produto">
                      R$ {p.preco.toFixed(2).replace(".", ",")}
                    </span>
                  </td>

                  {/* AÇÕES */}
                  <td className="acoes-sacola">
                    <input
                      type="checkbox"
                      checked={!!selecionados[p.cartItemId]}
                      onChange={() =>
                        setSelecionados((prev) => ({
                          ...prev,
                          [p.cartItemId]: !prev[p.cartItemId],
                        }))
                      }
                      className="checkbox-sacola"
                    />

                    <button
                      type="button"
                      className="excluir-sacola"
                      onClick={() => {
                        setSelecionados((prev) => ({
                          ...prev,
                          [p.cartItemId]: true,
                        }));
                      }}
                    >
                      Excluir
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* RESUMO */}
          {/* RESUMO */}
          <div className="resumo-sacola">
            <div className="resumo-sacola-esquerda">
              <input
                type="checkbox"
                checked={todosSelecionados}
                onChange={selecionarTodos}
              />

              <span className="selecionar">
                Selecionar tudo
              </span>

              <button
                className="btn-excluir-selecionados"
                onClick={excluirSelecionados}
              >
                Excluir
              </button>
            </div>

            <div className="resumo-sacola-direita">
              <div className="valor-total-sacola">
                <span className="texto-total-sacola">
                  Total ({totalItens} {totalItens === 1 ? "item" : "itens"}):
                </span>

                <strong className="preco-total-sacola">
                  R$ {valorTotal.toFixed(2)}
                </strong>
              </div>
              <button
                className="btn-continuar"
                onClick={handleContinuar}
              >
                Continuar
              </button>
            </div>
          </div>


          {/* ALERT */}
          <div id="alert-container">
            {alerta && (
              <Alert
                type={alerta.tipo}
                message={alerta.mensagem}
                onClose={() => setAlerta(null)}
              />
            )}
          </div>

        </>
      )}
    </div>
  );
}