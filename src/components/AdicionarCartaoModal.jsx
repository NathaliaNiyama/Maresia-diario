
export default function AdicionarCartaoModal({
  aberto,
  onClose,
  onSalvar,
  formCartao,
  setFormCartao,
}) {
  if (!aberto) return null;

  const atualizarCampo = (campo, valor) => {
    setFormCartao((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const atualizarValidade = (valor) => {
    let validade = valor.replace(/\D/g, "");

    if (validade.length > 2) {
      validade = `${validade.slice(0, 2)}/${validade.slice(2, 4)}`;
    }

    atualizarCampo("validade", validade);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-conteudo modal-cartao">
        <h2>Adicionar cartão</h2>

        <p className="aviso-seguranca">
          Cadastre as informações do seu cartão para facilitar suas
          próximas compras.
        </p>

        <form className="form-modal" onSubmit={onSalvar}>
          <div className="form-row">
            <label htmlFor="bandeira-cartao">
              Bandeira do cartão
            </label>

            <select
              id="bandeira-cartao"
              value={formCartao.bandeira}
              onChange={(e) =>
                atualizarCampo("bandeira", e.target.value)
              }
              required
            >
              <option value="">Selecione a bandeira</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Elo">Elo</option>
              <option value="American Express">American Express</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="nome-cartao">
              Nome impresso no cartão
            </label>

            <input
              id="nome-cartao"
              type="text"
              placeholder="Nome do titular"
              value={formCartao.nome}
              onChange={(e) =>
                atualizarCampo("nome", e.target.value)
              }
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="ultimos4-cartao">
              Últimos quatro dígitos
            </label>

            <input
              id="ultimos4-cartao"
              type="text"
              placeholder="0000"
              value={formCartao.ultimos4}
              onChange={(e) =>
                atualizarCampo(
                  "ultimos4",
                  e.target.value.replace(/\D/g, "").slice(0, 4)
                )
              }
              maxLength={4}
              inputMode="numeric"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="validade-cartao">
              Validade
            </label>

            <input
              id="validade-cartao"
              type="text"
              placeholder="MM/AA"
              value={formCartao.validade}
              onChange={(e) => atualizarValidade(e.target.value)}
              maxLength={5}
              inputMode="numeric"
              required
            />
          </div>

          <label className="endereco-padrao">
            <input
              type="checkbox"
              checked={formCartao.favorito}
              onChange={(e) =>
                atualizarCampo("favorito", e.target.checked)
              }
            />

            Tornar este cartão padrão
          </label>

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
              Salvar cartão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
