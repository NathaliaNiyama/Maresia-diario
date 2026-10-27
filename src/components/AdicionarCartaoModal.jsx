import "../assets/css/Perfil.css";

export default function AdicionarCartaoModal({
  aberto,
  onClose,
  formCartao,
  setFormCartao,
  onSalvar,
  buscarCEP,
}) {
  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-conteudo modal-largo"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Adicionar Cartão de Crédito</h3>

        <div className="aviso-seguro">
          🔒 Os detalhes do seu cartão estão protegidos.
        </div>

        <form onSubmit={onSalvar} className="form-modal">

          <p className="form-secao">Informações do Cartão</p>

          <input
            placeholder="Número do Cartão"
            value={formCartao.numero}
            onChange={(e) =>
              setFormCartao({
                ...formCartao,
                numero: e.target.value,
              })
            }
            required
          />

          <div className="form-row">

            <input
              placeholder="Data de Validade (MM/AA)"
              value={formCartao.validade}
              onChange={(e) =>
                setFormCartao({
                  ...formCartao,
                  validade: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="CVV"
              value={formCartao.cvv}
              onChange={(e) =>
                setFormCartao({
                  ...formCartao,
                  cvv: e.target.value,
                })
              }
              required
            />

          </div>

          <input
            placeholder="Nome no Cartão"
            value={formCartao.nome}
            onChange={(e) =>
              setFormCartao({
                ...formCartao,
                nome: e.target.value,
              })
            }
            required
          />

          <p className="form-secao">
            Endereço de Cobrança
          </p>

          <input
            placeholder="CEP"
            value={formCartao.cep}
            onChange={(e) => {
              const valor = e.target.value;

              setFormCartao({
                ...formCartao,
                cep: valor,
              });

              const cepLimpo = valor.replace(/\D/g, "");

              if (cepLimpo.length === 8) {
                buscarCEP(cepLimpo);
              }
            }}
            onBlur={(e) => buscarCEP(e.target.value)}
            required
          />

          <input
            placeholder="Estado"
            value={formCartao.estado}
            onChange={(e) =>
              setFormCartao({
                ...formCartao,
                estado: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Cidade"
            value={formCartao.cidade}
            onChange={(e) =>
              setFormCartao({
                ...formCartao,
                cidade: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Rua / Avenida"
            value={formCartao.rua}
            onChange={(e) =>
              setFormCartao({
                ...formCartao,
                rua: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Número"
            value={formCartao.numero_end}
            onChange={(e) =>
              setFormCartao({
                ...formCartao,
                numero_end: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Complemento (apto, bloco, etc.)"
            value={formCartao.complemento}
            onChange={(e) =>
              setFormCartao({
                ...formCartao,
                complemento: e.target.value,
              })
            }
          />

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
              Finalizar
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}