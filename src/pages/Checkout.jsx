import { useEffect, useState } from "react";
import "../assets/css/checkout.css";


import iconLocalizacao from "../assets/img/icon_Localização.png";
import iconCupom from "../assets/img/icon-cupom.png";


import Alert from "../components/alerta";
import { useNavigate } from "react-router-dom";


import SelecionarEnderecoModal from "../components/SelecionarEnderecoModal";
import AdicionarCartaoModal from "../components/AdicionarCartaoModal";
import SelecionarParcelasModal from "../components/SelecionarParcelasModal";
import ModalPix from "../components/ModalPix";


import { getCurrentUser } from "../utils/auth";
import { cartService } from "../services/cartService";


const API_URL = "http://localhost:3000/api";
const FRETE_FIXO = 50;


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


// Evita pequenas diferenças de arredondamento monetário.
const arredondarCentavos = (valor) =>
  Math.round((Number(valor) + Number.EPSILON) * 100) / 100;


export default function Checkout() {
  const navigate = useNavigate();


  // ==========================================
  // ESTADOS PRINCIPAIS
  // ==========================================


  const [produtos, setProdutos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);


  const [pagamento, setPagamento] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);


  // ==========================================
  // ESTADOS DOS CARTÕES
  // ==========================================


  const [cartoes, setCartoes] = useState([]);
  const [cartaoSelecionadoId, setCartaoSelecionadoId] = useState("");


  const [formCartao, setFormCartao] = useState({
    nome: "",
    bandeira: "",
    ultimos4: "",
    validade: "",
    tipo: "CREDITO",
    favorito: false,
  });


  const tipoCartaoPagamento =
    pagamento === "cartao"
      ? "CREDITO"
      : pagamento === "debito"
        ? "DEBITO"
        : null;


  const cartoesDisponiveis = cartoes.filter(
    (cartao) => cartao.tipo === tipoCartaoPagamento
  );


  const cartaoSelecionado =
    cartoesDisponiveis.find(
      (cartao) => String(cartao.id) === String(cartaoSelecionadoId)
    ) || null;


  useEffect(() => {
    if (!tipoCartaoPagamento) {
      setCartaoSelecionadoId("");
      return;
    }


    const selecaoAtual = cartoesDisponiveis.find(
      (cartao) => String(cartao.id) === String(cartaoSelecionadoId)
    );


    if (!selecaoAtual) {
      const cartaoPadrao =
        cartoesDisponiveis.find((cartao) => cartao.favorito) ||
        cartoesDisponiveis[0] ||
        null;


      setCartaoSelecionadoId(
        cartaoPadrao ? String(cartaoPadrao.id) : ""
      );
    }
  }, [pagamento, cartoes, cartaoSelecionadoId]);


  // ==========================================
  // ESTADOS DOS MODAIS
  // ==========================================


  const [abrirSelecionarEndereco, setAbrirSelecionarEndereco] =
    useState(false);


  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [modalParcelasAberto, setModalParcelasAberto] = useState(false);
  const [modalPixAberto, setModalPixAberto] = useState(false);


  // ==========================================
  // ESTADOS DOS CUPONS
  // ==========================================


  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState(null);


  // ==========================================
  // BUSCAR CARTÕES CADASTRADOS
  // ==========================================


  async function buscarCartoes(userId) {
    const resposta = await fetch(
      `${API_URL}/users/${userId}/cartoes`,
      {
        credentials: "include",
      }
    );


    const dados = await resposta.json();


    if (!resposta.ok) {
      throw new Error(dados.error || "Erro ao carregar cartões.");
    }


    const lista = Array.isArray(dados)
      ? dados
      : dados.cartoes || [];


    setCartoes(lista);


    return lista;
  }


  // ==========================================
  // CARREGAR PRODUTOS, USUÁRIO, ENDEREÇOS E CARTÕES
  // ==========================================


  useEffect(() => {
    const carregarCheckout = async () => {
      try {
        setCarregando(true);


        const dados = localStorage.getItem("checkoutSelecionados");


        if (!dados) {
          setAlerta({
            type: "erro",
            message: "Nenhum produto foi selecionado para a compra.",
          });


          setTimeout(() => navigate("/sacola"), 1500);
          return;
        }


        const produtosSelecionados = JSON.parse(dados);


        if (
          !Array.isArray(produtosSelecionados) ||
          produtosSelecionados.length === 0
        ) {
          setAlerta({
            type: "erro",
            message: "Nenhum produto foi selecionado para a compra.",
          });


          setTimeout(() => navigate("/sacola"), 1500);
          return;
        }


        setProdutos(produtosSelecionados);


        const resultadoUsuario = await getCurrentUser();
        const usuarioAtual = resultadoUsuario?.user ?? resultadoUsuario;


        if (!usuarioAtual?.id) {
          throw new Error("Não foi possível identificar o usuário.");
        }


        setUsuario(usuarioAtual);


        const respostaEnderecos = await fetch(
          `${API_URL}/users/${usuarioAtual.id}/addresses`,
          {
            credentials: "include",
          }
        );


        const dadosEnderecos = await respostaEnderecos.json();


        if (!respostaEnderecos.ok) {
          throw new Error(
            dadosEnderecos.error || "Erro ao carregar endereços."
          );
        }


        const listaEnderecos = dadosEnderecos.addresses || [];


        const enderecoPadrao =
          listaEnderecos.find((endereco) => endereco.favorito) ||
          listaEnderecos[0] ||
          null;


        setEnderecoSelecionado(enderecoPadrao);


        await buscarCartoes(usuarioAtual.id);
      } catch (error) {
        console.error("Erro ao carregar Checkout:", error);


        setAlerta({
          type: "erro",
          message: error.message || "Erro ao carregar os dados da compra.",
        });
      } finally {
        setCarregando(false);
      }
    };


    carregarCheckout();
  }, [navigate]);


  // ==========================================
  // CORES DOS PRODUTOS
  // ==========================================


  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#ccc";
  };


  // ==========================================
  // CÁLCULO DO SUBTOTAL, DESCONTO, FRETE E TOTAL
  // ==========================================


  const total = arredondarCentavos(
    produtos.reduce(
      (acc, item) =>
        acc + Number(item.preco) * Number(item.quantidade),
      0
    )
  );


  const desconto = arredondarCentavos(
    total * ((cupomAplicado?.porcentagem || 0) / 100)
  );


  const frete = cupomAplicado?.freteGratis
    ? 0
    : FRETE_FIXO;


  const totalFinal = arredondarCentavos(
    total - desconto + frete
  );


  // ==========================================
  // VALIDAR CUPOM
  // ==========================================


  const validarCupom = () => {
    const codigo = cupom.trim().toUpperCase();


    if (!codigo) {
      setAlerta({
        type: "erro",
        message: "Digite um cupom.",
      });
      return;
    }


    const cupons = {
      MARESIA15: {
        porcentagem: 15,
        nome: "MARESIA15",
        freteGratis: false,
      },
      PEROLA30: {
        porcentagem: 30,
        nome: "PEROLA30",
        freteGratis: false,
      },
      FRETEGRATIS: {
        porcentagem: 0,
        nome: "FRETEGRATIS",
        freteGratis: true,
      },
    };


    const cupomEncontrado = cupons[codigo];


    if (!cupomEncontrado) {
      setAlerta({
        type: "erro",
        message: "Cupom inválido ou expirado.",
      });
      return;
    }


    setCupomAplicado(cupomEncontrado);


    if (codigo === "FRETEGRATIS") {
      setAlerta({
        type: "sucesso",
        message: "Cupom de frete grátis aplicado! Você não pagará o frete.",
      });
    } else {
      setAlerta({
        type: "sucesso",
        message: `Cupom ${codigo} aplicado! Você ganhou ${cupomEncontrado.porcentagem}% de desconto.`,
      });
    }
  };


  // ==========================================
  // REMOVER CUPOM
  // ==========================================


  const removerCupom = () => {
    setCupomAplicado(null);
    setCupom("");


    setAlerta({
      type: "sucesso",
      message: "Cupom removido. O frete de R$ 50,00 foi restaurado.",
    });
  };


  // ==========================================
  // CADASTRAR CARTÃO
  // ==========================================


  const salvarCartao = async (e) => {
    e.preventDefault();


    try {
      const cartaoParaSalvar = {
        ...formCartao,
        tipo: tipoCartaoPagamento,
      };


      const resposta = await fetch(`${API_URL}/cartoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(cartaoParaSalvar),
      });


      const dados = await resposta.json();


      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao cadastrar cartão.");
      }


      setModalCartaoAberto(false);


      setFormCartao({
        nome: "",
        bandeira: "",
        ultimos4: "",
        validade: "",
        tipo: "CREDITO",
        favorito: false,
      });


      if (dados.cartao?.id) {
        setCartaoSelecionadoId(String(dados.cartao.id));
      }


      setAlerta({
        type: "sucesso",
        message: "Cartão cadastrado com sucesso!",
      });


      try {
        await buscarCartoes(usuario.id);
      } catch (error) {
        console.error("Erro ao atualizar cartões:", error);


        setAlerta({
          type: "erro",
          message: "O cartão foi cadastrado, mas não foi possível atualizar a lista.",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);


      setAlerta({
        type: "erro",
        message: error.message || "Não foi possível cadastrar o cartão.",
      });
    }
  };


  // ==========================================
  // DEFINIR CARTÃO PADRÃO
  // ==========================================


  const definirCartaoPadrao = async (id) => {
    try {
      const resposta = await fetch(
        `${API_URL}/cartoes/${id}/favorite`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );


      const dados = await resposta.json();


      if (!resposta.ok) {
        throw new Error(
          dados.error || "Não foi possível definir o cartão padrão."
        );
      }


      await buscarCartoes(usuario.id);
      setCartaoSelecionadoId(String(id));


      setAlerta({
        type: "sucesso",
        message: "Cartão padrão atualizado!",
      });
    } catch (error) {
      console.error("Erro ao definir cartão padrão:", error);


      setAlerta({
        type: "erro",
        message: error.message || "Erro ao atualizar cartão padrão.",
      });
    }
  };


  // ==========================================
  // EXCLUIR CARTÃO
  // ==========================================


  const excluirCartao = async (id) => {
    try {
      const resposta = await fetch(
        `${API_URL}/cartoes/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );


      const dados = await resposta.json();


      if (!resposta.ok) {
        throw new Error(
          dados.error || "Não foi possível excluir o cartão."
        );
      }


      await buscarCartoes(usuario.id);


      setAlerta({
        type: "sucesso",
        message: "Cartão excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir cartão:", error);


      setAlerta({
        type: "erro",
        message: error.message || "Erro ao excluir cartão.",
      });
    }
  };


  // ==========================================
  // FORMATAÇÃO DO ENDEREÇO
  // ==========================================


  const formatarEndereco = (endereco) => {
    if (!endereco) return "";


    const complemento = endereco.complemento
      ? `, ${endereco.complemento}`
      : "";


    return `${endereco.rua}, ${endereco.numero}${complemento}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}, CEP: ${endereco.cep}`;
  };


  // ==========================================
  // FINALIZAR COMPRA
  // ==========================================


  const finalizarCompra = async (parcelas = 1) => {
    if (processando) return;


    if (!produtos.length) {
      setAlerta({
        type: "erro",
        message: "Não existem produtos selecionados.",
      });
      return;
    }


    if (!usuario?.id) {
      setAlerta({
        type: "erro",
        message: "Não foi possível identificar seu usuário.",
      });
      return;
    }


    if (!enderecoSelecionado?.id) {
      setAlerta({
        type: "erro",
        message: "Selecione um endereço de entrega.",
      });
      return;
    }


    if (!pagamento) {
      setAlerta({
        type: "erro",
        message: "Selecione uma forma de pagamento.",
      });
      return;
    }


    if (
      (pagamento === "cartao" || pagamento === "debito") &&
      !cartaoSelecionado?.id
    ) {
      setAlerta({
        type: "erro",
        message: "Cadastre ou selecione um cartão para continuar.",
      });
      return;
    }


    const cartItemIds = produtos
      .map((produto) => Number(produto.cartItemId ?? produto.id))
      .filter((id) => Number.isInteger(id) && id > 0);


    if (cartItemIds.length !== produtos.length) {
      setAlerta({
        type: "erro",
        message: "Não foi possível identificar todos os itens selecionados.",
      });
      return;
    }


    try {
      setProcessando(true);


      const resultado = await cartService.checkout(
        usuario.id,
        pagamento,
        enderecoSelecionado.id,
        cartItemIds,
        parcelas,
        cupomAplicado?.nome || null
      );


      console.log("Pedido criado:", resultado.pedido);


      localStorage.removeItem("checkoutSelecionados");
      window.dispatchEvent(new Event("cartUpdated"));


      setAlerta({
        type: "sucesso",
        message: "Pedido realizado com sucesso!",
      });


      setTimeout(() => {
        navigate("/perfil", {
          state: {
            secao: "pedidos",
          },
        });
      }, 1800);
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);


      setAlerta({
        type: "erro",
        message: error.message || "Não foi possível finalizar a compra.",
      });
    } finally {
      setProcessando(false);
    }
  };


  // ==========================================
  // CARREGAMENTO
  // ==========================================


  if (carregando) {
    return (
      <div className="checkout-container">
        <p>Carregando informações da compra...</p>
      </div>
    );
  }


  return (
    <div className="checkout-container">
      {alerta && (
        <Alert
          type={alerta.type}
          message={alerta.message}
          onClose={() => setAlerta(null)}
        />
      )}


      <div className="checkout-titulo">
        Caixa
      </div>


      {/* ENDEREÇO DE ENTREGA */}


      <div className="endereco-box">
        <h3>
          <img
            src={iconLocalizacao}
            alt="Localização"
            className="icone-endereco"
          />
          Endereço de entrega
        </h3>


        {enderecoSelecionado ? (
          <div className="endereco-info">
            <strong>
              {enderecoSelecionado.nome || usuario?.name}{" "}
              {enderecoSelecionado.telefone || usuario?.phone || ""}
            </strong>


            <span>{formatarEndereco(enderecoSelecionado)}</span>


            <div className="acoes-endereco">
              {enderecoSelecionado.favorito && (
                <button className="btn-padrao" type="button">
                  Padrão
                </button>
              )}


              <button
                type="button"
                className="trocar-endereco"
                onClick={() => setAbrirSelecionarEndereco(true)}
              >
                Trocar
              </button>
            </div>
          </div>
        ) : (
          <div className="endereco-info">
            <p>Nenhum endereço cadastrado.</p>


            <button
              type="button"
              className="trocar-endereco"
              onClick={() => setAbrirSelecionarEndereco(true)}
            >
              Adicionar endereço
            </button>
          </div>
        )}
      </div>


      {/* PRODUTOS SELECIONADOS */}


      <div className="produtos-box">
        <div className="cabecalho-produtos">
          <span className="titulo-produtos">Produtos pedidos</span>
          <span>Preço unitário</span>
          <span>Quantia</span>
          <span>Subtotal de itens</span>
        </div>


        {produtos.map((produto) => (
          <div
            key={produto.cartItemId ?? produto.id}
            className="produto-checkout"
          >
            <div className="produto-info">
              <img src={produto.img} alt={produto.nome} />


              <div>
                <h4>{produto.nome}</h4>


                {produto.tamanho && (
                  <div className="tamanho-produto">
                    {produto.tamanho}
                  </div>
                )}


                {produto.cor && (
                  <div
                    className="cor-produto"
                    style={{
                      backgroundColor: getCorHex(produto.cor),
                    }}
                  />
                )}
              </div>
            </div>


            <div className="preco-unitario">
              R$ {Number(produto.preco).toFixed(2)}
            </div>


            <div className="quantidade-produto">
              {produto.quantidade}
            </div>


            <div className="subtotal-produto">
              R${" "}
              {(
                Number(produto.preco) *
                Number(produto.quantidade)
              ).toFixed(2)}
            </div>
          </div>
        ))}
      </div>


      {/* CUPOM, PAGAMENTO E RESUMO */}


      <div className="checkout-extra">
        <div className="cupom-box">
          <h3 className="titulo-cupom">
            <img
              src={iconCupom}
              alt="Cupom"
              className="icone-cupom"
            />
            Cupom Maresia
          </h3>


          <div className="cupom-conteudo" style={{ fontSize: "17px", color: "#333" }}>
            <p>Insira seu cupom e aproveite o desconto!</p>


            <input
              type="text"
              placeholder="Digite seu cupom"
              value={cupom}
              onChange={(e) => setCupom(e.target.value.toUpperCase())}
              disabled={Boolean(cupomAplicado)}
            />


            {!cupomAplicado && (
              <button
                type="button"
                className="btn-cupom"
                onClick={validarCupom}
              >
                Aplicar
              </button>
            )}


            {cupomAplicado && (
              <div className="cupom-aplicado" style={{ display: "flex", alignItems: "center" }}>
                <span>
                  Cupom aplicado: <strong>{cupomAplicado.nome}</strong>
                </span>


                <button style={{ color: "#ffffff", backgroundColor: "#0f5968", border: "none", cursor: "pointer", width: "80px", height: "30px", marginRight: "10px", fontWeight: "bold", borderRadius: "5px" }}
                  type="button"
                  onClick={removerCupom}
                >
                  Remover
                </button>
              </div>
            )}






            <div className="desconto-total">
              <span className="texto-desconto">
                Desconto nos produtos:
              </span>


              <span className="valor-desconto">
                R$ {desconto.toFixed(2)}
              </span>
            </div>
          </div>
        </div>


        {/* MÉTODO DE PAGAMENTO */}


        <div className="pagamento-box">
          <h3>Método de pagamento</h3>


          <div className="opcao-pagamento">
            <input
              type="radio"
              name="pagamento"
              value="pix"
              checked={pagamento === "pix"}
              onChange={(e) => setPagamento(e.target.value)}
            />
            <span>Pix</span>
          </div>


          <div className="opcao-pagamento">
            <input
              type="radio"
              name="pagamento"
              value="debito"
              checked={pagamento === "debito"}
              onChange={(e) => setPagamento(e.target.value)}
            />
            <span>Cartão de débito</span>
          </div>


          <div className="opcao-pagamento">
            <input
              type="radio"
              name="pagamento"
              value="cartao"
              checked={pagamento === "cartao"}
              onChange={(e) => setPagamento(e.target.value)}
            />
            <span>Cartão de crédito</span>
          </div>


          {(pagamento === "cartao" || pagamento === "debito") && (
            <div className="cartao-box">
              {cartoesDisponiveis.length > 0 ? (
                <>
                  <div className="cartao-info">
                    <div className="cartao-dados">
                      <div className="texto-cartao">
                        <span className="tipo-cartao">
                          {cartaoSelecionado?.bandeira || "Cartão"}
                        </span>


                        <span className="credito-cartao">
                          {pagamento === "cartao" ? "Crédito" : "Débito"}
                        </span>
                      </div>
                    </div>


                    <span className="numero-cartao">
                      **** **** ****{" "}
                      {cartaoSelecionado?.ultimos4 || "----"}
                    </span>


                    <span>
                      Validade: {cartaoSelecionado?.validade || "--/--"}
                    </span>
                  </div>


                  <label htmlFor="selecionar-cartao">
                    Cartão utilizado:
                  </label>


                  <select
                    id="selecionar-cartao"
                    value={cartaoSelecionadoId}
                    onChange={(e) =>
                      setCartaoSelecionadoId(e.target.value)
                    }
                  >
                    {cartoesDisponiveis.map((cartao) => (
                      <option
                        key={cartao.id}
                        value={String(cartao.id)}
                      >
                        {cartao.bandeira} •••• {cartao.ultimos4}
                        {cartao.favorito ? " (Padrão)" : ""}
                      </option>
                    ))}
                  </select>


                  {cartaoSelecionado && (
                    <div className="acoes-cartao">
                      {cartaoSelecionado.favorito ? (
                        <button
                          className="btn-padrao"
                          type="button"
                          disabled
                        >
                          Padrão
                        </button>
                      ) : (
                        <button
                          className="btn-padrao"
                          type="button"
                          onClick={() =>
                            definirCartaoPadrao(cartaoSelecionado.id)
                          }
                        >
                          Definir como padrão
                        </button>
                      )}


                      <button
                        className="btn-excluir-cartao"
                        type="button"
                        onClick={() =>
                          excluirCartao(cartaoSelecionado.id)
                        }
                      >
                        Excluir cartão
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="cartao-vazio">
                  <p>
                    Nenhum cartão de{" "}
                    {pagamento === "cartao" ? "crédito" : "débito"}{" "}
                    cadastrado.
                  </p>
                </div>
              )}


              <button
                className="trocar-cartao"
                type="button"
                onClick={() => {
                  setFormCartao({
                    nome: "",
                    bandeira: "",
                    ultimos4: "",
                    validade: "",
                    tipo: pagamento === "cartao" ? "CREDITO" : "DEBITO",
                    favorito: false,
                  });


                  setModalCartaoAberto(true);
                }}
              >
                Adicionar cartão
              </button>
            </div>
          )}
        </div>


        {/* RESUMO DA COMPRA */}


        <div className="resumo-compra">
          <p>
            <span>Total de produtos:</span>
            <strong>R$ {total.toFixed(2)}</strong>
          </p>


          <p>
            <span>Frete:</span>
            <strong>
              {frete === 0 ? (
                <span className="frete-gratis">Grátis</span>
              ) : (
                `R$ ${frete.toFixed(2)}`
              )}
            </strong>
          </p>


          <p>
            <span>Desconto:</span>
            <strong>R$ {desconto.toFixed(2)}</strong>
          </p>


          <p className="total-final">
            <span>Total a pagar:</span>
            <strong>R$ {totalFinal.toFixed(2)}</strong>
          </p>


          <hr className="linha-finalizar" />


          <button
            className="btn-finalizar"
            type="button"
            disabled={processando}
            onClick={() => {
              if (!pagamento) {
                setAlerta({
                  type: "erro",
                  message: "Selecione uma forma de pagamento.",
                });
                return;
              }


              if (pagamento === "cartao" || pagamento === "debito") {
                if (!cartaoSelecionado?.id) {
                  setAlerta({
                    type: "erro",
                    message: "Cadastre ou selecione um cartão para continuar.",
                  });
                  return;
                }


                setModalParcelasAberto(true);
              } else if (pagamento === "pix") {
                setModalPixAberto(true);
              }
            }}
          >
            {processando ? "Finalizando..." : "Fazer compra"}
          </button>
        </div>
      </div>


      {/* MODAL DE ENDEREÇOS */}


      <SelecionarEnderecoModal
        aberto={abrirSelecionarEndereco}
        onClose={() => setAbrirSelecionarEndereco(false)}
        onSelecionar={(endereco) => {
          setEnderecoSelecionado(endereco);
          setAbrirSelecionarEndereco(false);
        }}
      />


      {/* MODAL DE CARTÃO */}


      <AdicionarCartaoModal
        aberto={modalCartaoAberto}
        onClose={() => setModalCartaoAberto(false)}
        onSalvar={salvarCartao}
        formCartao={formCartao}
        setFormCartao={setFormCartao}
      />


      {/* MODAL DE PARCELAS */}


      <SelecionarParcelasModal
        aberto={modalParcelasAberto}
        onClose={() => setModalParcelasAberto(false)}
        total={totalFinal}
        tipoPagamento={pagamento}
        onConfirmar={(quantidadeParcelas = 1) => {
          setModalParcelasAberto(false);
          finalizarCompra(quantidadeParcelas);
        }}
      />


      {/* MODAL PIX */}


      <ModalPix
        aberto={modalPixAberto}
        onClose={() => setModalPixAberto(false)}
        onConfirmar={() => {
          setModalPixAberto(false);
          finalizarCompra(1);
        }}
      />
    </div>
  );
}


