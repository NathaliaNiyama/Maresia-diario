
import Alert from "../components/alerta";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../utils/auth";
import { useState, useEffect } from "react";
import "../assets/css/MeusPedidos.css";
import Images from "../assets/img";
import Caminhao from "../assets/img/caminhao.png";

const API_URL = "http://localhost:3000/api";

export default function MeusPedidos() {
    const navigate = useNavigate();

    const [pedidos, setPedidos] = useState([]);
    const [aba, setAba] = useState("preparando");
    const [carregandoPedidos, setCarregandoPedidos] = useState(true);

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
    // CARREGAR PEDIDOS DO BANCO
    // =========================
    useEffect(() => {
        const carregarPedidos = async () => {
            try {
                setCarregandoPedidos(true);

                const resultadoUsuario = await getCurrentUser();
                const usuario = resultadoUsuario?.user ?? resultadoUsuario;

                if (!usuario?.id) {
                    throw new Error(
                        "Não foi possível identificar o usuário."
                    );
                }

                const resposta = await fetch(
                    `${API_URL}/users/${usuario.id}/pedidos`,
                    {
                        credentials: "include",
                    }
                );

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.error || "Erro ao carregar seus pedidos."
                    );
                }

                const pedidosSalvos = dados.pedidos || [];
                const pedidosSeparados = [];

                pedidosSalvos.forEach((pedido) => {
                    const itens = Array.isArray(pedido.itens)
                        ? pedido.itens
                        : [];

                    itens.forEach((item, index) => {
                        const itemFormatado = {
                            ...item,
                            id: item.productId,
                            nome: item.name,
                            preco: item.price,
                            img: item.image,
                            image1: item.image,
                        };

                        pedidosSeparados.push({
                            ...pedido,

                            codigo: pedido.numeroIdentificador,

                            itemIndividual: itemFormatado,

                            id: `${pedido.id}-${index}`,

                            etapaAtual: Number(
                                pedido.etapaAtual ?? 0
                            ),

                            reembolso: pedido.reembolso ?? null,

                            motivoReembolso:
                                pedido.motivoReembolso ?? "",

                            cancelado: pedido.cancelado ?? false,
                        });
                    });
                });

                setPedidos(pedidosSeparados);
            } catch (error) {
                console.error("Erro ao carregar pedidos:", error);

                setAlerta({
                    type: "erro",
                    message:
                        error.message ||
                        "Não foi possível carregar seus pedidos.",
                });
            } finally {
                setCarregandoPedidos(false);
            }
        };

        carregarPedidos();
    }, []);

    // =========================
    // SALVAR PEDIDOS NO ESTADO
    // =========================
    const salvarPedidos = (lista) => {
        setPedidos(lista);
    };

    // =========================
    // ATUALIZAR ETAPA
    // =========================
    const atualizarEtapa = (pedidoId, etapa) => {
        const novosPedidos = pedidos.map((pedido) => {
            if (pedido.id === pedidoId) {
                return {
                    ...pedido,
                    etapaAtual: etapa,
                };
            }

            return pedido;
        });

        setPedidos(novosPedidos);
    };

    // =========================
    // IMAGEM DO PRODUTO
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
                    cancelado: true,
                }
                : p
        );

        salvarPedidos(novosPedidos);

        setAlerta({
            type: "sucesso",
            message: "Pedido cancelado!",
        });
    };

    // =========================
    // SOLICITAR REEMBOLSO
    // =========================
    const solicitarReembolso = (pedidoId) => {
        const motivo = motivosReembolso[pedidoId];

        if (!motivo?.trim()) {
            setAlerta({
                type: "erro",
                message: "Digite o motivo do reembolso.",
            });

            return;
        }

        console.log("REEMBOLSO:", {
            pedidoId,
            motivo,
        });

        const novosPedidos = pedidos.map((p) =>
            p.id === pedidoId
                ? {
                    ...p,
                    reembolso: "Em análise",
                    motivoReembolso: motivo,
                }
                : p
        );

        salvarPedidos(novosPedidos);

        setReembolsoAberto((prev) => ({
            ...prev,
            [pedidoId]: false,
        }));

        setAlerta({
            type: "sucesso",
            message: "Reembolso solicitado!",
        });
    };

    // =========================
    // ENVIAR AVALIAÇÃO
    // =========================
    const enviarAvaliacao = (pedidoId, item) => {
        const avaliacao = avaliacoes[pedidoId];

        if (!avaliacao?.estrelas) {
            setAlerta({
                type: "erro",
                message: "Selecione as estrelas.",
            });

            return;
        }

        const lista =
            JSON.parse(
                sessionStorage.getItem("avaliacoesProdutos")
            ) || [];

        lista.push({
            id: Date.now(),

            productId: Number(item?.id),

            comentario: avaliacao.comentario || "",

            estrelas: avaliacao.estrelas,
        });

        sessionStorage.setItem(
            "avaliacoesProdutos",
            JSON.stringify(lista)
        );

        setAvaliacaoAberta((prev) => ({
            ...prev,
            [pedidoId]: false,
        }));

        setAlerta({
            type: "sucesso",
            message: "Avaliação enviada!",
        });
    };

    // =========================
    // FILTRO DAS ABAS
    // =========================
    const pedidosFiltrados = pedidos.filter((p) => {
        switch (aba) {
            case "preparando":
                return (
                    p.etapaAtual === 0 &&
                    !p.reembolso &&
                    !p.cancelado
                );

            case "caminho":
                return (
                    p.etapaAtual > 0 &&
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
                return p.reembolso === "Em análise";

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

                {carregandoPedidos ? (
                    <p>Carregando seus pedidos...</p>
                ) : (
                    <>
                        {/* ABAS */}
                        <div className="abas">
                            <span onClick={() => setAba("preparando")}>
                                Preparando
                            </span>

                            <span onClick={() => setAba("caminho")}>
                                A caminho
                            </span>

                            <span onClick={() => setAba("finalizado")}>
                                Finalizado
                            </span>

                            <span onClick={() => setAba("cancelado")}>
                                Cancelado
                            </span>

                            <span onClick={() => setAba("reembolso")}>
                                Reembolso
                            </span>
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
                                        overflow: "hidden",
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
                                            letterSpacing: "2px",
                                        }}
                                    >
                                        {aba === "finalizado"
                                            ? `Pedido #${pedido.codigo} Entregue`
                                            : `Pedido #${pedido.codigo}`}
                                    </div>

                                    {/* BODY */}
                                    <div
                                        className="pedido-body"
                                        style={{ padding: "20px" }}
                                    >
                                        {/* STATUS DO PAGAMENTO */}
                                        <div className="status-pagamento">
                                            <strong>Pagamento:</strong>{" "}
                                            <span
                                                className={
                                                    pedido.statusPagamento === "pago"
                                                        ? "pagamento-pago"
                                                        : "pagamento-pendente"
                                                }
                                            >
                                                {pedido.statusPagamento === "pago"
                                                    ? "Pago"
                                                    : "Pendente"}
                                            </span>
                                        </div>

                                        {/* RASTREAMENTO */}
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
                                                        "Entrega",
                                                    ].map((etapa, index) => (
                                                        <div
                                                            key={index}
                                                            className="status-item"
                                                            onClick={() => {
                                                                if (
                                                                    index ===
                                                                    pedido.etapaAtual + 1
                                                                ) {
                                                                    atualizarEtapa(
                                                                        pedido.id,
                                                                        index
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <div
                                                                className={`bola ${
                                                                    pedido.etapaAtual >= index
                                                                        ? "ativa"
                                                                        : ""
                                                                }`}
                                                            ></div>

                                                            <p>{etapa}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mensagem-entrega">
                                                    <img
                                                        src={Caminhao}
                                                        alt="Caminhão"
                                                        className="img-caminhao"
                                                    />

                                                    <p>
                                                        Seu pedido está a caminho!
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* STATUS REEMBOLSO */}
                                        {aba === "reembolso" && (
                                            <div className="status-reembolso">
                                                <div className="status-topo">
                                                    <span>
                                                        Pedido de reembolso
                                                    </span>

                                                    <span className="status-analise">
                                                        EM ANÁLISE
                                                    </span>
                                                </div>

                                                <div className="mensagem-reembolso">
                                                    Seu pedido de reembolso está
                                                    sendo analisado. Assim que
                                                    finalizar, você será informado.
                                                </div>
                                            </div>
                                        )}

                                        {/* PRODUTO */}
                                        <div className="item">
                                            <div className="produto-info">
                                                <img
                                                    src={getImagemProduto(
                                                        pedido.itemIndividual
                                                    )}
                                                    alt={
                                                        pedido.itemIndividual?.nome ||
                                                        "Produto"
                                                    }
                                                    style={{
                                                        width: "120px",
                                                        height: "160px",
                                                        objectFit: "cover",
                                                    }}
                                                />

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "15px",
                                                    }}
                                                >
                                                    <span>
                                                        {pedido.itemIndividual?.nome}
                                                    </span>

                                                    <span>
                                                        Quantidade:{" "}
                                                        {pedido.itemIndividual?.quantidade}
                                                    </span>

                                                    <span>
                                                        R${" "}
                                                        {Number(
                                                            pedido.itemIndividual?.preco
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* TOTAL */}
                                        <div className="total">
                                            Total: R${" "}
                                            {(
                                                Number(
                                                    pedido.itemIndividual?.preco
                                                ) *
                                                Number(
                                                    pedido.itemIndividual?.quantidade
                                                )
                                            ).toFixed(2)}
                                        </div>

                                        {/* AÇÕES */}
                                        <div className="acoes-pedido">
                                            {aba === "preparando" && (
                                                <button
                                                    className="botao-acao"
                                                    onClick={() =>
                                                        cancelarPedido(pedido.id)
                                                    }
                                                >
                                                    Cancelar pedido
                                                </button>
                                            )}

                                            {aba === "finalizado" && (
                                                <>
                                                    <button
                                                        className="botao-acao"
                                                        onClick={() =>
                                                            setAvaliacaoAberta(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [pedido.id]:
                                                                        !prev[pedido.id],
                                                                })
                                                            )
                                                        }
                                                    >
                                                        Avaliar pedido
                                                    </button>

                                                    <button
                                                        className="botao-acao"
                                                        onClick={() =>
                                                            setReembolsoAberto(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [pedido.id]:
                                                                        !prev[pedido.id],
                                                                })
                                                            )
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
                                                <h2>
                                                    Avalie sua experiência conosco!
                                                </h2>

                                                <textarea
                                                    placeholder="Detalhe sua avaliação"
                                                    className="textarea-avaliacao"
                                                    onChange={(e) =>
                                                        setAvaliacoes((prev) => ({
                                                            ...prev,
                                                            [pedido.id]: {
                                                                ...prev[pedido.id],
                                                                comentario:
                                                                    e.target.value,
                                                            },
                                                        }))
                                                    }
                                                />

                                                <div className="estrelas-box">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <span
                                                            key={n}
                                                            className={`estrela ${
                                                                n <=
                                                                (avaliacoes[pedido.id]
                                                                    ?.estrelas || 0)
                                                                    ? "ativa"
                                                                    : ""
                                                            }`}
                                                            onClick={() =>
                                                                setAvaliacoes(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [pedido.id]: {
                                                                            ...prev[
                                                                                pedido.id
                                                                            ],
                                                                            estrelas: n,
                                                                        },
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            ★
                                                        </span>
                                                    ))}

                                                    <span className="nota-avaliacao">
                                                        {avaliacoes[pedido.id]
                                                            ?.estrelas || 0}
                                                        .0
                                                    </span>
                                                </div>

                                                <button
                                                    className="botao-acao"
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
                                                    value={
                                                        motivosReembolso[
                                                            pedido.id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setMotivosReembolso(
                                                            (prev) => ({
                                                                ...prev,
                                                                [pedido.id]:
                                                                    e.target.value,
                                                            })
                                                        )
                                                    }
                                                />

                                                <button
                                                    className="botao-acao"
                                                    onClick={() =>
                                                        solicitarReembolso(
                                                            pedido.id
                                                        )
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
                    </>
                )}
            </section>
        </div>
    );
}
