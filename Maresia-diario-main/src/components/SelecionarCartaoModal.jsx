import { useEffect } from "react";
import "../assets/css/perfil.css";
import iconMastercard from "../assets/img/icon-mastercard.png";

export default function SelecionarCartaoModal({
    aberto,
    onClose,
    cartoes,
    pagamento,
    cartaoSelecionado,
    onSelecionarCartao,
    onAdicionarCartao,
    onExcluirCartao,
}) {
    /*
     * QUANDO O MODAL ABRIR,
     * NÃO ALTERAMOS OS CARTÕES.
     */
    useEffect(() => {
        if (aberto) {
            // Apenas garante que o modal abra normalmente.
        }
    }, [aberto]);

    if (!aberto) return null;

    /*
     * MOSTRA SOMENTE OS CARTÕES
     * DO TIPO DE PAGAMENTO ATUAL.
     */
    const cartoesDoTipo = cartoes.filter(
        (cartao) => cartao.tipo === pagamento
    );

    const textoTipo =
        pagamento === "debito"
            ? "Débito"
            : "Crédito";

    /*
     * SELECIONAR CARTÃO
     */
    const selecionarCartao = (cartao) => {
        onSelecionarCartao(cartao);
        onClose();
    };

    /*
     * EXCLUIR CARTÃO
     */
    const excluirCartao = (cartao) => {
        if (onExcluirCartao) {
            onExcluirCartao(cartao);
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className="modal-conteudo"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                {/* =================================
            LISTA DE CARTÕES
        ================================== */}

                <div className="modal-header">

                    <h3>Meus cartões</h3>

                    <button
                        type="button"
                        className="modal-fechar"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                <div className="lista-enderecos">

                    {cartoesDoTipo.length === 0 ? (

                        <div className="nenhum-endereco-modal">
                            <p>
                                Nenhum cartão cadastrado
                            </p>
                        </div>

                    ) : (

                        cartoesDoTipo.map((cartao) => (

                            <div
                                key={cartao.id}
                                className="endereco-cadastrado"
                            >

                                <div className="endereco-selecao">

                                    <input
                                        type="radio"
                                        name="cartaoSelecionado"
                                        checked={
                                            cartaoSelecionado?.id ===
                                            cartao.id
                                        }
                                        onChange={() =>
                                            selecionarCartao(
                                                cartao
                                            )
                                        }
                                    />

                                    <div className="endereco-detalhes">

                                        <div className="endereco-nome">

                                            <img
                                                src={iconMastercard}
                                                alt="MasterCard"
                                                className="icone-mastercard"
                                            />

                                            <div>

                                                <strong>
                                                    {cartao.nome}
                                                </strong>

                                                <div className="endereco-linha-cartao">
                                                    Master Card
                                                </div>

                                            </div>

                                        </div>

                                        <div className="endereco-linha">

                                            {textoTipo}

                                            {" • "}

                                            **** **** ****{" "}

                                            {cartao.ultimosDigitos}

                                        </div>

                                        <div className="acoes-cartao">

                                            {cartao.padrao && (
                                                <button
                                                    type="button"
                                                    className="btn-padrao"
                                                >
                                                    Padrão
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="btn-excluir-cartao"
                                                onClick={() => excluirCartao(cartao)}
                                            >
                                                Excluir
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

                {/* =================================
            ADICIONAR NOVO CARTÃO
        ================================== */}

                <div className="modal-footer">

                    <button
                        type="button"
                        className="btn-adicionar-endereco"
                        onClick={onAdicionarCartao}
                    >
                        + Adicione um Novo Cartão
                    </button>

                </div>

            </div>
        </div>
    );
}