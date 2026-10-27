
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Images from "../assets/img";
import "../assets/css/perfil.css";
import { useTranslation } from "react-i18next";
import { getStoredUser, setStoredUser, updateUser, logout } from "../utils/auth";

// ==================== API SERVICE ====================
const API_URL = "http://localhost:3000";

const addressService = {
  async getAll(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/addresses`);
    if (!response.ok) throw new Error("Erro ao buscar endereços");
    return response.json();
  },
  async create(userId, data) {
    const response = await fetch(`${API_URL}/users/${userId}/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar endereço");
    return response.json();
  },
  async update(userId, addressId, data) {
    const response = await fetch(`${API_URL}/users/${userId}/addresses/${addressId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar endereço");
    return response.json();
  },
  async remove(userId, addressId) {
    const response = await fetch(`${API_URL}/users/${userId}/addresses/${addressId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao excluir endereço");
    return true;
  },
  async setDefault(userId, addressId) {
    const response = await fetch(`${API_URL}/users/${userId}/addresses/${addressId}/default`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao definir padrão");
    return response.json();
  },
};

const cardService = {
  async getAll(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/cards`);
    if (!response.ok) throw new Error("Erro ao buscar cartões");
    return response.json();
  },
  async create(userId, data) {
    const response = await fetch(`${API_URL}/users/${userId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao adicionar cartão");
    return response.json();
  },
  async remove(userId, cardId) {
    const response = await fetch(`${API_URL}/users/${userId}/cards/${cardId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao excluir cartão");
    return true;
  },
  async setDefault(userId, cardId) {
    const response = await fetch(`${API_URL}/users/${userId}/cards/${cardId}/default`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao definir padrão");
    return response.json();
  },
};

const notificationService = {
  async getAll(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/notifications`);
    if (!response.ok) throw new Error("Erro ao buscar notificações");
    return response.json();
  },
  async markRead(userId, notifId) {
    const response = await fetch(`${API_URL}/users/${userId}/notifications/${notifId}/read`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao marcar notificação");
    return response.json();
  },
};

const reviewService = {
  async create(productId, reviewData) {
    const user = getStoredUser();
    if (!user) throw new Error("Usuário não está logado");

    const rating = reviewData.rating || reviewData.estrelas;
    const comment = reviewData.comment || reviewData.comentario || "";

    const payload = {
      estrelas: Number(rating),
      comentario: comment,
      userId: user.id,
      productId: Number(productId),
    };

    const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try { errorData = JSON.parse(errorText); }
      catch { errorData = { message: "Erro ao criar avaliação" }; }
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  },
};

export default function Perfil() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== SEÇÃO ATIVA (NOVO) =====
  const [secaoAtiva, setSecaoAtiva] = useState("dados"); // dados | enderecos | cartoes | pedidos | notificacoes

  const [modoEdicao, setModoEdicao] = useState(false);
  const [generoDropdownAberto, setGeneroDropdownAberto] = useState(false);
  const [formData, setFormData] = useState({
    nome: "", dataNascimento: "", telefone: "", cpf: "", genero: "", email: "",
  });
  const [userId, setUserId] = useState(null);

  const mapeamentoGeneros = {
    pt: { Feminino: "F", Masculino: "M", Outro: "O" },
    en: { Female: "F", Male: "M", Other: "O" },
    codigoParaPt: { F: "Feminino", M: "Masculino", O: "Outro" },
    codigoParaEn: { F: "Female", M: "Male", O: "Other" },
  };

  const mapeamentoPagamentos = {
    codigoParaPt: { cartao: "Cartão de crédito", pix: "PIX", boleto: "Boleto" },
    codigoParaEn: { cartao: "Credit card", pix: "PIX", boleto: "Bank slip" },
  };

  const traduzirGeneroDoBanco = (g) => {
    if (!g) return "";
    return i18n.language === "en"
      ? mapeamentoGeneros.codigoParaEn[g] || g
      : mapeamentoGeneros.codigoParaPt[g] || g;
  };

  const traduzirFormaPagamento = (p) => {
    if (!p) return "";
    return i18n.language === "en"
      ? mapeamentoPagamentos.codigoParaEn[p] || p
      : mapeamentoPagamentos.codigoParaPt[p] || p;
  };

  const obterOpcoesGenero = () =>
    i18n.language === "en"
      ? ["Female", "Male", "Other"]
      : ["Feminino", "Masculino", "Outro"];

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) navigate("/cadastro");
  }, [navigate]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUserId(storedUser.id);
      setFormData({
        nome: storedUser.name || "",
        dataNascimento: storedUser.birthdate ? storedUser.birthdate.split("T")[0] : "",
        telefone: storedUser.phone || "",
        cpf: storedUser.cpf || "",
        genero: traduzirGeneroDoBanco(storedUser.gender) || "",
        email: storedUser.email || "",
      });
    }
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setFormData((prev) => ({
        ...prev,
        genero: traduzirGeneroDoBanco(storedUser.gender) || "",
      }));
    }
  }, [i18n.language]);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const validarFormulario = async (e) => {
    e.preventDefault();
    const { nome, dataNascimento, telefone, cpf, genero, email } = formData;

    const cpfValido = /^\d{11}$/.test(cpf.replace(/\D/g, ""));
    if (!cpfValido) {
      mostrarNotificacao(t("CPF deve conter exatamente 11 números."), "error");
      return;
    }

    const telefoneNumerico = telefone.replace(/\D/g, "");
    if (!/^\d{10,11}$/.test(telefoneNumerico)) {
      mostrarNotificacao(t("Telefone deve conter entre 10 e 11 dígitos e apenas números."), "error");
      return;
    }

    if (!genero) {
      mostrarNotificacao(t("Por favor, selecione um gênero."), "error");
      return;
    }

    try {
      const generoCodigo =
        i18n.language === "en"
          ? mapeamentoGeneros.en[genero]
          : mapeamentoGeneros.pt[genero];

      const payload = {
        name: nome,
        email,
        birthdate: dataNascimento ? new Date(dataNascimento).toISOString() : null,
        cpf: cpf ? cpf.replace(/\D/g, "") : undefined,
        gender: generoCodigo || genero,
        phone: telefone ? telefone.replace(/\D/g, "") : undefined,
      };

      const res = await updateUser(payload);
      const newUser = res.user || res;
      setStoredUser(newUser);
      mostrarNotificacao(t("Dados atualizados com sucesso"), "success");
      setModoEdicao(false);
    } catch (err) {
      mostrarNotificacao(err.message || t("Falha ao atualizar dados"), "error");
    }
  };

  const handleSair = async () => {
    try { await logout(); navigate("/"); }
    catch (error) { console.error("Erro ao fazer logout:", error); }
  };

  // ===================== PEDIDOS =====================
  const [pedidos, setPedidos] = useState([]);
  const [enderecosPedidos, setEnderecosPedidos] = useState({});
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(false);
  const [aberto, setAberto] = useState({});
  const [etapas, setEtapas] = useState({});
  const [avaliacoes, setAvaliacoes] = useState({});
  const [itensAvaliar, setItensAvaliar] = useState({});
  const [overlayAtivo, setOverlayAtivo] = useState(false);
  const [comentariosAvaliacao, setComentariosAvaliacao] = useState({});
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState({});
  const [notificacao, setNotificacao] = useState({ visivel: false, tipo: "info", mensagem: "" });

  // ===== NOVOS ESTADOS =====
  const [abaPedido, setAbaPedido] = useState("preparando"); // preparando | caminho | finalizado | cancelado | reembolso
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [pedidoAvaliando, setPedidoAvaliando] = useState(null);

  const [enderecos, setEnderecos] = useState([]);
  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [formEndereco, setFormEndereco] = useState({
    nome: "", telefone: "", cep: "", estado: "", cidade: "", bairro: "",
    rua: "", numero: "", complemento: "",
  });

  const [cartoes, setCartoes] = useState([]);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [formCartao, setFormCartao] = useState({
    numero: "", validade: "", cvv: "", nome: "",
    cep: "", estado: "", cidade: "", rua: "", numero_end: "", complemento: "",
  });

  const [notificacoes, setNotificacoes] = useState([]);

  const mostrarNotificacao = (mensagem, tipo = "info", duracao = 3000) => {
    setNotificacao({ visivel: true, tipo, mensagem });
    setTimeout(() => setNotificacao((prev) => ({ ...prev, visivel: false })), duracao);
  };

  // ===== CARREGAR DADOS DAS NOVAS SEÇÕES =====
  useEffect(() => {
    if (!userId) return;
    carregarEnderecos();
    carregarCartoes();
    carregarNotificacoes();
  }, [userId]);

  const carregarEnderecos = async () => {
    try { setEnderecos(await addressService.getAll(userId)); }
    catch (e) { console.error(e); }
  };

  const carregarCartoes = async () => {
    try { setCartoes(await cardService.getAll(userId)); }
    catch (e) { console.error(e); }
  };

  const carregarNotificacoes = async () => {
    try { setNotificacoes(await notificationService.getAll(userId)); }
    catch (e) { console.error(e); }
  };

  // ===== AÇÕES ENDEREÇOS =====
  const abrirNovoEndereco = () => {
    setEnderecoEditando(null);
    setFormEndereco({
      nome: "", telefone: "", cep: "", estado: "", cidade: "", bairro: "",
      rua: "", numero: "", complemento: "",
    });
    setModalEnderecoAberto(true);
  };

  useEffect(() => {
    if (location.state?.secao === "pedidos") {
      setSecaoAtiva("pedidos");
      setAbaPedido("preparando");
    }

    if (location.state?.secao === "enderecos") {
      setSecaoAtiva("enderecos");

      if (location.state?.abrirModalEndereco) {
        abrirNovoEndereco();
      }
    }
  }, [location.state]);

  const abrirEditarEndereco = (end) => {
    setEnderecoEditando(end);
    setFormEndereco({
      nome: end.nome || "", telefone: end.telefone || "",
      cep: end.cep || "", estado: end.estado || "", cidade: end.cidade || "",
      bairro: end.bairro || "", rua: end.rua || "", numero: end.numero || "",
      complemento: end.complemento || "",
    });
    setModalEnderecoAberto(true);
  };

  const buscarCEP = async (cep, tipo = "endereco") => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        mostrarNotificacao(t("CEP não encontrado"), "error");
        return;
      }

      if (tipo === "endereco") {
        setFormEndereco((prev) => ({
          ...prev,
          estado: data.uf || "",
          cidade: data.localidade || "",
          bairro: data.bairro || "",
          rua: data.logradouro || "",
        }));
      }

      if (tipo === "cartao") {
        setFormCartao((prev) => ({
          ...prev,
          estado: data.uf || "",
          cidade: data.localidade || "",
          rua: data.logradouro || "",
        }));
      }
    } catch (error) {
      console.error(error);
      mostrarNotificacao(t("Erro ao buscar CEP"), "error");
    }
  };

  const salvarEndereco = async (e) => {
    e.preventDefault();
    try {
      if (enderecoEditando) {
        await addressService.update(userId, enderecoEditando.id, formEndereco);
        mostrarNotificacao(t("Endereço atualizado"), "success");
      } else {
        await addressService.create(userId, formEndereco);
        mostrarNotificacao(t("Endereço adicionado"), "success");
      }
      setModalEnderecoAberto(false);
      carregarEnderecos();
    } catch (err) {
      mostrarNotificacao(err.message, "error");
    }
  };

  const excluirEndereco = async (id) => {
    if (!window.confirm(t("Deseja realmente excluir este endereço?"))) return;
    try {
      await addressService.remove(userId, id);
      mostrarNotificacao(t("Endereço excluído"), "success");
      carregarEnderecos();
    } catch (err) { mostrarNotificacao(err.message, "error"); }
  };

  const definirEnderecoPadrao = async (id) => {
    try {
      await addressService.setDefault(userId, id);
      mostrarNotificacao(t("Endereço definido como padrão"), "success");
      carregarEnderecos();
    } catch (err) { mostrarNotificacao(err.message, "error"); }
  };

  // ===== AÇÕES CARTÕES =====
  const abrirNovoCartao = () => {
    setFormCartao({
      numero: "", validade: "", cvv: "", nome: "",
      cep: "", estado: "", cidade: "", rua: "", numero_end: "", complemento: "",
    });
    setModalCartaoAberto(true);
  };

  const salvarCartao = async (e) => {
    e.preventDefault();
    try {
      await cardService.create(userId, formCartao);
      mostrarNotificacao(t("Cartão adicionado"), "success");
      setModalCartaoAberto(false);
      carregarCartoes();
    } catch (err) { mostrarNotificacao(err.message, "error"); }
  };

  const excluirCartao = async (id) => {
    if (!window.confirm(t("Deseja realmente excluir este cartão?"))) return;
    try {
      await cardService.remove(userId, id);
      mostrarNotificacao(t("Cartão excluído"), "success");
      carregarCartoes();
    } catch (err) { mostrarNotificacao(err.message, "error"); }
  };

  const definirCartaoPadrao = async (id) => {
    try {
      await cardService.setDefault(userId, id);
      mostrarNotificacao(t("Cartão definido como padrão"), "success");
      carregarCartoes();
    } catch (err) { mostrarNotificacao(err.message, "error"); }
  };

  // ===================== PEDIDOS - CARREGAMENTO (mantido) =====================
  const carregarEnderecosDoBanco = async () => {
    if (!userId) return;
    setCarregandoEnderecos(true);
    try {
      const enderecos = await addressService.getAll(userId);
      setPedidos((pedidosAtuais) =>
        pedidosAtuais.map((pedido) => ({
          ...pedido,
          endereco:
            enderecos.find(
              (end) =>
                end.cep === pedido.endereco?.cep &&
                end.numero === pedido.endereco?.numero
            ) || enderecos[0] || pedido.endereco,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar endereços do banco:", error);
    } finally { setCarregandoEnderecos(false); }
  };

  useEffect(() => { if (userId) carregarEnderecosDoBanco(); }, [userId]);

  useEffect(() => {
    let novosPedidos = location.state?.pedidos || [];
    if (novosPedidos.length === 0) {
      const pedidosSessao = JSON.parse(sessionStorage.getItem("pedidos")) || [];
      novosPedidos = pedidosSessao.map((p) => ({
        ...p, id: p.id || Math.random().toString(36).substr(2, 9),
      }));
    }

    const agora = Date.now();
    const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

    const pedidosFiltrados = novosPedidos.filter((pedido) => {
      if (pedido.etapas?.[0] !== 3) return true;
      if (!pedido.timestamp && !pedido.data) return true;
      const timestampPedido = pedido.timestamp
        ? Number(pedido.timestamp)
        : new Date(pedido.data).getTime();
      return agora - timestampPedido <= SETE_DIAS_MS;
    });

    setPedidos(pedidosFiltrados);
    if (pedidosFiltrados.length !== novosPedidos.length) {
      sessionStorage.setItem("pedidos", JSON.stringify(pedidosFiltrados));
    }

    const etapasIniciais = {};
    const avaliacoesIniciais = {};
    pedidosFiltrados.forEach((p) => {
      etapasIniciais[p.id] = p.etapas?.[0] || 0;
      avaliacoesIniciais[p.id] = 0;
    });
    setEtapas(etapasIniciais);
    setAvaliacoes(avaliacoesIniciais);
  }, [location.state]);

  useEffect(() => {
    document.body.style.overflow = (overlayAtivo || modalAvaliacaoAberto || modalEnderecoAberto || modalCartaoAberto) ? "hidden" : "auto";
  }, [overlayAtivo, modalAvaliacaoAberto, modalEnderecoAberto, modalCartaoAberto]);

  useEffect(() => {
    const verificarPedidosExpirados = () => {
      setPedidos((pedidosAtuais) => {
        const agora = Date.now();
        const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;
        const pedidosFiltrados = pedidosAtuais.filter((pedido) => {
          if (pedido.etapas?.[0] !== 3) return true;
          if (!pedido.timestamp && !pedido.data) return true;
          const timestampPedido = pedido.timestamp
            ? Number(pedido.timestamp)
            : new Date(pedido.data).getTime();
          return agora - timestampPedido <= SETE_DIAS_MS;
        });
        if (pedidosFiltrados.length !== pedidosAtuais.length) {
          sessionStorage.setItem("pedidos", JSON.stringify(pedidosFiltrados));
        }
        return pedidosFiltrados;
      });
    };
    const intervalo = setInterval(verificarPedidosExpirados, 3600000);
    return () => clearInterval(intervalo);
  }, []);

  const togglePedido = (id) => setAberto((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleEtapa = (pedidoId, index) => setEtapas((prev) => ({ ...prev, [pedidoId]: index }));

  const toggleItemAvaliar = (pedidoId, idx) => {
    setItensAvaliar((prev) => {
      const atuais = prev[pedidoId] || [];
      return {
        ...prev,
        [pedidoId]: atuais.includes(idx) ? atuais.filter((i) => i !== idx) : [...atuais, idx],
      };
    });
  };

  const avaliarProduto = (pedidoId, idx, estrelas) => {
    setAvaliacoes((prev) => ({ ...prev, [`${pedidoId}-${idx}`]: estrelas }));
  };

  const concluirAvaliacao = async (pedidoId, itemIdx) => {
    const chave = `${pedidoId}-${itemIdx}`;
    const estrelas = avaliacoes[chave];
    const comentario = comentariosAvaliacao[chave] || "";
    const pedido = pedidos.find((p) => p.id === pedidoId);
    const produto = pedido?.itens[itemIdx];

    if (!estrelas) {
      mostrarNotificacao(t("Por favor, selecione uma avaliação em estrelas."), "warning");
      return;
    }
    if (!produto?.productId) {
      mostrarNotificacao(t("Produto não encontrado."), "error");
      return;
    }
    if (enviandoAvaliacao[chave]) return;

    setEnviandoAvaliacao((prev) => ({ ...prev, [chave]: true }));

    try {
      await reviewService.create(produto.productId, { estrelas, comentario });
      setOverlayAtivo(true);
      setTimeout(() => {
        setOverlayAtivo(false);
        setItensAvaliar((prev) => {
          const itensSelecionados = prev[pedidoId] || [];
          const novosItens = itensSelecionados.filter((idx) => idx !== itemIdx);
          if (itensSelecionados.length > 0 && novosItens.length === 0) {
            setTimeout(() => {
              setPedidos((pedidosAtuais) => {
                const pedidosAtualizados = pedidosAtuais.filter((p) => p.id !== pedidoId);
                sessionStorage.setItem("pedidos", JSON.stringify(pedidosAtualizados));
                return pedidosAtualizados;
              });
            }, 500);
          }
          return { ...prev, [pedidoId]: novosItens };
        });
        setAvaliacoes((prev) => { const n = { ...prev }; delete n[chave]; return n; });
        setComentariosAvaliacao((prev) => { const n = { ...prev }; delete n[chave]; return n; });
        setEnviandoAvaliacao((prev) => { const n = { ...prev }; delete n[chave]; return n; });
      }, 2000);
    } catch (error) {
      mostrarNotificacao(t("Erro ao enviar avaliação: ") + (error.message || ""), "error", 4000);
      setEnviandoAvaliacao((prev) => { const n = { ...prev }; delete n[chave]; return n; });
    }
  };
  // ===== FILTRO DE PEDIDOS POR ABA =====
  const pedidosFiltradosPorAba = pedidos.filter((p) => {
    const status = p.status || (p.etapas?.[0] === 3 ? "finalizado" : p.etapas?.[0] >= 2 ? "caminho" : "preparando");
    return status === abaPedido;
  });

  // ===== ABRIR MODAL AVALIAÇÃO =====
  const abrirAvaliacaoPedido = (pedido) => {
    setPedidoAvaliando(pedido);
    setModalAvaliacaoAberto(true);
  };

  // ===================== RENDER =====================
  return (
    <main>
      <div className="pagina">

        {/* SIDEBAR */}
        <aside>
          <div className="usuario">
            <img src={Images.UserIcon || Images.Pagamento} alt="user" />
            <div>
              <h2>{formData.nome || t("Nome do perfil")}</h2>
              <button className="link-editar-perfil" onClick={() => { setSecaoAtiva("dados"); setModoEdicao(true); }}>
                ✎ {t("Editar perfil")}
              </button>
            </div>
          </div>

          <hr />

          <div className="menu-grupo">
            <p className="menu-titulo">{t("Minha conta")}</p>
            <ul>
              <li>
                <a className={secaoAtiva === "dados" ? "ativo" : ""} onClick={() => setSecaoAtiva("dados")}>
                  {t("Dados pessoais")}
                </a>
              </li>
              <li>
                <a className={secaoAtiva === "enderecos" ? "ativo" : ""} onClick={() => setSecaoAtiva("enderecos")}>
                  {t("Endereços")}
                </a>
              </li>
              <li>
                <a className={secaoAtiva === "cartoes" ? "ativo" : ""} onClick={() => setSecaoAtiva("cartoes")}>
                  {t("Cartões")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <ul>
              <li>
                <a className={secaoAtiva === "pedidos" ? "ativo" : ""} onClick={() => setSecaoAtiva("pedidos")}>
                  {t("Meus pedidos")}
                </a>
              </li>
              <li>
                <a className={secaoAtiva === "notificacoes" ? "ativo" : ""} onClick={() => setSecaoAtiva("notificacoes")}>
                  {t("Notificações")}
                </a>
              </li>
            </ul>
          </div>
          <hr />

          <ul>
            <li><a onClick={handleSair}>{t("Sair da conta")}</a></li>
            <li><Link to="/sacola">{t("Sacola")}</Link></li>
          </ul>
        </aside>

        {/* CONTEUDO PRINCIPAL */}
        <section className="conteudo-usuario">

          {/* ============ DADOS PESSOAIS ============ */}
          {secaoAtiva === "dados" && (
            <>
              <h2 className="conteudo-titlle">{t("Meu perfil")}</h2>
              <p className="subtitulo">{t("Gerencie sua conta")}</p>

              {!modoEdicao ? (
                <div className="dados-grid">
                  <div><p className="dado-label">{t("Nome")}</p><p>{formData.nome}</p></div>
                  <div><p className="dado-label">{t("Data de nascimento")}</p><p>{formData.dataNascimento}</p></div>
                  <div><p className="dado-label">{t("Telefone")}</p><p>{formData.telefone}</p></div>
                  <div><p className="dado-label">{t("CPF")}</p><p>{formData.cpf}</p></div>
                  <div><p className="dado-label">{t("E-mail")}</p><p>{formData.email}</p></div>
                  <div><p className="dado-label">{t("Gênero")}</p><p>{formData.genero}</p></div>
                  <button className="editar" onClick={() => setModoEdicao(true)}>{t("Editar")}</button>
                </div>
              ) : (
                <form onSubmit={validarFormulario}>
                  <div className="campo">
                    <label>{t("Nome")}</label>
                    <input value={formData.nome} onChange={(e) => handleChange("nome", e.target.value)} required />
                  </div>
                  <div className="campo">
                    <label>{t("Data de nascimento")}</label>
                    <input type="date" value={formData.dataNascimento} onChange={(e) => handleChange("dataNascimento", e.target.value)} required />
                  </div>
                  <div className="campo">
                    <label>{t("Telefone")}</label>
                    <input value={formData.telefone} onChange={(e) => handleChange("telefone", e.target.value)} required />
                  </div>
                  <div className="campo">
                    <label>{t("CPF")}</label>
                    <input value={formData.cpf} onChange={(e) => handleChange("cpf", e.target.value)} required />
                  </div>
                  <div className="campo">
                    <label>{t("E-mail")}</label>
                    <input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
                  </div>
                  <div className="campo">
                    <label>{t("Gênero")}</label>
                    <div className={`dropdown-genero ${generoDropdownAberto ? "ativo" : ""}`}>
                      <div className="dropdown-selecionado" onClick={() => setGeneroDropdownAberto(!generoDropdownAberto)}>
                        {formData.genero || "\u00A0"}
                      </div>
                      <ul className="dropdown-opcoes">
                        {obterOpcoesGenero().map((opcao) => (
                          <li key={opcao} onClick={() => { handleChange("genero", opcao); setGeneroDropdownAberto(false); }}>
                            {opcao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button type="submit" className="salvar">{t("Salvar alterações")}</button>
                </form>
              )}
            </>
          )}

          {/* ============ ENDEREÇOS ============ */}
          {secaoAtiva === "enderecos" && (
            <>
              <div className="secao-header">
                <h2 className="conteudo-titlle">{t("Meus endereços")}</h2>
                <button className="btn-adicionar" onClick={abrirNovoEndereco}>
                  + {t("Adicionar endereço")}
                </button>
              </div>

              {enderecos.length === 0 ? (
                <p className="empty-msg">{t("Você ainda não tem endereços cadastrados.")}</p>
              ) : (
                <div className="lista-cards">
                  {enderecos.map((end) => (
                    <div key={end.id} className="card-item">
                      <div className="card-info">
                        <p className="card-titulo">{t("Endereço")}</p>
                        <p className="card-linha"><strong>{end.nome}</strong> | {end.telefone}</p>
                        <p className="card-linha">{end.rua}, {end.numero} {end.complemento && `- ${end.complemento}`}</p>
                        <p className="card-linha">{end.bairro}</p>
                        <p className="card-linha">{end.cidade} - {end.estado}, {t("CEP")}: {end.cep}</p>
                        {end.padrao && <span className="badge-padrao">{t("Padrão")}</span>}
                      </div>
                      <div className="card-acoes">
                        <a onClick={() => abrirEditarEndereco(end)}>{t("Editar")}</a> |
                        <a onClick={() => excluirEndereco(end.id)}>{t("Excluir")}</a>
                        {!end.padrao && (
                          <button className="btn-padrao" onClick={() => definirEnderecoPadrao(end.id)}>
                            {t("Definir como padrão")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ============ CARTÕES ============ */}
          {secaoAtiva === "cartoes" && (
            <>
              <div className="secao-header">
                <h2 className="conteudo-titlle">{t("Meus cartões")}</h2>
                <button className="btn-adicionar" onClick={abrirNovoCartao}>
                  + {t("Adicionar cartão")}
                </button>
              </div>

              {cartoes.length === 0 ? (
                <p className="empty-msg">{t("Você ainda não tem cartões cadastrados.")}</p>
              ) : (
                <div className="lista-cards">
                  {cartoes.map((c) => (
                    <div key={c.id} className="card-item card-cartao">
                      <div className="bandeira">{c.bandeira || "💳"}</div>
                      <div className="card-info">
                        <p className="card-titulo">{c.bandeira || "Cartão"}</p>
                        <p className="card-linha">{c.tipo || "Crédito"}</p>
                        {c.padrao && <span className="badge-padrao">{t("Padrão")}</span>}
                      </div>
                      <div className="card-numero">**** **** **** {c.ultimos4 || (c.numero || "").slice(-4)}</div>
                      <div className="card-acoes">
                        <a onClick={() => excluirCartao(c.id)}>{t("Excluir")}</a>
                        {!c.padrao && (
                          <button className="btn-padrao" onClick={() => definirCartaoPadrao(c.id)}>
                            {t("Definir como padrão")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ============ PEDIDOS ============ */}
          {secaoAtiva === "pedidos" && (
            <>
              <div className="abas-pedidos">
                {[
                  { id: "preparando", label: t("Preparando") },
                  { id: "caminho", label: t("A caminho") },
                  { id: "finalizado", label: t("Finalizado") },
                  { id: "cancelado", label: t("Cancelado") },
                  { id: "reembolso", label: t("Reembolso") },
                ].map((aba) => (
                  <button
                    key={aba.id}
                    className={`aba-pedido ${abaPedido === aba.id ? "ativa" : ""}`}
                    onClick={() => setAbaPedido(aba.id)}
                  >
                    {aba.label}
                  </button>
                ))}
              </div>

              {carregandoEnderecos && (
                <p style={{ color: "#666", fontSize: "13px" }}>{t("Carregando informações...")}</p>
              )}

              {pedidosFiltradosPorAba.length === 0 ? (
                <p className="empty-msg">{t("Você ainda não realizou nenhum pedido.")}</p>
              ) : (
                <div>
                  {pedidosFiltradosPorAba.map((pedido) => (
                    <div key={pedido.id}>
                      <div
                        className={`pedido-header ${aberto[pedido.id] ? "aberto" : ""}`}
                        onClick={() => togglePedido(pedido.id)}
                      >
                        <span>
                          {pedido.codigo
                            ? `${t("Pedido")} #${pedido.codigo}`
                            : `${t("Pedido")} - ${pedido.data}`}
                        </span>
                        <span className="seta-css"></span>
                      </div>

                      {aberto[pedido.id] && (
                        <div className="pedido-detalhes">
                          {/* AVISO PRAZO AVALIACAO */}
                          {etapas[pedido.id] === 3 && (pedido.timestamp || pedido.data) && (() => {
                            const agora = Date.now();
                            const ts = pedido.timestamp ? Number(pedido.timestamp) : new Date(pedido.data).getTime();
                            const dias = 7 - Math.floor((agora - ts) / (24 * 60 * 60 * 1000));
                            if (dias <= 3 && dias > 0) {
                              return (
                                <p style={{ color: "#a71e2a", fontWeight: 500, marginBottom: 10 }}>
                                  {dias === 1
                                    ? t("Último dia para avaliar este pedido!")
                                    : t("Você tem ${diasRestantes} dias para avaliar este pedido.", { diasRestantes: dias })}
                                </p>
                              );
                            }
                            return null;
                          })()}

                          {/* ETAPAS */}
                          <div className="status-etapas">
                            {[
                              { nome: t("Pagamento"), img: Images.Pagamento },
                              { nome: t("Preparo"), img: Images.Preparo },
                              { nome: t("Entrega"), img: Images.Entrega },
                              { nome: t("Chegou!"), img: Images.Chegou },
                            ].map((etapa, index) => (
                              <div key={index} className="etapa-wrapper">
                                <div
                                  className={`etapa ${etapas[pedido.id] >= index ? "ativa" : ""}`}
                                  onClick={() => toggleEtapa(pedido.id, index)}
                                >
                                  <img src={etapa.img} alt={etapa.nome} />
                                  <span>{etapa.nome}</span>
                                </div>
                                {index < 3 && (
                                  <div className={`linha ${etapas[pedido.id] > index ? "ativa" : ""}`} />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* ITENS */}
                          <div>
                            {pedido.itens.map((item, i) => (
                              <div key={i} className="linha-item">
                                <span>{item.nome}</span>
                                <span>{item.medida || "-"}</span>
                                <span>{item.quantidade}</span>
                                <span>R$ {item.preco.toFixed(2).replace(".", ",")}</span>
                              </div>
                            ))}
                          </div>

                          {/* INFORMACOES */}
                          <div className="infos-pedido">
                            <p>{t("Pagamento")}: {traduzirFormaPagamento(pedido.pagamento)}</p>
                            <p>
                              {t("Endereço")}:<br />
                              {pedido.endereco?.rua}, {pedido.endereco?.numero}<br />
                              {pedido.endereco?.bairro}<br />
                              {pedido.endereco?.cidade} - {pedido.endereco?.estado}<br />
                              {t("CEP")}: {pedido.endereco?.cep}
                              {pedido.endereco?.complemento && (<><br />{t("Complemento")}: {pedido.endereco.complemento}</>)}
                            </p>
                          </div>

                          {/* BOTÃO AVALIAR PEDIDO */}
                          {etapas[pedido.id] === 3 && (
                            <button className="btn-avaliar-pedido" onClick={() => abrirAvaliacaoPedido(pedido)}>
                              {t("Avaliar pedido")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ============ NOTIFICAÇÕES ============ */}
          {secaoAtiva === "notificacoes" && (
            <>
              <h2 className="conteudo-titlle">{t("Notificações")}</h2>
              {notificacoes.length === 0 ? (
                <p className="empty-msg">{t("Você não tem notificações.")}</p>
              ) : (
                <ul className="lista-notif">
                  {notificacoes.map((n) => (
                    <li key={n.id} className={`notif-item ${n.lida ? "lida" : ""}`}>
                      <p className="notif-titulo">{n.titulo}</p>
                      <p className="notif-msg">{n.mensagem}</p>
                      <span className="notif-data">{n.data}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

        </section>
      </div>

      {/* ============ MODAL ENDEREÇO ============ */}
      {modalEnderecoAberto && (
        <div className="modal-overlay" onClick={() => setModalEnderecoAberto(false)}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <h3>{enderecoEditando ? t("Editar endereço") : t("Novo Endereço")}</h3>
            <form onSubmit={salvarEndereco} className="form-modal">
              <div className="form-row">
                <input placeholder={t("Nome Completo")} value={formEndereco.nome} onChange={(e) => setFormEndereco({ ...formEndereco, nome: e.target.value })} required />
                <input placeholder={t("Número de Telefone")} value={formEndereco.telefone} onChange={(e) => setFormEndereco({ ...formEndereco, telefone: e.target.value })} required />
              </div>
              <input
                placeholder={t("CEP")}
                value={formEndereco.cep}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormEndereco({ ...formEndereco, cep: val });
                  const cepLimpo = val.replace(/\D/g, "");
                  if (cepLimpo.length === 8) buscarCEP(cepLimpo, "endereco");
                }}
                onBlur={(e) => buscarCEP(e.target.value, "endereco")}
                required
              />
              <input placeholder={t("Estado - Cidade")} value={formEndereco.estado} onChange={(e) => setFormEndereco({ ...formEndereco, estado: e.target.value })} required />
              <input placeholder={t("Cidade")} value={formEndereco.cidade} onChange={(e) => setFormEndereco({ ...formEndereco, cidade: e.target.value })} required />
              <input placeholder={t("Bairro")} value={formEndereco.bairro} onChange={(e) => setFormEndereco({ ...formEndereco, bairro: e.target.value })} required />
              <div className="form-row">
                <input placeholder={t("Rua / Avenida")} value={formEndereco.rua} onChange={(e) => setFormEndereco({ ...formEndereco, rua: e.target.value })} required />
                <input placeholder={t("Número")} value={formEndereco.numero} onChange={(e) => setFormEndereco({ ...formEndereco, numero: e.target.value })} required />
              </div>
              <input placeholder={t("Complemento (apto, bloco, etc) ")} value={formEndereco.complemento} onChange={(e) => setFormEndereco({ ...formEndereco, complemento: e.target.value })} />
              <div className="modal-acoes">
                <button type="button" className="btn-cancelar" onClick={() => setModalEnderecoAberto(false)}>{t("Cancelar")}</button>
                <button type="submit" className="btn-enviar">{t("Enviar")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL CARTÃO ============ */}
      {modalCartaoAberto && (
        <div className="modal-overlay" onClick={() => setModalCartaoAberto(false)}>
          <div className="modal-conteudo modal-largo" onClick={(e) => e.stopPropagation()}>
            <h3>{t("Adicionar Cartão de Crédito")}</h3>
            <div className="aviso-seguro">🔒 {t("Os detalhes do seu cartão estão protegidos.")}</div>

            <form onSubmit={salvarCartao} className="form-modal">
              <p className="form-secao">{t("Informações do Cartão")}</p>
              <input placeholder={t("Número do Cartão")} value={formCartao.numero} onChange={(e) => setFormCartao({ ...formCartao, numero: e.target.value })} required />
              <div className="form-row">
                <input placeholder={t("Data de Validade (MM/AA)")} value={formCartao.validade} onChange={(e) => setFormCartao({ ...formCartao, validade: e.target.value })} required />
                <input placeholder={t("CVV")} value={formCartao.cvv} onChange={(e) => setFormCartao({ ...formCartao, cvv: e.target.value })} required />
              </div>
              <input placeholder={t("Nome no Cartão")} value={formCartao.nome} onChange={(e) => setFormCartao({ ...formCartao, nome: e.target.value })} required />

              <p className="form-secao">{t("Endereço de Cobrança")}</p>
              <input
                placeholder={t("CEP")}
                value={formCartao.cep}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormCartao({ ...formCartao, cep: val });
                  const cepLimpo = val.replace(/\D/g, "");
                  if (cepLimpo.length === 8) buscarCEP(cepLimpo, "cartao");
                }}
                onBlur={(e) => buscarCEP(e.target.value, "cartao")}
                required
              />
              <input placeholder={t("Estado")} value={formCartao.estado} onChange={(e) => setFormCartao({ ...formCartao, estado: e.target.value })} required />
              <input placeholder={t("Cidade")} value={formCartao.cidade} onChange={(e) => setFormCartao({ ...formCartao, cidade: e.target.value })} required />
              <input placeholder={t("Rua / Avenida")} value={formCartao.rua} onChange={(e) => setFormCartao({ ...formCartao, rua: e.target.value })} required />
              <input placeholder={t("Número")} value={formCartao.numero_end} onChange={(e) => setFormCartao({ ...formCartao, numero_end: e.target.value })} required />
              <input placeholder={t("Complemento (apto, bloco, etc.)")} value={formCartao.complemento} onChange={(e) => setFormCartao({ ...formCartao, complemento: e.target.value })} />

              <div className="modal-acoes">
                <button type="button" className="btn-cancelar" onClick={() => setModalCartaoAberto(false)}>{t("Cancelar")}</button>
                <button type="submit" className="btn-enviar">{t("Finalizar")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL AVALIAÇÃO PEDIDO ============ */}
      {modalAvaliacaoAberto && pedidoAvaliando && (
        <div className="modal-overlay" onClick={() => setModalAvaliacaoAberto(false)}>
          <div className="modal-conteudo modal-avaliacao" onClick={(e) => e.stopPropagation()}>
            <h3 className="titulo-avaliacao">{t("Avalie sua experiência conosco!")}</h3>

            <textarea
              placeholder={t("Detalhe sua avaliação")}
              value={comentariosAvaliacao[`pedido-${pedidoAvaliando.id}`] || ""}
              onChange={(e) => setComentariosAvaliacao((prev) => ({ ...prev, [`pedido-${pedidoAvaliando.id}`]: e.target.value }))}
              className="textarea-avaliacao"
            />

            <div className="estrelas-grandes">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`estrela ${(avaliacoes[`pedido-${pedidoAvaliando.id}`] || 0) >= n ? "ativa" : ""}`}
                  onClick={() => setAvaliacoes((prev) => ({ ...prev, [`pedido-${pedidoAvaliando.id}`]: n }))}
                >★</span>
              ))}
              <span className="nota-numerica">
                {(avaliacoes[`pedido-${pedidoAvaliando.id}`] || 0).toFixed(1)}
              </span>
            </div>

            <div className="modal-acoes">
              <button className="btn-cancelar" onClick={() => setModalAvaliacaoAberto(false)}>{t("Cancelar")}</button>
              <button
                className="btn-enviar"
                onClick={async () => {
                  const estrelas = avaliacoes[`pedido-${pedidoAvaliando.id}`];
                  const comentario = comentariosAvaliacao[`pedido-${pedidoAvaliando.id}`] || "";
                  if (!estrelas) {
                    mostrarNotificacao(t("Por favor, selecione uma avaliação em estrelas."), "warning");
                    return;
                  }
                  try {
                    const primeiro = pedidoAvaliando.itens?.[0];
                    if (primeiro?.productId) {
                      await reviewService.create(primeiro.productId, { estrelas, comentario });
                    }
                    setModalAvaliacaoAberto(false);
                    setOverlayAtivo(true);
                    setTimeout(() => setOverlayAtivo(false), 2000);
                  } catch (err) {
                    mostrarNotificacao(err.message, "error");
                  }
                }}
              >{t("Enviar avaliação")}</button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE SUCESSO */}
      {overlayAtivo && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 9999, color: "white", fontSize: "24px", fontWeight: "bold",
        }}>
          {t("Avaliação enviada, obrigada!")}
        </div>
      )}

      {/* NOTIFICACAO */}
      {notificacao.visivel && (
        <div
          className={`alerta ${notificacao.tipo === "success" ? "sucesso" : notificacao.tipo === "error" ? "erro" : "info"}`}
          style={{
            position: "fixed", top: "20px", right: "20px", padding: "15px 20px",
            borderRadius: "8px", color: "#fff", fontFamily: "'Arimo', sans-serif",
            zIndex: 10000, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "300px", maxWidth: "400px", animation: "slideIn 0.3s ease-out",
            fontWeight: "500",
            borderLeft: `4px solid ${notificacao.tipo === "success" ? "#1e7e34" : notificacao.tipo === "error" ? "#a71e2a" : "#303030"}`,
            cursor: "pointer",
          }}
          onClick={() => setNotificacao((prev) => ({ ...prev, visivel: false }))}
        >
          {notificacao.mensagem}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </main>
  );
}

