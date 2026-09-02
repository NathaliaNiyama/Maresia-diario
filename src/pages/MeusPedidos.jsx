import Alert from "../components/alerta";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import { useState, useEffect } from "react";
import "../assets/css/MeusPedidos.css";
import Images from "../assets/img";
import Caminhao from "../assets/img/caminhao.png";

export default function MeusPedidos() {

    const navigate = useNavigate();

    const [pedidos, setPedidos] = useState([]);
    const [aberto, setAberto] = useState({});
    const [aba, setAba] = useState("preparando");

    const [avaliacoes, setAvaliacoes] = useState({});
    const [avaliacaoAberta, setAvaliacaoAberta] = useState({});

    const [alerta, setAlerta] = useState(null);

    const [reembolsoAberto, setReembolsoAberto] = useState({});
    const [motivosReembolso, setMotivosReembolso] = useState({});

    const handleSair = async () => {
        await logout();
        navigate("/");
    };

    // =========================
    // CARREGAR PEDIDOS
    // =========================
    useEffect(() => {

        const pedidosSalvos =
            JSON.parse(sessionStorage.getItem("pedidos")) || [];

        let pedidosSeparados = [];

        pedidosSalvos.forEach((pedido) => {

            if (pedido.itens && pedido.itens.length > 0) {

                pedido.itens.forEach((item) => {

                    pedidosSeparados.push({
                        ...pedido,

                        itemIndividual: item,

                        id:
                            pedido.id +
                            "-" +
                            item.id,

                        etapaAtual:
                            pedido.etapaAtual ?? 0,

                        reembolso:
                            pedido.reembolso ?? null,

                        motivoReembolso:
                            pedido.motivoReembolso ?? "",

                        cancelado:
                            pedido.cancelado ?? false
                    });

                });

            } else {

                pedidosSeparados.push({
                    ...pedido,

                    itemIndividual: pedido,

                    id: pedido.id,

                    etapaAtual:
                        pedido.etapaAtual ?? 0,

                    reembolso:
                        pedido.reembolso ?? null,

                    motivoReembolso:
                        pedido.motivoReembolso ?? "",

                    cancelado:
                        pedido.cancelado ?? false
                });

            }

        });

        setPedidos(pedidosSeparados);

    }, []);

    // =========================
    // SALVAR
    // =========================
    const salvarPedidos = (lista) => {

        setPedidos(lista);

    };

    // =========================
    // ABRIR / FECHAR
    // =========================
    const togglePedido = (id) => {

        setAberto((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));

    };

    // =========================
    // ATUALIZAR ETAPA
    // =========================
    const atualizarEtapa = (pedidoId, etapa) => {
        const novosPedidos = pedidos.map((pedido) => {
            if (pedido.id === pedidoId) {
                return {
                    ...pedido,
                    etapaAtual: etapa
                };
            }

            return pedido;
        });

        setPedidos(novosPedidos);

        sessionStorage.setItem(
            "pedidos",
            JSON.stringify(novosPedidos)
        );
    };

    // =========================
    // IMAGEM
    // =========================
    const getImagemProduto = (item) => {

        if (!item) return Images.SemImagem;

        return (
            item.image1 ||
            item.img ||
            item.imagem ||
            item.images?.image1 ||
            item.product?.image1 ||
            Images.SemImagem
        );

    };

    // =========================
    // CANCELAR PEDIDO
    // =========================
    const cancelarPedido = (pedidoId) => {

        console.log("PEDIDO CANCELADO:", pedidoId);

        const novosPedidos = pedidos.map((p) =>

            p.id === pedidoId
                ? {
                    ...p,
                    cancelado: true
                }
                : p

        );

        salvarPedidos(novosPedidos);

        setAlerta({
            type: "sucesso",
            message: "Pedido cancelado!"
        });

    };

    // =========================
    // REEMBOLSO
    // =========================
    const solicitarReembolso = (pedidoId) => {

        const motivo = motivosReembolso[pedidoId];

        if (!motivo) {

            setAlerta({
                type: "erro",
                message: "Digite o motivo do reembolso"
            });

            return;
        }

        console.log("REEMBOLSO:", {
            pedidoId,
            motivo
        });

        const novosPedidos = pedidos.map((p) =>

            p.id === pedidoId
                ? {
                    ...p,
                    reembolso: "Em análise",
                    motivoReembolso: motivo
                }
                : p

        );

        salvarPedidos(novosPedidos);

        setReembolsoAberto((prev) => ({
            ...prev,
            [pedidoId]: false
        }));

        setAlerta({
            type: "sucesso",
            message: "Reembolso solicitado!"
        });

    };

    // =========================
    // AVALIAÇÃO
    // =========================
    const enviarAvaliacao = (pedidoId, item) => {

        const avaliacao = avaliacoes[pedidoId];

        if (!avaliacao?.estrelas) {

            setAlerta({
                type: "erro",
                message: "Selecione as estrelas"
            });

            return;
        }

        const lista =
            JSON.parse(
                sessionStorage.getItem(
                    "avaliacoesProdutos"
                )
            ) || [];

        lista.push({
            id: Date.now(),

            productId: Number(item?.id),

            comentario:
                avaliacao.comentario || "",

            estrelas: avaliacao.estrelas
        });

        sessionStorage.setItem(
            "avaliacoesProdutos",
            JSON.stringify(lista)
        );

        setAvaliacaoAberta((prev) => ({
            ...prev,
            [pedidoId]: false
        }));

        setAlerta({
            type: "sucesso",
            message: "Avaliação enviada!"
        });

    };

    // =========================
    // FILTRO DAS ABAS
    // =========================
    const pedidosFiltrados = pedidos.filter((p) => {

        switch (aba) {

            case "preparando":
                return (
                    p.etapaAtual < 3 &&
                    !p.reembolso &&
                    !p.cancelado
                );

            case "caminho":
                return (
                    p.etapaAtual < 3 &&
                    !p.reembolso &&
                    !p.cancelado
                );

            case "finalizado":
                return (
                    p.etapaAtual === 3 &&
                    !p.reembolso &&
                    !p.cancelado
                );

            case "reembolso":
                return (
                    p.reembolso === "Em análise"
                );

            case "cancelado":
                return p.cancelado;

            default:
                return true;

        }

    });

    return (
        <div className="pagina">

            <Sidebar onLogout={handleSair} />

            <section className="conteudo">

                {alerta && (
                    <Alert
                        type={alerta.type}
                        message={alerta.message}
                        onClose={() => setAlerta(null)}
                    />
                )}

                <h1>Meus pedidos</h1>

                {/* ABAS */}
                <div className="abas">
                    <span onClick={() => setAba("preparando")}>Preparando</span>
                    <span onClick={() => setAba("caminho")}>A caminho</span>
                    <span onClick={() => setAba("finalizado")}>Finalizado</span>
                    <span onClick={() => setAba("cancelado")}>Cancelado</span>
                    <span onClick={() => setAba("reembolso")}>Reembolso</span>
                </div>

                {/* SEM PEDIDOS */}
                {pedidosFiltrados.length === 0 ? (
                    <p>Nenhum pedido encontrado.</p>
                ) : (
                    pedidosFiltrados.map((pedido) => (
                        <div
                            key={pedido.id}
                            className="pedido"
                            style={{
                                background: "#e7e7e7",
                                marginBottom: "20px",
                                overflow: "hidden"
                            }}
                        >

                            {/* HEADER */}
                            <div
                                className="pedido-header"
                                style={{
                                    background: "#7a7a7a",
                                    padding: "7px 15px",
                                    color: "#fff",
                                    fontSize: "13px",
                                    letterSpacing: "2px"
                                }}
                            >
                                {aba === "finalizado"
                                    ? `Pedido #${pedido.codigo} Entregue`
                                    : `Pedido #${pedido.codigo}`
                                }
                            </div>

                            {/* BODY */}
                            <div className="pedido-body" style={{ padding: "20px" }}>

                                {/* PRODUTO */}

                                {/* RASTREAMENTO - A CAMINHO */}
                                {aba === "caminho" && (
                                    <div className="rastreamento-container">

                                        <div className="timeline-container">

                                            <div
                                                className={`linha-progresso etapa-${pedido.etapaAtual}`}
                                            ></div>

                                            {[
                                                "Fábrica",
                                                "Estrada",
                                                "Centro Logístico",
                                                "Entrega"
                                            ].map((etapa, index) => (
                                                <div
                                                    key={index}
                                                    className="status-item"
                                                    onClick={() => {
                                                        if (index === pedido.etapaAtual + 1) {
                                                            atualizarEtapa(
                                                                pedido.id,
                                                                index
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <div
                                                        className={`bola ${pedido.etapaAtual >= index
                                                            ? "ativa"
                                                            : ""
                                                            }`}
                                                    ></div>

                                                    <p>{etapa}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* caminhão + mensagem */}
                                        <div className="mensagem-entrega">
                                            <img
                                                src={Caminhao}
                                                alt="Caminhão"
                                                className="img-caminhao"
                                            />

                                            <p>Seu pedido está a caminho!</p>
                                        </div>
                                    </div>
                                )}

                                {/* STATUS REEMBOLSO */}
                                {aba === "reembolso" && (
                                    <div className="status-reembolso">

                                        <div className="status-topo">
                                            <span>Pedido de reembolso</span>
                                            <span className="status-analise">
                                                EM ANÁLISE
                                            </span>
                                        </div>

                                        <div className="mensagem-reembolso">
                                            Seu pedido de reembolso está sendo analisado.
                                            Assim que finalizar, você será informado.
                                        </div>

                                    </div>
                                )}
                                <div className="item">
                                    <div className="produto-info">

                                        <img
                                            src={getImagemProduto(pedido.itemIndividual)}
                                            style={{
                                                width: "120px",
                                                height: "160px",
                                                objectFit: "cover"
                                            }}
                                        />

                                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                            <span>{pedido.itemIndividual?.nome}</span>
                                            <span>Quantidade: {pedido.itemIndividual?.quantidade}</span>
                                            <span>R$ {Number(pedido.itemIndividual?.preco).toFixed(2)}</span>
                                        </div>

                                    </div>
                                </div>

                                {/* TOTAL */}
                                <div className="total">
                                    Total: R$
                                    {Number(
                                        pedido.itemIndividual?.preco *
                                        pedido.itemIndividual?.quantidade
                                    ).toFixed(2)}
                                </div>

                                {/* AÇÕES */}
                                <div className="acoes-pedido">

                                    {aba === "preparando" && (
                                        <button
                                            className="botao-acao"
                                            onClick={() => cancelarPedido(pedido.id)}
                                        >
                                            Cancelar pedido
                                        </button>
                                    )}

                                    {aba === "finalizado" && (
                                        <>
                                            <button
                                                className="botao-acao"
                                                onClick={() =>
                                                    setAvaliacaoAberta((prev) => ({
                                                        ...prev,
                                                        [pedido.id]: !prev[pedido.id]
                                                    }))
                                                }
                                            >
                                                Avaliar pedido
                                            </button>

                                            <button
                                                className="botao-acao"
                                                onClick={() =>
                                                    setReembolsoAberto((prev) => ({
                                                        ...prev,
                                                        [pedido.id]: !prev[pedido.id]
                                                    }))
                                                }
                                            >
                                                Pedir reembolso
                                            </button>
                                        </>
                                    )}
                                </div>


                                {/* BLOCO AVALIAÇÃO */}
                                {avaliacaoAberta[pedido.id] && (
                                    <div className="avaliacao-box">

                                        <h2>Avalie sua experiência conosco!</h2>

                                        <textarea
                                            placeholder="Detalhe sua avaliação"
                                            className="textarea-avaliacao"
                                            onChange={(e) =>
                                                setAvaliacoes((prev) => ({
                                                    ...prev,
                                                    [pedido.id]: {
                                                        ...prev[pedido.id],
                                                        comentario: e.target.value
                                                    }
                                                }))
                                            }
                                        />

                                        <div className="estrelas-box">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <span
                                                    key={n}
                                                    className={`estrela ${n <= (avaliacoes[pedido.id]?.estrelas || 0)
                                                        ? "ativa"
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        setAvaliacoes((prev) => ({
                                                            ...prev,
                                                            [pedido.id]: {
                                                                ...prev[pedido.id],
                                                                estrelas: n
                                                            }
                                                        }))
                                                    }
                                                >
                                                    ★
                                                </span>
                                            ))}

                                            <span className="nota-avaliacao">
                                                {avaliacoes[pedido.id]?.estrelas || 0}.0
                                            </span>
                                        </div>

                                        <button
                                            className="botao-acao
                                            "
                                            onClick={() =>
                                                enviarAvaliacao(
                                                    pedido.id,
                                                    pedido.itemIndividual
                                                )
                                            }
                                        >
                                            Enviar avaliação
                                        </button>
                                    </div>
                                )}
                                {/* REEMBOLSO */}
                                {reembolsoAberto[pedido.id] && (
                                    <div className="bloco-extra">

                                        <h3>Motivo do reembolso</h3>

                                        <textarea
                                            onChange={(e) =>
                                                setMotivosReembolso((prev) => ({
                                                    ...prev,
                                                    [pedido.id]: e.target.value
                                                }))
                                            }
                                        />

                                        <button
                                            className="botao-acao"
                                            onClick={() =>
                                                solicitarReembolso(pedido.id)
                                            }
                                        >
                                            Enviar reembolso
                                        </button>

                                    </div>
                                )}

                            </div>
                        </div>
                    ))
                )}

            </section>
        </div>
    );
} 