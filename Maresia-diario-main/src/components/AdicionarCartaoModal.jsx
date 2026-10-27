import "../assets/css/checkout.css";
import iconMastercard from "../assets/img/icon-mastercard.png";

export default function AdicionarCartaoModal({
  aberto,
  onClose,
  onSalvar,
  formCartao,
  setFormCartao,
}) {
  if (!aberto) return null;

  const handleChange = (campo, valor) => {
    setFormCartao((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const formatarNumeroCartao = (valor) => {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 16);

    return numeros
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatarValidade = (valor) => {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 4);

    if (numeros.length > 2) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return numeros;
  };

  const formatarCPF = (valor) => {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 11);

    if (numeros.length <= 3) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }

    if (numeros.length <= 9) {
      return `${numeros.slice(0, 3)}.${numeros.slice(
        3,
        6
      )}.${numeros.slice(6)}`;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(
      3,
      6
    )}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-conteudo modal-cartao"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Adicionar cartão</h3>

        {/* IMAGEM */}
        <div className="cartao-imagem-formulario">
          <img
            src={iconMastercard}
            alt="Master Card"
            className="imagem-mastercard-formulario"
          />

          <span>Grupo Master Card</span>
        </div>

        <form
          onSubmit={onSalvar}
          className="form-modal"
        >
          {/* NÚMERO DO CARTÃO */}
          <input
            type="text"
            placeholder="Número do cartão"
            value={formCartao.numero}
            onChange={(e) =>
              handleChange(
                "numero",
                formatarNumeroCartao(
                  e.target.value
                )
              )
            }
            inputMode="numeric"
            maxLength={19}
            required
          />

          {/* NOME DO PORTADOR */}
          <input
            type="text"
            placeholder="Nome do portador"
            value={formCartao.nome}
            onChange={(e) =>
              handleChange(
                "nome",
                e.target.value
              )
            }
            required
          />

          {/* VALIDADE + CVV */}
          <div className="form-row">
            <input
              type="text"
              placeholder="Validade (MM/AA)"
              value={formCartao.validade}
              onChange={(e) =>
                handleChange(
                  "validade",
                  formatarValidade(
                    e.target.value
                  )
                )
              }
              inputMode="numeric"
              maxLength={5}
              required
            />

            <input
              type="password"
              placeholder="CVV"
              value={formCartao.cvv}
              onChange={(e) =>
                handleChange(
                  "cvv",
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4)
                )
              }
              inputMode="numeric"
              maxLength={4}
              required
            />
          </div>

          {/* CPF */}
          <input
            type="text"
            placeholder="CPF do titular"
            value={formCartao.cpf || ""}
            onChange={(e) =>
              handleChange(
                "cpf",
                formatarCPF(
                  e.target.value
                )
              )
            }
            inputMode="numeric"
            maxLength={14}
            required
          />

          {/* CARTÃO PADRÃO */}
          <div className="endereco-padrao cartao-padrao-modal">
            <input
              type="checkbox"
              id="cartao-padrao"
              checked={
                formCartao.padrao || false
              }
              onChange={(e) =>
                handleChange(
                  "padrao",
                  e.target.checked
                )
              }
            />

            <span>
              Tornar este cartão padrão
            </span>
          </div>

          {/* BOTÕES */}
          <div className="modal-acoes">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-enviar"
            >
              Adicionar cartão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}