import { useEffect, useState } from "react";
import "../assets/css/perfil.css";

export default function SelecionarEnderecoModal({
  aberto,
  onClose,
  onSelecionarEndereco,
  onExcluirEndereco,
}) {
  const [modo, setModo] = useState("lista");
  const [enderecoEditando, setEnderecoEditando] =
    useState(null);

  const [enderecos, setEnderecos] = useState([]);

  const enderecoVazio = {
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
  };

  const [formEndereco, setFormEndereco] =
    useState(enderecoVazio);

  /*
   * QUANDO O MODAL ABRIR,
   * SEMPRE COMEÇA NA LISTA DE ENDEREÇOS
   */
  useEffect(() => {
    if (aberto) {
      setModo("lista");
      setEnderecoEditando(null);
      setFormEndereco(enderecoVazio);
    }
  }, [aberto]);

  if (!aberto) return null;

  /*
   * FORMATA O TELEFONE
   */
  const formatarTelefone = (telefone) => {
    const numeros = String(telefone || "")
      .replace(/\D/g, "");

    if (!numeros) {
      return "";
    }

    // Brasil com código do país
    if (numeros.length >= 12) {
      const pais = numeros.slice(0, 2);
      const ddd = numeros.slice(2, 4);
      const numero = numeros.slice(4);

      if (numero.length === 9) {
        return `(+${pais}) ${ddd} ${numero.slice(
          0,
          5
        )}-${numero.slice(5)}`;
      }

      return `(+${pais}) ${ddd} ${numero}`;
    }

    // Caso o usuário tenha cadastrado apenas DDD + número
    if (numeros.length === 11) {
      const ddd = numeros.slice(0, 2);
      const numero = numeros.slice(2);

      return `(+55) ${ddd} ${numero.slice(
        0,
        5
      )}-${numero.slice(5)}`;
    }

    return telefone;
  };

  /*
   * MÁSCARA DO TELEFONE
   */
  const handleTelefoneChange = (e) => {
    let numeros = e.target.value.replace(
      /\D/g,
      ""
    );

    if (numeros.length > 11) {
      numeros = numeros.slice(0, 11);
    }

    let telefoneFormatado = numeros;

    if (numeros.length > 2) {
      telefoneFormatado = `(${numeros.slice(
        0,
        2
      )}) ${numeros.slice(2)}`;
    }

    if (numeros.length > 7) {
      telefoneFormatado = `(${numeros.slice(
        0,
        2
      )}) ${numeros.slice(
        2,
        7
      )}-${numeros.slice(7)}`;
    }

    setFormEndereco((prev) => ({
      ...prev,
      telefone: telefoneFormatado,
    }));
  };

  /*
   * MÁSCARA DO CEP + BUSCA AUTOMÁTICA
   */
  const handleCepChange = async (e) => {
    let cep = e.target.value.replace(
      /\D/g,
      ""
    );

    if (cep.length > 8) {
      cep = cep.slice(0, 8);
    }

    const cepFormatado =
      cep.length > 5
        ? `${cep.slice(0, 5)}-${cep.slice(5)}`
        : cep;

    setFormEndereco((prev) => ({
      ...prev,
      cep: cepFormatado,
    }));

    if (cep.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cep}/json/`
        );

        const data = await response.json();

        if (data.erro) {
          return;
        }

        setFormEndereco((prev) => ({
          ...prev,
          cep: cepFormatado,
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
      }
    }
  };

  /*
   * ABRIR FORMULÁRIO PARA NOVO ENDEREÇO
   */
  const adicionarNovoEndereco = () => {
    setEnderecoEditando(null);

    setFormEndereco({
      ...enderecoVazio,
    });

    setModo("formulario");
  };

  /*
   * ABRIR FORMULÁRIO PARA EDITAR
   */
  const editarEndereco = (endereco) => {
    setEnderecoEditando(endereco);

    setFormEndereco({
      ...endereco,
    });

    setModo("formulario");
  };

  /*
   * EXCLUIR ENDEREÇO
   *
   * A exclusão acontece imediatamente,
   * sem confirmação.
   */
  const excluirEndereco = (endereco) => {
    setEnderecos((prev) =>
      prev.filter(
        (item) => item.id !== endereco.id
      )
    );

    if (onExcluirEndereco) {
      onExcluirEndereco(endereco);
    }
  };

  /*
   * SALVAR ENDEREÇO
   */
  const salvarEndereco = (e) => {
    e.preventDefault();

    let novoEndereco = {
      ...formEndereco,
    };

    /*
     * SE FOR PADRÃO,
     * OS OUTROS DEIXAM DE SER PADRÃO
     */
    if (novoEndereco.padrao) {
      setEnderecos((prev) =>
        prev.map((endereco) => ({
          ...endereco,
          padrao: false,
        }))
      );
    }

    /*
     * EDITANDO ENDEREÇO EXISTENTE
     */
    if (enderecoEditando) {
      novoEndereco = {
        ...novoEndereco,
        id: enderecoEditando.id,
      };

      setEnderecos((prev) =>
        prev.map((endereco) =>
          endereco.id === enderecoEditando.id
            ? novoEndereco
            : novoEndereco.padrao
              ? {
                  ...endereco,
                  padrao: false,
                }
              : endereco
        )
      );
    } else {
      /*
       * NOVO ENDEREÇO
       */
      novoEndereco = {
        ...novoEndereco,
        id: Date.now(),
      };

      setEnderecos((prev) => [
        ...prev.map((endereco) =>
          novoEndereco.padrao
            ? {
                ...endereco,
                padrao: false,
              }
            : endereco
        ),
        novoEndereco,
      ]);
    }

    /*
     * MANDA O ENDEREÇO PARA O CHECKOUT
     */
    onSelecionarEndereco(novoEndereco);

    /*
     * VOLTA PARA A LISTA
     */
    setModo("lista");
    setEnderecoEditando(null);
  };

  /*
   * SELECIONAR UM ENDEREÇO DA LISTA
   */
  const selecionarEndereco = (endereco) => {
    onSelecionarEndereco(endereco);
    onClose();
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
            LISTA DE ENDEREÇOS
        ================================== */}

        {modo === "lista" && (
          <>
            <div className="modal-header">
              <h3>Meu endereço</h3>

              <button
                type="button"
                className="modal-fechar"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <div className="lista-enderecos">

              {enderecos.length === 0 ? (
                <div className="nenhum-endereco-modal">
                  <p>
                    Nenhum endereço cadastrado
                  </p>
                </div>
              ) : (
                enderecos.map((endereco) => (
                  <div
                    key={endereco.id}
                    className="endereco-cadastrado"
                  >

                    <div className="endereco-selecao">

                      <input
                        type="radio"
                        name="enderecoSelecionado"
                        checked={false}
                        onChange={() =>
                          selecionarEndereco(
                            endereco
                          )
                        }
                      />

                      <div className="endereco-detalhes">

                        {/* NOME + TELEFONE + EDITAR */}

                        <div className="endereco-nome">

                          <strong>
                            {endereco.nome}
                          </strong>

                          {endereco.telefone && (
                            <span>
                              {" "}
                              {formatarTelefone(
                                endereco.telefone
                              )}
                            </span>
                          )}

                          <button
                            type="button"
                            className="btn-editar-endereco"
                            onClick={() =>
                              editarEndereco(
                                endereco
                              )
                            }
                          >
                            Editar
                          </button>

                        </div>

                        {/* ENDEREÇO */}

                        <div className="endereco-linha">
                          {endereco.rua},{" "}
                          {endereco.numero}

                          {endereco.complemento
                            ? `, ${endereco.complemento}`
                            : ""}
                        </div>

                        <div className="endereco-linha">
                          {endereco.bairro},{" "}
                          {endereco.cidade},{" "}
                          {endereco.estado},{" "}
                          {endereco.cep}
                        </div>

                        {/* PADRÃO + EXCLUIR */}

                        <div className="acoes-endereco">

                          {endereco.padrao && (
                            <button
                              type="button"
                              className="btn-padrao"
                            >
                              Padrão
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-excluir-endereco"
                            onClick={() =>
                              excluirEndereco(
                                endereco
                              )
                            }
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

            <div className="modal-footer">
              <button
                type="button"
                className="btn-adicionar-endereco"
                onClick={
                  adicionarNovoEndereco
                }
              >
                + Adicione um Novo Endereço
              </button>
            </div>
          </>
        )}

        {/* =================================
            FORMULÁRIO
        ================================== */}

        {modo === "formulario" && (
          <>
            <div className="modal-header">
              <h3>
                {enderecoEditando
                  ? "Editar endereço"
                  : "Novo Endereço"}
              </h3>
            </div>

            <form
              onSubmit={salvarEndereco}
              className="form-modal"
            >

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
                onChange={
                  handleTelefoneChange
                }
                required
              />

              <input
                placeholder="CEP"
                value={formEndereco.cep}
                onChange={handleCepChange}
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
                value={
                  formEndereco.complemento
                }
                onChange={(e) =>
                  setFormEndereco({
                    ...formEndereco,
                    complemento:
                      e.target.value,
                  })
                }
              />

              <label className="endereco-padrao">
                <input
                  type="checkbox"
                  checked={
                    formEndereco.padrao
                  }
                  onChange={(e) =>
                    setFormEndereco(
                      (prev) => ({
                        ...prev,
                        padrao:
                          e.target.checked,
                      })
                    )
                  }
                />

                <span>
                  Definir como endereço padrão
                </span>
              </label>

              <div className="modal-acoes">

                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() =>
                    setModo("lista")
                  }
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="btn-enviar"
                >
                  Salvar endereço
                </button>

              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
}