import { useEffect, useState } from "react";
import "../assets/css/checkout.css";
import Images from "../assets/img";
import iconLocalizacao from "../assets/img/icon_Localização.png";
import iconCupom from "../assets/img/icon-cupom.png";
import iconMastercard from "../assets/img/icon-mastercard.png";
import Alert from "../components/alerta";
import { useNavigate } from "react-router-dom";
import SelecionarEnderecoModal from "../components/SelecionarEnderecoModal";
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
  const [produtos, setProdutos] = useState([]);
  const [pagamento, setPagamento] = useState("");

  const [alerta, setAlerta] = useState(null);
  useEffect(() => {
    const dados = localStorage.getItem("checkoutSelecionados");

    if (dados) {
      setProdutos(JSON.parse(dados));
    }
  }, []);

  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#ccc";
  };

  const total = produtos.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const [cupom, setCupom] = useState("");


  const validarCupom = () => {

    if (!cupom.trim()) {
      setAlerta({
        type: "erro",
        message: "Digite um cupom."
      });
      return;
    }

    if (cupom !== "FRETEGRATIS") {
      setAlerta({
        type: "erro",
        message: "Cupom inválido ou expirado."
      });
      return;
    }

    setAlerta({
      type: "sucesso",
      message: "Cupom aplicado com sucesso!"
    });
  };

  const [abrirSelecionarEndereco, setAbrirSelecionarEndereco] = useState(false);

  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);

  const [modalParcelasAberto, setModalParcelasAberto] = useState(false);

  const [modalPixAberto, setModalPixAberto] = useState(false);

  const [formCartao, setFormCartao] = useState({
    numero: "",
    validade: "",
    cvv: "",
    nome: "",
    cep: "",
    estado: "",
    cidade: "",
    rua: "",
    numero_end: "",
    complemento: "",
  });
  const salvarCartao = (e) => {
    e.preventDefault();

    console.log(formCartao);

    setModalCartaoAberto(false);
  };

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data = await response.json();

      if (data.erro) return;

      setFormCartao((prev) => ({
        ...prev,
        estado: data.uf || "",
        cidade: data.localidade || "",
        rua: data.logradouro || "",
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const finalizarCompra = () => {
    const novoPedido = {
      id: Date.now(),
      codigo: Math.floor(Math.random() * 100000),
      data: new Date().toLocaleDateString("pt-BR"),
      timestamp: Date.now(),

      status: "preparando",
      etapas: [0],

      pagamento: pagamento,

      endereco: {
        rua: "Nome_da_rua",
        numero: "XXX",
        bairro: "Bairro",
        cidade: "Cidade",
        estado: "Estado",
        cep: "00000-000",
        complemento: "Complemento",
      },

      itens: produtos.map((produto) => ({
        productId: produto.id,
        nome: produto.nome,
        quantidade: produto.quantidade,
        preco: produto.preco,
        medida: produto.tamanho || produto.cor || "-",
      })),
    };

    const pedidos =
      JSON.parse(sessionStorage.getItem("pedidos")) || [];

    pedidos.push(novoPedido);

    sessionStorage.setItem(
      "pedidos",
      JSON.stringify(pedidos)
    );

    setAlerta({
      type: "sucesso",
      message: "Pagamento realizado com sucesso! Compra finalizada."
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
          <strong>Nome_cadastrado (+XX) XXXXX-XXXX</strong>

          <span>
            Nome_da_rua, XXX, complemento, bairro, cidade, estado, CEP
          </span>
          <div className="acoes-endereco">
            <button className="btn-padrao">
              Padrão
            </button>

            <span
              className="trocar-endereco"
              onClick={() => setAbrirSelecionarEndereco(true)}
            >
              Trocar
            </span>
          </div>

        </div>
      </div>


      <div className="produtos-box">

        <div className="cabecalho-produtos">
          <span className="titulo-produtos">Produtos pedidos</span>
          <span>Preço unitário</span>
          <span>Quantia</span>
          <span>Subtotal de itens</span>
        </div>

        {produtos.map((produto) => (
          <div key={produto.id} className="produto-checkout">

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
              R$ {produto.preco.toFixed(2)}
            </div>

            <div className="quantidade-produto">
              {produto.quantidade}
            </div>

            <div className="subtotal-produto">
              R$ {(produto.preco * produto.quantidade).toFixed(2)}
            </div>

          </div>
        ))}
      </div>

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

          <div className="cupom-conteudo">
            <p>Digite o cupom para obter frete grátis!</p>

            <input
              type="text"
              placeholder="Cupom"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
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


          {pagamento === "cartao" && (
            <div className="cartao-box">
              <div className="cartao-info">

                <div className="cartao-dados">
                  <img
                    src={iconMastercard}
                    alt="MasterCard"
                    className="icone-mastercard"
                  />

                  <div className="texto-cartao">
                    <span className="tipo-cartao">Master Card</span>
                    <span className="credito-cartao">Crédito</span>
                  </div>
                </div>

                <span className="numero-cartao">
                  **** **** **** XXXX
                </span>

                <button
                  className="trocar-cartao"
                  type="button"
                  onClick={() => setModalCartaoAberto(true)}
                >
                  Trocar
                </button>

              </div>

              <button className="btn-padrao">
                Padrão
              </button>
            </div>
          )}

          {pagamento === "debito" && (
            <div className="cartao-box">
              <div className="cartao-info">

                <div className="cartao-dados">
                  <img
                    src={iconMastercard}
                    alt="MasterCard"
                    className="icone-mastercard"
                  />

                  <div className="texto-cartao">
                    <span className="tipo-cartao">Master Card</span>
                    <span className="credito-cartao">Débito</span>
                  </div>
                </div>

                <span className="numero-cartao">
                  **** **** **** XXXX
                </span>

                <button
                  className="trocar-cartao"
                  type="button"
                  onClick={() => setModalCartaoAberto(true)}
                >
                  Trocar
                </button>

              </div>

              <button className="btn-padrao">
                Padrão
              </button>
            </div>
          )}
        </div>



        <div className="resumo-compra">
          <p>
            <span>Total de produtos:</span>
            <strong>R$ {total.toFixed(2)}</strong>
          </p>

          <p>
            <span>Total de frete:</span>
            <strong>R$ 0,00</strong>
          </p>

          <p>
            <span>Total de descontos:</span>
            <strong>R$ 0,00</strong>
          </p>

          <p className="total-final">
            <span>Total a pagar:</span>
            <strong>R$ {total.toFixed(2)}</strong>
          </p>

          <hr className="linha-finalizar" />

          <button
            className="btn-finalizar"
            onClick={() => {
              if (
                pagamento === "cartao" ||
                pagamento === "debito"
              ) {
                setModalParcelasAberto(true);
              } else if (pagamento === "pix") {
                setModalPixAberto(true);
              }
            }}
          >
            Fazer compra
          </button>
        </div>

      </div>

      <SelecionarEnderecoModal
        aberto={abrirSelecionarEndereco}
        onClose={() => setAbrirSelecionarEndereco(false)}
      />

      <AdicionarCartaoModal
        aberto={modalCartaoAberto}
        onClose={() => setModalCartaoAberto(false)}
        onSalvar={salvarCartao}
        buscarCEP={buscarCEP}
        formCartao={formCartao}
        setFormCartao={setFormCartao}
      />

      <SelecionarParcelasModal
        aberto={modalParcelasAberto}
        onClose={() => setModalParcelasAberto(false)}
        total={total}
        tipoPagamento={pagamento}
        onConfirmar={() => {
          setModalParcelasAberto(false);
          finalizarCompra();
        }}
      />

      <ModalPix
        aberto={modalPixAberto}
        onClose={() => setModalPixAberto(false)}
        onConfirmar={() => {
          setModalPixAberto(false);
          finalizarCompra();
        }}
      />
    </div>

  );
}
