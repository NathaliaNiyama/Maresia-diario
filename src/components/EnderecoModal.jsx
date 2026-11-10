import { useEffect, useState } from "react";
import "../assets/css/checkout.css";
import Images from "../assets/img";
import iconLocalizacao from "../assets/img/icon_Localização.png";
import EnderecoModal from "../components/EnderecoModal";


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
  const [produtos, setProdutos] = useState([]);


  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [endereco, setEndereco] = useState(null);


  const [formEndereco, setFormEndereco] = useState({
    nome: "",
    telefone: "",
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
  });




  const abrirNovoEndereco = () => {
    setEnderecoEditando(null);


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
    });


    setModalEnderecoAberto(true);
  };


  const salvarEndereco = (e) => {
    e.preventDefault();


    setEndereco(formEndereco); // salva localmente


    setModalEnderecoAberto(false);
  };
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


  return (
    <div className="checkout-container">


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
            <button>Padrão</button>
            <button type="button" onClick={abrirNovoEndereco}>
              Trocar
            </button>
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
          <h3>Cupom Maresia</h3>


          <div className="cupom-conteudo">
            <p>Digite o cupom para obter frete grátis!</p>


            <input type="text" placeholder="Cupom" />


            <span className="desconto-total">
              Desconto total: R$ 0,00
            </span>
          </div>
        </div>


        <div className="pagamento-box">
          <h3>Método de pagamento</h3>


          <label>
            <input type="radio" name="pagamento" />
            Pix
          </label>


          <label>
            <input type="radio" name="pagamento" />
            Cartão de crédito
          </label>
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


          <button className="btn-finalizar">
            Fazer compra
          </button>
        </div>
       
        </div>
      <EnderecoModal
        open={modalEnderecoAberto}
        onClose={() => setModalEnderecoAberto(false)}
        formEndereco={formEndereco}
        setFormEndereco={setFormEndereco}
        salvarEndereco={salvarEndereco}
        enderecoEditando={enderecoEditando}
      />
    </div>




  );
}

