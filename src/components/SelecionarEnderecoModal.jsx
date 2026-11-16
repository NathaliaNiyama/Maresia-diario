
import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import "../assets/css/perfil.css";

const API_URL = "http://localhost:3000/api";

const enderecoInicial = {
  nome: "",
  telefone: "",
  cep: "",
  estado: "",
  cidade: "",
  bairro: "",
  rua: "",
  numero: "",
  complemento: "",
};

export default function SelecionarEnderecoModal({
  aberto,
  onClose,
  onSelecionar,
}) {
  const [enderecos, setEnderecos] = useState([]);
  const [usuario, setUsuario] = useState(null);

  const [formEndereco, setFormEndereco] = useState(enderecoInicial);
  const [enderecoEditando, setEnderecoEditando] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // ==========================================
  // REQUISIÇÕES AO BACKEND
  // ==========================================

  const requisicao = async (rota, opcoes = {}) => {
    const resposta = await fetch(`${API_URL}${rota}`, {
      ...opcoes,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...opcoes.headers,
      },
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || "Não foi possível realizar a operação.");
    }

    return dados;
  };

  // ==========================================
  // CARREGAR USUÁRIO E ENDEREÇOS
  // ==========================================

  const carregarEnderecos = async () => {
    try {
      setCarregando(true);
      setErro("");

      const resultadoUsuario = await getCurrentUser();
      const usuarioAtual = resultadoUsuario?.user ?? resultadoUsuario;

      if (!usuarioAtual?.id) {
        throw new Error("Não foi possível identificar o usuário.");
      }

      setUsuario(usuarioAtual);

      const resultado = await requisicao(
        `/users/${usuarioAtual.id}/addresses`
      );

      setEnderecos(resultado.addresses || []);
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (aberto) {
      carregarEnderecos();
    }
  }, [aberto]);

  // ==========================================
  // ALTERAR CAMPOS DO FORMULÁRIO
  // ==========================================

  const alterarCampo = (campo, valor) => {
    setFormEndereco((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  // ==========================================
  // BUSCAR CEP
  // ==========================================

  const buscarCEP = async () => {
    const cep = formEndereco.cep.replace(/\D/g, "");

    if (cep.length !== 8) return;

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );

      const dados = await resposta.json();

      if (dados.erro) {
        setErro("CEP não encontrado.");
        return;
      }

      setFormEndereco((anterior) => ({
        ...anterior,
        estado: dados.uf || anterior.estado,
        cidade: dados.localidade || anterior.cidade,
        bairro: dados.bairro || anterior.bairro,
        rua: dados.logradouro || anterior.rua,
      }));

      setErro("");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErro("Não foi possível consultar o CEP.");
    }
  };

  // ==========================================
  // ABRIR FORMULÁRIO PARA NOVO ENDEREÇO
  // ==========================================

  const adicionarEndereco = () => {
    setEnderecoEditando(null);

    setFormEndereco({
      ...enderecoInicial,
      nome: usuario?.name || "",
      telefone: usuario?.phone || "",
    });

    setErro("");
    setMostrarFormulario(true);
  };

  // ==========================================
  // ABRIR FORMULÁRIO PARA EDITAR
  // ==========================================

  const editarEndereco = (endereco) => {
    setEnderecoEditando(endereco.id);

    setFormEndereco({
      nome: endereco.nome || usuario?.name || "",
      telefone: endereco.telefone || usuario?.phone || "",
      cep: endereco.cep || "",
      estado: endereco.estado || "",
      cidade: endereco.cidade || "",
      bairro: endereco.bairro || "",
      rua: endereco.rua || "",
      numero: endereco.numero || "",
      complemento: endereco.complemento || "",
    });

    setErro("");
    setMostrarFormulario(true);
  };

  // ==========================================
  // SALVAR ENDEREÇO
  // ==========================================

  const salvarEndereco = async (e) => {
    e.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      const dadosEndereco = {
        ...formEndereco,
        // Se os dados forem iguais aos da conta,
        // não precisamos salvar uma personalização.
        nome:
          formEndereco.nome.trim() === usuario?.name
            ? null
            : formEndereco.nome.trim(),

        telefone:
          formEndereco.telefone.trim() === (usuario?.phone || "")
            ? null
            : formEndereco.telefone.trim(),
      };

      const editando = enderecoEditando !== null;

      const resultado = await requisicao(
        editando
          ? `/addresses/${enderecoEditando}`
          : "/addresses",
        {
          method: editando ? "PUT" : "POST",
          body: JSON.stringify(dadosEndereco),
        }
      );

      await carregarEnderecos();

      setMostrarFormulario(false);
      setEnderecoEditando(null);
      setFormEndereco(enderecoInicial);

      // Se for o primeiro endereço, ele será selecionado automaticamente.
      if (!editando && resultado.address) {
        selecionarEndereco(resultado.address);
      }
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  // ==========================================
  // SELECIONAR ENDEREÇO
  // ==========================================

  const selecionarEndereco = (endereco) => {
    if (onSelecionar) {
      onSelecionar(endereco);
    }

    onClose();
  };

  // ==========================================
  // DEFINIR FAVORITO
  // ==========================================

  const favoritarEndereco = async (id) => {
    try {
      setErro("");

      await requisicao(`/addresses/${id}/favorite`, {
        method: "PATCH",
      });

      await carregarEnderecos();
    } catch (error) {
      console.error("Erro ao favoritar endereço:", error);
      setErro(error.message);
    }
  };

  // ==========================================
  // EXCLUIR ENDEREÇO
  // ==========================================

  const excluirEndereco = async (id) => {
    // const confirmar = window.confirm(
    //   "Tem certeza de que deseja excluir este endereço?"
    // );

    // if (!confirmar) return;

    try {
      setErro("");

      await requisicao(`/addresses/${id}`, {
        method: "DELETE",
      });

      await carregarEnderecos();
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      setErro(error.message);
    }
  };

  if (!aberto) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-conteudo"
        onClick={(e) => e.stopPropagation()}
      >
        {!mostrarFormulario ? (
          <>
            <h3>Meus endereços</h3>

            {erro && (
              <p className="mensagem-erro">{erro}</p>
            )}

            {carregando ? (
              <p>Carregando endereços...</p>
            ) : enderecos.length === 0 ? (
              <p>Nenhum endereço cadastrado.</p>
            ) : (
              <div className="lista-enderecos">
                {enderecos.map((endereco) => (
                  <div
                    className="endereco-item"
                    key={endereco.id}
                  >
                    <div className="endereco-informacoes">
                      <div className="endereco-titulo">
                        <strong>{endereco.nome}</strong>

                        {endereco.favorito && (
                          <span className="endereco-favorito">
                            Padrão
                          </span>
                        )}
                      </div>

                      <p>{endereco.telefone}</p>

                      <p>
                        {endereco.rua}, {endereco.numero}
                        {endereco.complemento
                          ? `, ${endereco.complemento}`
                          : ""}
                      </p>

                      <p>
                        {endereco.bairro}, {endereco.cidade} -{" "}
                        {endereco.estado}
                      </p>

                      <p>CEP: {endereco.cep}</p>
                    </div>

                    <div className="endereco-acoes">
                      <button
                        type="button"
                        onClick={() =>
                          selecionarEndereco(endereco)
                        }
                      >
                        Usar este endereço
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          editarEndereco(endereco)
                        }
                      >
                        Editar
                      </button>

                      {!endereco.favorito && (
                        <button
                          type="button"
                          onClick={() =>
                            favoritarEndereco(endereco.id)
                          }
                        >
                          Tornar padrão
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          excluirEndereco(endereco.id)
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-acoes">
              <button
                type="button"
                className="btn-cancelar"
                onClick={onClose}
              >
                Fechar
              </button>

              <button
                type="button"
                className="btn-enviar"
                onClick={adicionarEndereco}
              >
                Adicionar endereço
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>
              {enderecoEditando
                ? "Editar endereço"
                : "Novo endereço"}
            </h3>

            <form
              onSubmit={salvarEndereco}
              className="form-modal"
            >
              <div className="form-row">
                <input
                  placeholder="Nome completo"
                  value={formEndereco.nome}
                  onChange={(e) =>
                    alterarCampo("nome", e.target.value)
                  }
                  required
                />

                <input
                  placeholder="Número de telefone"
                  value={formEndereco.telefone}
                  onChange={(e) =>
                    alterarCampo("telefone", e.target.value)
                  }
                />
              </div>

              <input
                placeholder="CEP"
                value={formEndereco.cep}
                onChange={(e) =>
                  alterarCampo("cep", e.target.value)
                }
                onBlur={buscarCEP}
                required
              />

              <input
                placeholder="Estado"
                value={formEndereco.estado}
                onChange={(e) =>
                  alterarCampo("estado", e.target.value)
                }
                required
              />

              <input
                placeholder="Cidade"
                value={formEndereco.cidade}
                onChange={(e) =>
                  alterarCampo("cidade", e.target.value)
                }
                required
              />

              <input
                placeholder="Bairro"
                value={formEndereco.bairro}
                onChange={(e) =>
                  alterarCampo("bairro", e.target.value)
                }
                required
              />

              <div className="form-row">
                <input
                  placeholder="Rua / Avenida"
                  value={formEndereco.rua}
                  onChange={(e) =>
                    alterarCampo("rua", e.target.value)
                  }
                  required
                />

                <input
                  placeholder="Número"
                  value={formEndereco.numero}
                  onChange={(e) =>
                    alterarCampo("numero", e.target.value)
                  }
                  required
                />
              </div>

              <input
                placeholder="Complemento (apto, bloco...)"
                value={formEndereco.complemento}
                onChange={(e) =>
                  alterarCampo("complemento", e.target.value)
                }
              />

              {erro && (
                <p className="mensagem-erro">{erro}</p>
              )}

              <div className="modal-acoes">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEnderecoEditando(null);
                    setErro("");
                  }}
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="btn-enviar"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar endereço"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
