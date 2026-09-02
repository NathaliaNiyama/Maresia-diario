import { useState } from "react";
import "../assets/css/perfil.css";

export default function SelecionarEnderecoModal({
  aberto,
  onClose,
}) {
  const [enderecoEditando] = useState(null);

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

  if (!aberto) return null;

  const salvarEndereco = (e) => {
    e.preventDefault();

    console.log("Endereço:", formEndereco);

    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-conteudo"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>
          {enderecoEditando
            ? "Editar endereço"
            : "Novo Endereço"}
        </h3>

        <form
          onSubmit={salvarEndereco}
          className="form-modal"
        >
          <div className="form-row">
            <input
              placeholder="Nome Completo"
              value={formEndereco.nome}
              onChange={(e) =>
                setFormEndereco({
                  ...formEndereco,
                  nome: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Número de Telefone"
              value={formEndereco.telefone}
              onChange={(e) =>
                setFormEndereco({
                  ...formEndereco,
                  telefone: e.target.value,
                })
              }
              required
            />
          </div>

          <input
            placeholder="CEP"
            value={formEndereco.cep}
            onChange={(e) =>
              setFormEndereco({
                ...formEndereco,
                cep: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Estado"
            value={formEndereco.estado}
            onChange={(e) =>
              setFormEndereco({
                ...formEndereco,
                estado: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Cidade"
            value={formEndereco.cidade}
            onChange={(e) =>
              setFormEndereco({
                ...formEndereco,
                cidade: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Bairro"
            value={formEndereco.bairro}
            onChange={(e) =>
              setFormEndereco({
                ...formEndereco,
                bairro: e.target.value,
              })
            }
            required
          />

          <div className="form-row">
            <input
              placeholder="Rua / Avenida"
              value={formEndereco.rua}
              onChange={(e) =>
                setFormEndereco({
                  ...formEndereco,
                  rua: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Número"
              value={formEndereco.numero}
              onChange={(e) =>
                setFormEndereco({
                  ...formEndereco,
                  numero: e.target.value,
                })
              }
              required
            />
          </div>

          <input
            placeholder="Complemento (Apto, bloco...)"
            value={formEndereco.complemento}
            onChange={(e) =>
              setFormEndereco({
                ...formEndereco,
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
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}