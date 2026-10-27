import { useEffect, useState } from "react";
import "../assets/css/checkout.css";
import iconLocalizacao from "../assets/img/icon_Localização.png";
import iconCupom from "../assets/img/icon-cupom.png";
import iconMastercard from "../assets/img/icon-mastercard.png";
import Alert from "../components/alerta";
import { useNavigate } from "react-router-dom";
import SelecionarEnderecoModal from "../components/SelecionarEnderecoModal";
import SelecionarCartaoModal from "../components/SelecionarCartaoModal";
import AdicionarCartaoModal from "../components/AdicionarCartaoModal";
import SelecionarParcelasModal from "../components/SelecionarParcelasModal";
import ModalPix from "../components/ModalPix";

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

export default function Checkout() {
  const navigate = useNavigate();

  /*
   * =========================================================
   * ESTADOS PRINCIPAIS
   * =========================================================
   */

  const [produtos, setProdutos] = useState([]);
  const [pagamento, setPagamento] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [cupom, setCupom] = useState("");

  /*
   * =========================================================
   * MODAIS
   * =========================================================
   */

  const [
    abrirSelecionarEndereco,
    setAbrirSelecionarEndereco,
  ] = useState(false);

  const [
    modalCartaoAberto,
    setModalCartaoAberto,
  ] = useState(false);

  const [
    selecionarCartaoAberto,
    setSelecionarCartaoAberto,
  ] = useState(false);

  const [
    modalParcelasAberto,
    setModalParcelasAberto,
  ] = useState(false);

  const [
    modalPixAberto,
    setModalPixAberto,
  ] = useState(false);

  /*
   * =========================================================
   * FORMULÁRIO DE ENDEREÇO
   * =========================================================
   */

  const [formEndereco, setFormEndereco] =
    useState({
      nome: "",
      telefone: "",
      cep: "",
      estado: "",
      cidade: "",
      bairro: "",
      rua: "",
      numero: "",
      complemento: "",
      padrao: false,
    });

  /*
   * =========================================================
   * FORMULÁRIO DO CARTÃO
   * =========================================================
   */

  const [formCartao, setFormCartao] = useState({
    numero: "",
    validade: "",
    cvv: "",
    nome: "",
    cpf: "",
    padrao: false,
  });

  /*
   * =========================================================
   * CARTÕES CADASTRADOS
   * =========================================================
   */

  const [cartoes, setCartoes] = useState([]);

  /*
   * =========================================================
   * CARTÃO SELECIONADO
   * =========================================================
   */

  const [
    cartaoSelecionado,
    setCartaoSelecionado,
  ] = useState(null);

  /*
   * =========================================================
   * CARREGAR PRODUTOS
   * =========================================================
   */

  useEffect(() => {
    const dados = localStorage.getItem(
      "checkoutSelecionados"
    );

    if (dados) {
      setProdutos(JSON.parse(dados));
    }
  }, []);

  /*
   * =========================================================
   * COR DOS PRODUTOS
   * =========================================================
   */

  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#ccc";
  };

  /*
   * =========================================================
   * TOTAL
   * =========================================================
   */

  const total = produtos.reduce(
    (acc, item) =>
      acc + item.preco * item.quantidade,
    0
  );

  /*
   * =========================================================
   * CUPOM
   * =========================================================
   */

  const validarCupom = () => {
    if (!cupom.trim()) {
      setAlerta({
        type: "erro",
        message: "Digite um cupom.",
      });

      return;
    }

    if (cupom !== "FRETEGRATIS") {
      setAlerta({
        type: "erro",
        message:
          "Cupom inválido ou expirado.",
      });

      return;
    }

    setAlerta({
      type: "sucesso",
      message:
        "Cupom aplicado com sucesso!",
    });
  };

  /*
   * =========================================================
   * FORMATAR TELEFONE
   * =========================================================
   */

  const formatarTelefone = (telefone) => {
    const numeros = String(telefone || "")
      .replace(/\D/g, "");

    if (!numeros) {
      return "";
    }

    if (numeros.length <= 2) {
      return `(+${numeros})`;
    }

    const codigo = numeros.slice(0, 2);
    const restante = numeros.slice(2, 11);

    if (restante.length <= 5) {
      return `(+${codigo}) ${restante}`;
    }

    return `(+${codigo}) ${restante.slice(
      0,
      5
    )}-${restante.slice(5)}`;
  };

  /*
   * =========================================================
   * BUSCAR CEP
   * =========================================================
   */

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(
      /\D/g,
      ""
    );

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data = await response.json();

      if (data.erro) {
        setAlerta({
          type: "erro",
          message: "CEP não encontrado.",
        });

        return;
      }

      setFormEndereco((prev) => ({
        ...prev,
        cep: `${cepLimpo.slice(
          0,
          5
        )}-${cepLimpo.slice(5)}`,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch (error) {
      console.error(
        "Erro ao buscar CEP:",
        error
      );

      setAlerta({
        type: "erro",
        message:
          "Não foi possível consultar o CEP.",
      });
    }
  };

  /*
   * =========================================================
   * VERIFICAR ENDEREÇO
   * =========================================================
   */

  const existeEndereco =
    formEndereco.nome.trim() ||
    formEndereco.rua.trim() ||
    formEndereco.cep.trim();

  /*
   * =========================================================
   * CARTÕES DO TIPO SELECIONADO
   * =========================================================
   */

  const cartoesDoTipo = cartoes.filter(
    (cartao) =>
      cartao.tipo === pagamento
  );

  /*
   * =========================================================
   * ABRIR FORMULÁRIO PARA ADICIONAR CARTÃO
   * =========================================================
   */

  const abrirAdicionarCartao = () => {
    setFormCartao({
      numero: "",
      validade: "",
      cvv: "",
      nome: "",
      cpf: "",
      padrao: false,
    });

    setModalCartaoAberto(true);
  };

  /*
   * =========================================================
   * SALVAR CARTÃO
   * =========================================================
   */

  const salvarCartao = (e) => {
    e.preventDefault();

    const numeroLimpo =
      formCartao.numero.replace(
        /\D/g,
        ""
      );

    if (numeroLimpo.length !== 16) {
      setAlerta({
        type: "erro",
        message:
          "Digite os 16 dígitos do cartão.",
      });

      return;
    }

    const validadeLimpa =
      formCartao.validade.replace(
        /\D/g,
        ""
      );

    if (validadeLimpa.length !== 4) {
      setAlerta({
        type: "erro",
        message:
          "Digite a validade no formato MM/AA.",
      });

      return;
    }

    const cvvLimpo =
      formCartao.cvv.replace(
        /\D/g,
        ""
      );

    if (
      cvvLimpo.length !== 3 &&
      cvvLimpo.length !== 4
    ) {
      setAlerta({
        type: "erro",
        message:
          "Digite um código de segurança válido.",
      });

      return;
    }

    const cpfLimpo =
      formCartao.cpf.replace(
        /\D/g,
        ""
      );

    if (cpfLimpo.length !== 11) {
      setAlerta({
        type: "erro",
        message:
          "Digite um CPF válido.",
      });

      return;
    }

    const jaExisteCartaoDoTipo =
      cartoes.some(
        (cartao) =>
          cartao.tipo === pagamento
      );

    const novoCartao = {
      id: Date.now(),

      tipo: pagamento,

      numero: numeroLimpo,

      validade:
        formCartao.validade,

      cvv: cvvLimpo,

      nome:
        formCartao.nome,

      cpf: cpfLimpo,

      ultimosDigitos:
        numeroLimpo.slice(-4),

      padrao:
        !jaExisteCartaoDoTipo
          ? true
          : formCartao.padrao,
    };

    setCartoes((prev) => [
      ...prev.map((cartao) =>
        cartao.tipo === pagamento &&
        novoCartao.padrao
          ? {
              ...cartao,
              padrao: false,
            }
          : cartao
      ),
      novoCartao,
    ]);

    setCartaoSelecionado(
      novoCartao
    );

    setModalCartaoAberto(false);

    setAlerta({
      type: "sucesso",
      message:
        "Cartão cadastrado com sucesso!",
    });
  };

  /*
   * =========================================================
   * EXCLUIR CARTÃO
   * =========================================================
   */

  const excluirCartao = (cartao) => {
    setCartoes((prev) =>
      prev.filter(
        (item) => item.id !== cartao.id
      )
    );

    /*
     * SE O CARTÃO EXCLUÍDO ERA O SELECIONADO,
     * LIMPA A SELEÇÃO.
     */
    if (
      cartaoSelecionado?.id === cartao.id
    ) {
      setCartaoSelecionado(null);
    }

    setAlerta({
      type: "sucesso",
      message:
        "Cartão excluído com sucesso!",
    });
  };

  /*
   * =========================================================
   * EXCLUIR ENDEREÇO
   * =========================================================
   */

  const excluirEndereco = (endereco) => {
    /*
     * VERIFICA SE O ENDEREÇO EXCLUÍDO
     * É O ENDEREÇO ATUAL DO CHECKOUT.
     */
    const mesmoEndereco =
      formEndereco.nome === endereco.nome &&
      formEndereco.cep === endereco.cep &&
      formEndereco.rua === endereco.rua &&
      formEndereco.numero === endereco.numero;

    /*
     * SE FOR O ENDEREÇO ATUAL,
     * LIMPA O ENDEREÇO DO CHECKOUT.
     */
    if (mesmoEndereco) {
      setFormEndereco({
        nome: "",
        telefone: "",
        cep: "",
        estado: "",
        cidade: "",
        bairro: "",
        rua: "",
        numero: "",
        complemento: "",
        padrao: false,
      });
    }

    setAlerta({
      type: "sucesso",
      message:
        "Endereço excluído com sucesso!",
    });
  };

  /*
   * =========================================================
   * FINALIZAR COMPRA
   * =========================================================
   */

  const finalizarCompra = () => {
    if (!existeEndereco) {
      setAlerta({
        type: "erro",
        message:
          "Cadastre um endereço antes de finalizar a compra.",
      });

      setAbrirSelecionarEndereco(
        true
      );

      return;
    }

    if (!pagamento) {
      setAlerta({
        type: "erro",
        message:
          "Selecione um método de pagamento.",
      });

      return;
    }

    if (
      pagamento === "cartao" ||
      pagamento === "debito"
    ) {
      if (cartoesDoTipo.length === 0) {
        setAlerta({
          type: "erro",
          message:
            "Cadastre um cartão antes de finalizar a compra.",
        });

        return;
      }
    }

    const novoPedido = {
      id: Date.now(),

      codigo: Math.floor(
        Math.random() * 100000
      ),

      data: new Date().toLocaleDateString(
        "pt-BR"
      ),

      timestamp: Date.now(),

      status: "preparando",

      etapas: [0],

      pagamento,

      endereco: {
        nome: formEndereco.nome,
        telefone:
          formEndereco.telefone,
        rua: formEndereco.rua,
        numero: formEndereco.numero,
        bairro: formEndereco.bairro,
        cidade: formEndereco.cidade,
        estado: formEndereco.estado,
        cep: formEndereco.cep,
        complemento:
          formEndereco.complemento,
        padrao: formEndereco.padrao,
      },

      itens: produtos.map(
        (produto) => ({
          productId: produto.id,
          nome: produto.nome,
          quantidade:
            produto.quantidade,
          preco: produto.preco,
          medida:
            produto.tamanho ||
            produto.cor ||
            "-",
        })
      ),
    };

    const pedidos =
      JSON.parse(
        sessionStorage.getItem(
          "pedidos"
        )
      ) || [];

    pedidos.push(novoPedido);

    sessionStorage.setItem(
      "pedidos",
      JSON.stringify(pedidos)
    );

    setAlerta({
      type: "sucesso",
      message:
        "Pagamento realizado com sucesso! Compra finalizada.",
    });

    setTimeout(() => {
      navigate("/perfil", {
        state: {
          secao: "pedidos",
        },
      });
    }, 1800);
  };

  return (
    <div className="checkout-container">

      {/* =================================================
          ALERTA
      ================================================= */}

      {alerta && (
        <Alert
          type={alerta.type}
          message={alerta.message}
          onClose={() =>
            setAlerta(null)
          }
        />
      )}

      {/* =================================================
          TÍTULO
      ================================================= */}

      <div className="checkout-titulo">
        Caixa
      </div>

      {/* =================================================
          ENDEREÇO DE ENTREGA
      ================================================= */}

      <div className="endereco-box">

        <h3>
          <img
            src={iconLocalizacao}
            alt="Localização"
            className="icone-endereco"
          />

          Endereço de entrega
        </h3>

        <div className="endereco-info">

          {existeEndereco ? (
            <>
              <span className="nome-telefone">

                {formEndereco.nome ||
                  "Nome cadastrado"}

                {" "}

                {formEndereco.telefone
                  ? formatarTelefone(
                      formEndereco.telefone
                    )
                  : ""}

              </span>

              <span className="endereco">

                {formEndereco.rua}

                {formEndereco.numero
                  ? `, ${formEndereco.numero}`
                  : ""}

                {formEndereco.complemento
                  ? `, ${formEndereco.complemento}`
                  : ""}

                {formEndereco.bairro
                  ? `, ${formEndereco.bairro}`
                  : ""}

                {formEndereco.cidade
                  ? `, ${formEndereco.cidade}`
                  : ""}

                {formEndereco.estado
                  ? `, ${formEndereco.estado}`
                  : ""}

                {formEndereco.cep
                  ? `, ${formEndereco.cep}`
                  : ""}

              </span>

              {formEndereco.padrao && (
                <button
                  type="button"
                  className="btn-padrao"
                >
                  Padrão
                </button>
              )}

              <button
                type="button"
                className="trocar-endereco"
                onClick={() =>
                  setAbrirSelecionarEndereco(
                    true
                  )
                }
              >
                Alterar endereço
              </button>
            </>
          ) : (
            <>
              <span className="nenhum-endereco">
                Nenhum endereço cadastrado
              </span>

              <button
                type="button"
                className="trocar-endereco"
                onClick={() =>
                  setAbrirSelecionarEndereco(
                    true
                  )
                }
              >
                Adicionar endereço
              </button>
            </>
          )}

        </div>
      </div>

      {/* =================================================
          PRODUTOS
      ================================================= */}

      <div className="produtos-box">

        <div className="cabecalho-produtos">

          <span className="titulo-produtos">
            Produtos pedidos
          </span>

          <span>
            Preço unitário
          </span>

          <span>
            Quantia
          </span>

          <span>
            Subtotal de itens
          </span>

        </div>

        {produtos.map(
          (produto) => (

            <div
              key={produto.id}
              className="produto-checkout"
            >

              <div className="produto-info">

                <img
                  src={produto.img}
                  alt={produto.nome}
                />

                <div>

                  <h4>
                    {produto.nome}
                  </h4>

                  {produto.tamanho && (
                    <div className="tamanho-produto">
                      {produto.tamanho}
                    </div>
                  )}

                  {produto.cor && (
                    <div
                      className="cor-produto"
                      style={{
                        backgroundColor:
                          getCorHex(
                            produto.cor
                          ),
                      }}
                    />
                  )}

                </div>

              </div>

              <div className="preco-unitario">
                R$ {produto.preco.toFixed(2)}
              </div>

              <div className="quantidade-produto">
                {produto.quantidade}
              </div>

              <div className="subtotal-produto">
                R${" "}
                {(
                  produto.preco *
                  produto.quantidade
                ).toFixed(2)}
              </div>

            </div>
          )
        )}

      </div>

      {/* =================================================
          CUPOM E PAGAMENTO
      ================================================= */}

      <div className="checkout-extra">

        {/* =================================================
            CUPOM
        ================================================= */}

        <div className="cupom-box">

          <h3 className="titulo-cupom">

            <img
              src={iconCupom}
              alt="Cupom"
              className="icone-cupom"
            />

            Cupom Maresia

          </h3>

          <div className="cupom-conteudo">

            <input
              type="text"
              placeholder="Cupom"
              value={cupom}
              onChange={(e) =>
                setCupom(
                  e.target.value
                )
              }
            />

            <button
              className="btn-cupom"
              onClick={validarCupom}
            >
              Aplicar
            </button>

            <div className="desconto-total">

              <span className="texto-desconto">
                Desconto total:
              </span>

              <span className="valor-desconto">
                R$ 0,00
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            PAGAMENTO
        ================================================= */}

        <div className="pagamento-box">

          <h3>
            Método de pagamento
          </h3>

          {/* PIX */}

          <div className="opcao-pagamento">

            <input
              type="radio"
              name="pagamento"
              value="pix"
              checked={
                pagamento === "pix"
              }
              onChange={(e) => {

                setPagamento(
                  e.target.value
                );

                setCartaoSelecionado(
                  null
                );

              }}
            />

            <span>
              Pix
            </span>

          </div>

          {/* DÉBITO */}

          <div className="opcao-pagamento">

            <input
              type="radio"
              name="pagamento"
              value="debito"
              checked={
                pagamento === "debito"
              }
              onChange={(e) => {

                setPagamento(
                  e.target.value
                );

                const cartaoPadrao =
                  cartoes.find(
                    (cartao) =>
                      cartao.tipo ===
                        "debito" &&
                      cartao.padrao
                  );

                setCartaoSelecionado(
                  cartaoPadrao || null
                );

              }}
            />

            <span>
              Cartão de débito
            </span>

          </div>

          {/* CRÉDITO */}

          <div className="opcao-pagamento">

            <input
              type="radio"
              name="pagamento"
              value="cartao"
              checked={
                pagamento === "cartao"
              }
              onChange={(e) => {

                setPagamento(
                  e.target.value
                );

                const cartaoPadrao =
                  cartoes.find(
                    (cartao) =>
                      cartao.tipo ===
                        "cartao" &&
                      cartao.padrao
                  );

                setCartaoSelecionado(
                  cartaoPadrao || null
                );

              }}
            />

            <span>
              Cartão de crédito
            </span>

          </div>

          {/* =================================================
              CARTÃO DE CRÉDITO
          ================================================= */}

          {pagamento === "cartao" && (

            <div className="cartao-box">

              {cartoesDoTipo.length === 0 ? (

                <div className="nenhum-cartao">

                  <span>
                    Nenhum cartão cadastrado.
                  </span>

                  <button
                    type="button"
                    className="adicionar-cartao"
                    onClick={
                      abrirAdicionarCartao
                    }
                  >
                    Adicionar cartão
                  </button>

                </div>

              ) : (

                <>
                  {cartoesDoTipo.map(
                    (cartao) => (

                      <div
                        key={cartao.id}
                        className="cartao-info"
                      >

                        <div className="cartao-dados">

                          <img
                            src={
                              iconMastercard
                            }
                            alt="MasterCard"
                            className="icone-mastercard"
                          />

                          <div className="texto-cartao">

                            <span className="tipo-cartao">
                              Master Card
                            </span>

                            <span className="credito-cartao">
                              Crédito
                            </span>

                          </div>

                        </div>

                        <span className="numero-cartao">

                          **** **** ****{" "}

                          {cartao.ultimosDigitos ||
                            "XXXX"}

                        </span>

                        <button
                          className="trocar-cartao"
                          type="button"
                          onClick={() =>
                            setSelecionarCartaoAberto(
                              true
                            )
                          }
                        >
                          Trocar
                        </button>

                      </div>
                    )
                  )}

                </>
              )}

              {cartoesDoTipo.length > 0 &&
                cartaoSelecionado?.padrao && (

                  <button
                    type="button"
                    className="btn-padrao"
                  >
                    Padrão
                  </button>

                )}

            </div>

          )}

          {/* =================================================
              CARTÃO DE DÉBITO
          ================================================= */}

          {pagamento === "debito" && (

            <div className="cartao-box">

              {cartoesDoTipo.length === 0 ? (

                <div className="nenhum-cartao">

                  <span>
                    Nenhum cartão cadastrado.
                  </span>

                  <button
                    type="button"
                    className="adicionar-cartao"
                    onClick={
                      abrirAdicionarCartao
                    }
                  >
                    Adicionar cartão
                  </button>

                </div>

              ) : (

                <>
                  {cartoesDoTipo.map(
                    (cartao) => (

                      <div
                        key={cartao.id}
                        className="cartao-info"
                      >

                        <div className="cartao-dados">

                          <img
                            src={
                              iconMastercard
                            }
                            alt="MasterCard"
                            className="icone-mastercard"
                          />

                          <div className="texto-cartao">

                            <span className="tipo-cartao">
                              Master Card
                            </span>

                            <span className="credito-cartao">
                              Débito
                            </span>

                          </div>

                        </div>

                        <span className="numero-cartao">

                          **** **** ****{" "}

                          {cartao.ultimosDigitos ||
                            "XXXX"}

                        </span>

                        <button
                          className="trocar-cartao"
                          type="button"
                          onClick={() =>
                            setSelecionarCartaoAberto(
                              true
                            )
                          }
                        >
                          Trocar
                        </button>

                      </div>
                    )
                  )}

                </>
              )}

              {cartoesDoTipo.length > 0 &&
                cartaoSelecionado?.padrao && (

                  <button
                    type="button"
                    className="btn-padrao"
                  >
                    Padrão
                  </button>

                )}

            </div>

          )}

        </div>

        {/* =================================================
            RESUMO
        ================================================= */}

        <div className="resumo-compra">

          <p>

            <span>
              Total de produtos:
            </span>

            <strong>
              R$ {total.toFixed(2)}
            </strong>

          </p>

          <p>

            <span>
              Total de frete:
            </span>

            <strong>
              R$ 0,00
            </strong>

          </p>

          <p>

            <span>
              Total de descontos:
            </span>

            <strong>
              R$ 0,00
            </strong>

          </p>

          <p className="total-final">

            <span>
              Total a pagar:
            </span>

            <strong>
              R$ {total.toFixed(2)}
            </strong>

          </p>

          <hr className="linha-finalizar" />

          <button
            className="btn-finalizar"
            onClick={() => {

              if (
                pagamento === "cartao" ||
                pagamento === "debito"
              ) {

                if (
                  cartoesDoTipo.length === 0
                ) {

                  setAlerta({
                    type: "erro",
                    message:
                      "Cadastre um cartão antes de continuar.",
                  });

                  return;
                }

                setModalParcelasAberto(
                  true
                );

                return;
              }

              if (
                pagamento === "pix"
              ) {

                setModalPixAberto(
                  true
                );

                return;
              }

              setAlerta({
                type: "erro",
                message:
                  "Selecione um método de pagamento.",
              });

            }}
          >
            Fazer compra
          </button>

        </div>

      </div>

      {/* =================================================
          MODAL DE ENDEREÇO
      ================================================= */}

      <SelecionarEnderecoModal
        aberto={
          abrirSelecionarEndereco
        }

        onClose={() =>
          setAbrirSelecionarEndereco(
            false
          )
        }

        onSelecionarEndereco={(
          endereco
        ) => {

          setFormEndereco({
            nome:
              endereco.nome || "",

            telefone:
              endereco.telefone || "",

            cep:
              endereco.cep || "",

            estado:
              endereco.estado || "",

            cidade:
              endereco.cidade || "",

            bairro:
              endereco.bairro || "",

            rua:
              endereco.rua || "",

            numero:
              endereco.numero || "",

            complemento:
              endereco.complemento || "",

            padrao:
              endereco.padrao || false,
          });

          setAbrirSelecionarEndereco(
            false
          );

        }}

        onExcluirEndereco={
          excluirEndereco
        }
      />

      {/* =================================================
          MODAL DE SELEÇÃO DE CARTÃO
      ================================================= */}

      <SelecionarCartaoModal
        aberto={
          selecionarCartaoAberto
        }

        onClose={() =>
          setSelecionarCartaoAberto(
            false
          )
        }

        cartoes={
          cartoes
        }

        pagamento={
          pagamento
        }

        cartaoSelecionado={
          cartaoSelecionado
        }

        onSelecionarCartao={(
          cartao
        ) => {
          setCartaoSelecionado(
            cartao
          );
        }}

        onAdicionarCartao={() => {

          setSelecionarCartaoAberto(
            false
          );

          abrirAdicionarCartao();

        }}

        onExcluirCartao={
          excluirCartao
        }
      />

      {/* =================================================
          MODAL DE CARTÃO
      ================================================= */}

      <AdicionarCartaoModal
        aberto={
          modalCartaoAberto
        }

        onClose={() =>
          setModalCartaoAberto(
            false
          )
        }

        onSalvar={
          salvarCartao
        }

        formCartao={
          formCartao
        }

        setFormCartao={
          setFormCartao
        }

        tipoPagamento={
          pagamento
        }
      />

      {/* =================================================
          MODAL DE PARCELAS
      ================================================= */}

      <SelecionarParcelasModal
        aberto={
          modalParcelasAberto
        }

        onClose={() =>
          setModalParcelasAberto(
            false
          )
        }

        total={total}

        tipoPagamento={
          pagamento
        }

        onConfirmar={() => {

          setModalParcelasAberto(
            false
          );

          finalizarCompra();

        }}
      />

      {/* =================================================
          MODAL PIX
      ================================================= */}

      <ModalPix
        aberto={
          modalPixAberto
        }

        onClose={() =>
          setModalPixAberto(
            false
          )
        }

        onConfirmar={() => {

          setModalPixAberto(
            false
          );

          finalizarCompra();

        }}
      />

    </div>
  );
}