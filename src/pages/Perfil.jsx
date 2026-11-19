import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Images from "../assets/img";
import "../assets/css/perfil.css";
import { useTranslation } from "react-i18next";
import { getCurrentUser, updateUser, logout } from "../utils/auth";

const API_URL = "http://localhost:3000/api";



const extrairLista = (resposta, chave) => {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.[chave])) return resposta[chave];
  return [];
};

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

const getCorHex = (nomeCor) => paletaDeCores[nomeCor] || "#ccc";

const getImagemProduto = (item) => {
  const imagem =
    item?.image ||
    item?.img ||
    item?.image1 ||
    item?.imagem ||
    item?.images?.image1 ||
    item?.product?.image1 ||
    item?.product?.image ||
    item?.product?.images?.image1;

  if (!imagem || typeof imagem !== "string") {
    return Images.SemImagem;
  }

  if (/^(https?:)?\/\//i.test(imagem) || imagem.startsWith("data:")) {
    return imagem;
  }

  return imagem.startsWith("/")
    ? `http://localhost:3000${imagem}`
    : `http://localhost:3000/${imagem}`;
};

// ==================== ENDEREÇOS ====================

const addressService = {
  async getAll(userId) {
    const response = await fetch(
      `${API_URL}/users/${userId}/addresses`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar endereços");
    }

    const resultado = await response.json();

    return (resultado.addresses || []).map((endereco) => ({
      ...endereco,
      padrao: endereco.favorito,
    }));
  },

  async create(userId, data) {
    const response = await fetch(`${API_URL}/addresses`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || "Erro ao criar endereço");
    }

    return response.json();
  },

  async update(userId, addressId, data) {
    const response = await fetch(`${API_URL}/addresses/${addressId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || "Erro ao atualizar endereço");
    }

    return response.json();
  },

  async remove(userId, addressId) {
    const response = await fetch(`${API_URL}/addresses/${addressId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir endereço");
    }

    return true;
  },

  async setDefault(userId, addressId) {
    const response = await fetch(
      `${API_URL}/addresses/${addressId}/favorite`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao definir endereço padrão");
    }

    return response.json();
  },
};

// ==================== CARTÕES ====================

const cardService = {
  async getAll(userId) {
    const response = await fetch(
      `${API_URL}/users/${userId}/cartoes`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar cartões");
    }

    const resultado = await response.json();

    return (resultado.cartoes || []).map((cartao) => ({
      ...cartao,
      padrao: cartao.favorito,
    }));
  },

  async create(userId, data) {
    const response = await fetch(`${API_URL}/cartoes`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || "Erro ao adicionar cartão");
    }

    return response.json();
  },

  async remove(userId, cardId) {
    const response = await fetch(`${API_URL}/cartoes/${cardId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir cartão");
    }

    return true;
  },

  async setDefault(userId, cardId) {
    const response = await fetch(
      `${API_URL}/cartoes/${cardId}/favorite`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao definir cartão padrão");
    }

    return response.json();
  },
};

// ==================== AVALIAÇÕES ====================

const reviewService = {
  async create(productId, reviewData) {
    const resultadoUsuario = await getCurrentUser();
    const user = resultadoUsuario?.user ?? resultadoUsuario;

    if (!user) {
      throw new Error("Usuário não está logado");
    }

    const rating = reviewData.rating || reviewData.estrelas;
    const comment =
      reviewData.comment || reviewData.comentario || "";

    const payload = {
      estrelas: Number(rating),
      comentario: comment,
      userId: user.id,
      productId: Number(productId),
    };

    const response = await fetch(
      `${API_URL}/products/${productId}/reviews`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: "Erro ao criar avaliação" };
      }

      throw new Error(
        errorData.message ||
        `Erro ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  },
};

// ==================== PERFIL ====================

export default function Perfil() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ==================== USUÁRIO ====================

  const [usuario, setUsuario] = useState(null);
  const [userId, setUserId] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  const [secaoAtiva, setSecaoAtiva] = useState("dados");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [generoDropdownAberto, setGeneroDropdownAberto] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    telefone: "",
    cpf: "",
    genero: "",
    email: "",
  });

  const mapeamentoGeneros = {
    pt: { Feminino: "F", Masculino: "M", Outro: "O" },
    en: { Female: "F", Male: "M", Other: "O" },
    codigoParaPt: {
      F: "Feminino",
      M: "Masculino",
      O: "Outro",
    },
    codigoParaEn: {
      F: "Female",
      M: "Male",
      O: "Other",
    },
  };

  const mapeamentoPagamentos = {
    codigoParaPt: {
      cartao: "Cartão de crédito",
      pix: "PIX",
      boleto: "Boleto",
    },
    codigoParaEn: {
      cartao: "Credit card",
      pix: "PIX",
      boleto: "Bank slip",
    },
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

  // ==================== NOTIFICAÇÕES VISUAIS ====================

  const [notificacao, setNotificacao] = useState({
    visivel: false,
    tipo: "info",
    mensagem: "",
  });

  const mostrarNotificacao = (
    mensagem,
    tipo = "info",
    duracao = 3000
  ) => {
    setNotificacao({
      visivel: true,
      tipo,
      mensagem,
    });

    setTimeout(() => {
      setNotificacao((prev) => ({
        ...prev,
        visivel: false,
      }));
    }, duracao);
  };

  // ==================== CARREGAR USUÁRIO ====================

  useEffect(() => {
    let ativo = true;

    const carregarUsuario = async () => {
      try {
        const resultado = await getCurrentUser();
        const user = resultado?.user ?? resultado;

        if (!ativo) return;

        if (!user) {
          navigate("/cadastro", { replace: true });
          return;
        }

        setUsuario(user);
        setUserId(user.id);

        setFormData({
          nome: user.name || "",
          dataNascimento: user.birthdate
            ? user.birthdate.split("T")[0]
            : "",
          telefone: user.phone || "",
          cpf: user.cpf || "",
          genero: traduzirGeneroDoBanco(user.gender) || "",
          email: user.email || "",
        });
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);

        if (ativo) {
          navigate("/cadastro", { replace: true });
        }
      } finally {
        if (ativo) {
          setCarregandoUsuario(false);
        }
      }
    };

    carregarUsuario();

    return () => {
      ativo = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!usuario) return;

    setFormData((prev) => ({
      ...prev,
      genero: traduzirGeneroDoBanco(usuario.gender) || "",
    }));
  }, [i18n.language, usuario]);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ==================== ATUALIZAR PERFIL ====================

  const validarFormulario = async (e) => {
    e.preventDefault();

    const {
      nome,
      dataNascimento,
      telefone,
      cpf,
      genero,
      email,
    } = formData;

    const cpfValido = /^\d{11}$/.test(
      cpf.replace(/\D/g, "")
    );

    if (!cpfValido) {
      mostrarNotificacao(
        t("CPF deve conter exatamente 11 números."),
        "error"
      );
      return;
    }

    const telefoneNumerico = telefone.replace(/\D/g, "");

    if (!/^\d{10,11}$/.test(telefoneNumerico)) {
      mostrarNotificacao(
        t("Telefone deve conter entre 10 e 11 dígitos e apenas números."),
        "error"
      );
      return;
    }

    if (!genero) {
      mostrarNotificacao(
        t("Por favor, selecione um gênero."),
        "error"
      );
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
        birthdate: dataNascimento
          ? new Date(dataNascimento).toISOString()
          : null,
        cpf: cpf ? cpf.replace(/\D/g, "") : undefined,
        gender: generoCodigo || genero,
        phone: telefone
          ? telefone.replace(/\D/g, "")
          : undefined,
      };

      const res = await updateUser(payload);
      const newUser = res.user || res;

      setUsuario(newUser);

      mostrarNotificacao(
        t("Dados atualizados com sucesso"),
        "success"
      );

      setModoEdicao(false);
    } catch (err) {
      mostrarNotificacao(
        err.message || t("Falha ao atualizar dados"),
        "error"
      );
    }
  };

  // ==================== SAIR DA CONTA ====================

  const handleSair = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      mostrarNotificacao("Erro ao sair da conta.", "error");
    }
  };

  // ==================== PEDIDOS ====================

  const [pedidos, setPedidos] = useState([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(false);
  const [aberto, setAberto] = useState({});
  const [avaliacoes, setAvaliacoes] = useState({});
  const [itensAvaliar, setItensAvaliar] = useState({});
  const [overlayAtivo, setOverlayAtivo] = useState(false);
  const [comentariosAvaliacao, setComentariosAvaliacao] = useState({});
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState({});

  const [abaPedido, setAbaPedido] = useState("preparando");
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [pedidoAvaliando, setPedidoAvaliando] = useState(null);

  const [acoesPedido, setAcoesPedido] = useState({});
  const [etapasEmAtualizacao, setEtapasEmAtualizacao] = useState({});

  // ==================== ENDEREÇOS ====================

  const [enderecos, setEnderecos] = useState([]);
  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(false);

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

  // ==================== CARTÕES ====================

  const [cartoes, setCartoes] = useState([]);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);

  const [formCartao, setFormCartao] = useState({
    nome: "",
    bandeira: "",
    ultimos4: "",
    validade: "",
    tipo: "CREDITO",
    favorito: false,
  });

  // ==================== NOTIFICAÇÕES ====================

  const [notificacoes] = useState([]);

  // ==================== CARREGAR ENDEREÇOS ====================

  const carregarEnderecos = async () => {
    if (!userId) return;

    try {
      setCarregandoEnderecos(true);
      const dados = await addressService.getAll(userId);
      setEnderecos(dados);
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
      mostrarNotificacao(
        t("Erro ao carregar endereços"),
        "error"
      );
    } finally {
      setCarregandoEnderecos(false);
    }
  };

  // ==================== CARREGAR CARTÕES ====================

  const carregarCartoes = async () => {
    if (!userId) return;

    try {
      const dados = await cardService.getAll(userId);
      setCartoes(dados);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
      mostrarNotificacao(
        t("Erro ao carregar cartões"),
        "error"
      );
    }
  };

  // ==================== CARREGAR DADOS DAS SEÇÕES ====================

  useEffect(() => {
    if (!userId) return;

    carregarEnderecos();
    carregarCartoes();
  }, [userId]);

  // ==================== NORMALIZAR ETAPA ====================

  const obterEtapaAtual = (pedido) => {
    if (
      pedido.etapaAtual !== undefined &&
      pedido.etapaAtual !== null &&
      Number.isFinite(Number(pedido.etapaAtual))
    ) {
      return Math.min(3, Math.max(0, Number(pedido.etapaAtual)));
    }

    if (Array.isArray(pedido.etapas)) {
      let ultimaEtapa = 0;

      pedido.etapas.forEach((etapa, index) => {
        if (Number(etapa) === 1 || etapa === true) {
          ultimaEtapa = index;
        }
      });

      return Math.min(3, Math.max(0, ultimaEtapa));
    }

    const etapaNumerica = Number(pedido.etapas);

    if (Number.isFinite(etapaNumerica)) {
      return Math.min(3, Math.max(0, etapaNumerica));
    }

    return 0;
  };

  // ==================== CARREGAR PEDIDOS DO BANCO ====================

  const carregarPedidos = async () => {
    if (!userId) return;

    try {
      setCarregandoPedidos(true);

      const response = await fetch(
        `${API_URL}/users/${userId}/pedidos`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar pedidos");
      }

      const resultado = await response.json();
      const pedidosBanco = extrairLista(resultado, "pedidos");

      const pedidosFormatados = pedidosBanco.map((pedido) => {
        const itens = Array.isArray(pedido.itens)
          ? pedido.itens.map((item) => ({
            ...item,
            nome: item.name || item.nome || "Produto",
            preco: Number(item.price ?? item.preco ?? 0),
            medida: item.tamanho || item.medida || "-",
            quantidade: Number(item.quantidade || 1),
            productId: item.productId ?? item.product?.id ?? item.id,
            img: getImagemProduto(item),
          }))
          : [];

        const etapaAtual = obterEtapaAtual(pedido);

        const etapasPedido = Array.isArray(pedido.etapas)
          ? pedido.etapas.map((etapa) =>
            Number(etapa) === 1 || etapa === true ? 1 : 0
          )
          : [0, 1, 2, 3].map((index) =>
            index <= etapaAtual ? 1 : 0
          );

        const timestamp = pedido.timestamp
          ? Number(pedido.timestamp)
          : pedido.createdAt
            ? new Date(pedido.createdAt).getTime()
            : pedido.data
              ? new Date(pedido.data).getTime()
              : Date.now();

        return {
          ...pedido,
          id: pedido.id,
          codigo:
            pedido.numeroIdentificador ||
            pedido.codigo ||
            pedido.id,
          data: pedido.createdAt
            ? new Date(pedido.createdAt).toLocaleDateString("pt-BR")
            : pedido.data || "",
          timestamp,
          itens,
          endereco: pedido.endereco || null,
          etapas: etapasPedido,
          etapaAtual,
          status: String(pedido.status || "PREPARANDO").toUpperCase(),
          statusPagamento: pedido.statusPagamento || "pendente",
          pagamento: pedido.pagamento || "",
        };
      });

      setPedidos(pedidosFormatados);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);

      mostrarNotificacao(
        t("Erro ao carregar seus pedidos"),
        "error"
      );
    } finally {
      setCarregandoPedidos(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    carregarPedidos();
  }, [userId]);

  // ==================== ABRIR NOVO ENDEREÇO ====================

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

  // ==================== NAVEGAÇÃO ENTRE SEÇÕES ====================

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

  // ==================== EDITAR ENDEREÇO ====================

  const abrirEditarEndereco = (end) => {
    setEnderecoEditando(end);

    setFormEndereco({
      nome: end.nome || "",
      telefone: end.telefone || "",
      cep: end.cep || "",
      estado: end.estado || "",
      cidade: end.cidade || "",
      bairro: end.bairro || "",
      rua: end.rua || "",
      numero: end.numero || "",
      complemento: end.complemento || "",
    });

    setModalEnderecoAberto(true);
  };

  // ==================== BUSCAR CEP ====================

  const buscarCEP = async (cep, tipo = "endereco") => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

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

  // ==================== SALVAR ENDEREÇO ====================

  const salvarEndereco = async (e) => {
    e.preventDefault();

    try {
      if (enderecoEditando) {
        await addressService.update(
          userId,
          enderecoEditando.id,
          formEndereco
        );

        mostrarNotificacao(
          t("Endereço atualizado"),
          "success"
        );
      } else {
        await addressService.create(userId, formEndereco);

        mostrarNotificacao(
          t("Endereço adicionado"),
          "success"
        );
      }

      setModalEnderecoAberto(false);
      await carregarEnderecos();
    } catch (error) {
      mostrarNotificacao(error.message, "error");
    }
  };

  // ==================== EXCLUIR ENDEREÇO ====================

  const excluirEndereco = async (id) => {
    try {
      await addressService.remove(userId, id);

      mostrarNotificacao(
        t("Endereço excluído"),
        "success"
      );

      await carregarEnderecos();
    } catch (error) {
      mostrarNotificacao(error.message, "error");
    }
  };

  // ==================== ENDEREÇO PADRÃO ====================

  const definirEnderecoPadrao = async (id) => {
    try {
      await addressService.setDefault(userId, id);

      mostrarNotificacao(
        t("Endereço definido como padrão"),
        "success"
      );

      await carregarEnderecos();
    } catch (error) {
      mostrarNotificacao(error.message, "error");
    }
  };

  // ==================== ABRIR NOVO CARTÃO ====================

  const abrirNovoCartao = () => {
    setFormCartao({
      nome: "",
      bandeira: "",
      ultimos4: "",
      validade: "",
      tipo: "CREDITO",
      favorito: false,
    });

    setModalCartaoAberto(true);
  };

  // ==================== SALVAR CARTÃO ====================

  const salvarCartao = async (e) => {
    e.preventDefault();

    try {
      await cardService.create(userId, formCartao);

      mostrarNotificacao(
        t("Cartão adicionado"),
        "success"
      );

      setModalCartaoAberto(false);

      setFormCartao({
        nome: "",
        bandeira: "",
        ultimos4: "",
        validade: "",
        tipo: "CREDITO",
        favorito: false,
      });

      await carregarCartoes();
    } catch (error) {
      mostrarNotificacao(error.message, "error");
    }
  };

  // ==================== EXCLUIR CARTÃO ====================

  const excluirCartao = async (id) => {
    try {
      await cardService.remove(userId, id);

      mostrarNotificacao(
        t("Cartão excluído"),
        "success"
      );

      await carregarCartoes();
    } catch (error) {
      mostrarNotificacao(error.message, "error");
    }
  };

  // ==================== CARTÃO PADRÃO ====================

  const definirCartaoPadrao = async (id) => {
    try {
      await cardService.setDefault(userId, id);

      mostrarNotificacao(
        t("Cartão definido como padrão"),
        "success"
      );

      await carregarCartoes();
    } catch (error) {
      mostrarNotificacao(error.message, "error");
    }
  };

  // ==================== CONTROLE DOS MODAIS ====================

  useEffect(() => {
    document.body.style.overflow =
      overlayAtivo ||
        modalAvaliacaoAberto ||
        modalEnderecoAberto ||
        modalCartaoAberto
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    overlayAtivo,
    modalAvaliacaoAberto,
    modalEnderecoAberto,
    modalCartaoAberto,
  ]);

  // ==================== CONTROLE DOS PEDIDOS ====================

  const togglePedido = (id) => {
    setAberto((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ==================== ATUALIZAR ETAPA DO PEDIDO ====================

  const atualizarEtapa = async (pedidoId, index) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);

    if (!pedido) return;
    if (etapasEmAtualizacao[pedidoId]) return;

    const etapaAtual = obterEtapaAtual(pedido);

    if (index !== etapaAtual + 1 || index > 3) {
      mostrarNotificacao(
        t("Você precisa concluir as etapas em ordem."),
        "warning"
      );
      return;
    }

    setEtapasEmAtualizacao((prev) => ({
      ...prev,
      [pedidoId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/pedidos/${pedidoId}/etapas`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            etapa: index,
          }),
        }
      );

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(
          resultado.error || "Erro ao atualizar etapa"
        );
      }

      const novasEtapas = [0, 1, 2, 3].map((etapa) =>
        etapa <= index ? 1 : 0
      );

      const novoStatus =
        index === 3 ? "FINALIZADO" : "A_CAMINHO";

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId
            ? {
              ...p,
              ...resultado,
              etapas: novasEtapas,
              etapaAtual: index,
              status: String(resultado.status || novoStatus).toUpperCase(),
            }
            : p
        )
      );

      mostrarNotificacao(
        index === 3
          ? t("Pedido finalizado com sucesso!")
          : t("Etapa atualizada com sucesso!"),
        "success"
      );
    } catch (error) {
      console.error("Erro ao atualizar etapa:", error);

      mostrarNotificacao(
        error.message || t("Erro ao atualizar etapa"),
        "error"
      );
    } finally {
      setEtapasEmAtualizacao((prev) => ({
        ...prev,
        [pedidoId]: false,
      }));
    }
  };

  // ==================== CANCELAR PEDIDO ====================

  const cancelarPedido = async (pedidoId) => {
    if (acoesPedido[pedidoId]) return;

    const pedido = pedidos.find((p) => p.id === pedidoId);

    if (!pedido) return;

    setAcoesPedido((prev) => ({
      ...prev,
      [pedidoId]: true,
    }));

    try {
      const response = await fetch(
        `${API_URL}/pedidos/${pedidoId}/cancelar`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const resultado = await response.json();

      // if (!response.ok) {
      //   throw new Error(
      //     resultado.error || "Erro ao cancelar pedido"
      //   );
      // }

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId
            ? {
              ...p,
              ...resultado,
              status: "CANCELADO",
              cancelado: true,
              reembolso: "Em análise",
            }
            : p
        )
      );

      mostrarNotificacao(
        t("Pedido cancelado com sucesso!"),
        "success"
      );
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);

      mostrarNotificacao(
        error.message || t("Erro ao cancelar pedido"),
        "error"
      );
    } finally {
      setAcoesPedido((prev) => ({
        ...prev,
        [pedidoId]: false,
      }));
    }
  };

  // ==================== REEMBOLSAR PEDIDO ====================

  const reembolsarPedido = async (pedidoId) => {
    if (acoesPedido[pedidoId]) return;

    const pedido = pedidos.find((p) => p.id === pedidoId);

    if (!pedido) return;

    setAcoesPedido((prev) => ({
      ...prev,
      [pedidoId]: true,
    }));

    try {
      // A rota /reembolsar já altera o status e oculta o pedido
      // do perfil no banco de dados.

      const response = await fetch(
        `${API_URL}/pedidos/${pedidoId}/reembolsar`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const resultado = await response.json();

      // if (!response.ok) {
      //   throw new Error(
      //     resultado.error || "Erro ao realizar reembolso"
      //   );
      // }

      // Remove o pedido da tela imediatamente, sem recarregar a página.
      setPedidos((prev) =>
        prev.filter((p) => p.id !== pedidoId)
      );

      setAberto((prev) => {
        const novoEstado = { ...prev };
        delete novoEstado[pedidoId];
        return novoEstado;
      });

      mostrarNotificacao(
        t("Pedido reembolsado com sucesso!"),
        "success"
      );
    } catch (error) {
      console.error("Erro ao reembolsar pedido:", error);

      mostrarNotificacao(
        error.message || t("Erro ao realizar reembolso"),
        "error"
      );
    } finally {
      setAcoesPedido((prev) => ({
        ...prev,
        [pedidoId]: false,
      }));
    }
  };

  // ==================== AVALIAÇÕES ====================

  const toggleItemAvaliar = (pedidoId, idx) => {
    setItensAvaliar((prev) => {
      const atuais = prev[pedidoId] || [];

      return {
        ...prev,
        [pedidoId]: atuais.includes(idx)
          ? atuais.filter((i) => i !== idx)
          : [...atuais, idx],
      };
    });
  };

  const avaliarProduto = (pedidoId, idx, estrelas) => {
    setAvaliacoes((prev) => ({
      ...prev,
      [`${pedidoId}-${idx}`]: estrelas,
    }));
  };

  // ==================== ENVIAR AVALIAÇÃO DE PRODUTO ====================


  const [itemSelecionadoAvaliacao, setItemSelecionadoAvaliacao] = useState(0);
  const [itensJaAvaliados, setItensJaAvaliados] = useState({});

  const concluirAvaliacao = async (pedidoId, itemIdx) => {
    const chave = `${pedidoId}-${itemIdx}`;
    const estrelas = avaliacoes[chave];
    const comentario = comentariosAvaliacao[chave] || "";

    const pedido = pedidos.find((p) => p.id === pedidoId);
    const produto = pedido?.itens?.[itemIdx];

    if (!estrelas) {
      mostrarNotificacao(
        t("Por favor, selecione uma avaliação em estrelas."),
        "warning"
      );
      return;
    }

    if (!produto?.productId) {
      mostrarNotificacao(t("Produto não encontrado."), "error");
      return;
    }

    if (enviandoAvaliacao[chave]) return;

    setEnviandoAvaliacao((prev) => ({
      ...prev,
      [chave]: true,
    }));

    try {
      await reviewService.create(produto.productId, {
        estrelas,
        comentario,
      });

      setItensJaAvaliados((prev) => ({
        ...prev,
        [chave]: true,
      }));

      setModalAvaliacaoAberto(false);

      setAvaliacoes((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });

      setComentariosAvaliacao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });

      mostrarNotificacao(
        t("Avaliação enviada com sucesso!"),
        "success"
      );
    } catch (error) {
      mostrarNotificacao(
        t("Erro ao enviar avaliação: ") + (error.message || ""),
        "error",
        4000
      );
    } finally {
      setEnviandoAvaliacao((prev) => {
        const novo = { ...prev };
        delete novo[chave];
        return novo;
      });
    }
  };

  // ==================== FILTRO DOS PEDIDOS ====================

  const pedidosFiltradosPorAba = pedidos.filter((pedido) => {
    const status = String(pedido.status || "").toUpperCase();

    if (abaPedido === "cancelado") {
      return status === "CANCELADO" || pedido.cancelado === true;
    }

    if (abaPedido === "reembolso") {
      return (
        status === "CANCELADO" ||
        status === "REEMBOLSO_PENDENTE" ||
        pedido.reembolso === "Em análise"
      );
    }

    if (abaPedido === "preparando") {
      return status === "PREPARANDO" || status === "A_CAMINHO";
    }

    if (abaPedido === "caminho") {
      return status === "PREPARANDO" || status === "A_CAMINHO";
    }

    if (abaPedido === "finalizado") {
      return status === "FINALIZADO";
    }

    return false;
  });

  // ==================== ABRIR AVALIAÇÃO ====================

  const abrirAvaliacaoPedido = (pedido) => {
    setPedidoAvaliando(pedido);
    setItemSelecionadoAvaliacao(0);
    setModalAvaliacaoAberto(true);
  };

  // ==================== CARREGANDO ====================

  if (carregandoUsuario) {
    return (
      <main>
        <div className="pagina">
          <p>Carregando perfil...</p>
        </div>
      </main>
    );
  }

  if (!usuario) {
    return null;
  }

  // ==================== RENDER ====================

  return (
    <main>
      <div className="pagina">

        {/* SIDEBAR */}

        <aside>
          <div className="usuario">
            <img
              src={Images.UserIcon || Images.Pagamento}
              alt="user"
            />

            <div>
              <h2>{formData.nome || t("Nome do perfil")}</h2>

              <button
                className="link-editar-perfil"
                onClick={() => {
                  setSecaoAtiva("dados");
                  setModoEdicao(true);
                }}
              >
                ✎ {t("Editar perfil")}
              </button>
            </div>
          </div>

          <hr />

          <div className="menu-grupo">
            <p className="menu-titulo">{t("Minha conta")}</p>

            <ul>
              <li>
                <a
                  className={secaoAtiva === "dados" ? "ativo" : ""}
                  onClick={() => setSecaoAtiva("dados")}
                >
                  {t("Dados pessoais")}
                </a>
              </li>

              <li>
                <a
                  className={secaoAtiva === "enderecos" ? "ativo" : ""}
                  onClick={() => setSecaoAtiva("enderecos")}
                >
                  {t("Endereços")}
                </a>
              </li>

              <li>
                <a
                  className={secaoAtiva === "cartoes" ? "ativo" : ""}
                  onClick={() => setSecaoAtiva("cartoes")}
                >
                  {t("Cartões")}
                </a>
              </li>

              <li>
                <a
                  className={secaoAtiva === "pedidos" ? "ativo" : ""}
                  onClick={() => setSecaoAtiva("pedidos")}
                >
                  {t("Meus pedidos")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <ul>

              <li>
                {/* <a
                  className={
                    secaoAtiva === "notificacoes" ? "ativo" : ""
                  }
                  onClick={() => setSecaoAtiva("notificacoes")}
                >
                  {t("Notificações")}
                </a> */}
              </li>
            </ul>
          </div>

          <hr />

          <ul>
            <li>
              <a onClick={handleSair}>
                {t("Sair da conta")}
              </a>
            </li>

            {/* <li>
              <Link to="/sacola">{t("Sacola")}</Link>
            </li> */}
          </ul>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}

        <section className="conteudo-usuario">

          {/* ============ DADOS PESSOAIS ============ */}

          {secaoAtiva === "dados" && (
            <>
              <h2 className="conteudo-titlle">
                {t("Meu perfil")}
              </h2>

              <p className="subtitulo">
                {t("Gerencie sua conta")}
              </p>

              {!modoEdicao ? (
                <div className="dados-grid">
                  <div>
                    <p className="dado-label">{t("Nome")}</p>
                    <p>{formData.nome}</p>
                  </div>

                  <div>
                    <p className="dado-label">
                      {t("Data de nascimento")}
                    </p>
                    <p>{formData.dataNascimento}</p>
                  </div>

                  <div>
                    <p className="dado-label">{t("Telefone")}</p>
                    <p>{formData.telefone}</p>
                  </div>

                  <div>
                    <p className="dado-label">{t("CPF")}</p>
                    <p>{formData.cpf}</p>
                  </div>

                  <div>
                    <p className="dado-label">{t("E-mail")}</p>
                    <p>{formData.email}</p>
                  </div>

                  <div>
                    <p className="dado-label">{t("Gênero")}</p>
                    <p>{formData.genero}</p>
                  </div>

                  <button
                    className="editar"
                    onClick={() => setModoEdicao(true)}
                  >
                    {t("Editar")}
                  </button>
                </div>
              ) : (
                <form onSubmit={validarFormulario}>
                  <div className="campo">
                    <label>{t("Nome")}</label>
                    <input
                      value={formData.nome}
                      onChange={(e) =>
                        handleChange("nome", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="campo">
                    <label>{t("Data de nascimento")}</label>
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) =>
                        handleChange("dataNascimento", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="campo">
                    <label>{t("Telefone")}</label>
                    <input
                      value={formData.telefone}
                      onChange={(e) =>
                        handleChange("telefone", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="campo">
                    <label>{t("CPF")}</label>
                    <input
                      value={formData.cpf}
                      onChange={(e) =>
                        handleChange("cpf", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="campo">
                    <label>{t("E-mail")}</label>
                    <input
                      value={formData.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="campo">
                    <label>{t("Gênero")}</label>

                    <div
                      className={`dropdown-genero ${generoDropdownAberto ? "ativo" : ""
                        }`}
                    >
                      <div
                        className="dropdown-selecionado"
                        onClick={() =>
                          setGeneroDropdownAberto(
                            !generoDropdownAberto
                          )
                        }
                      >
                        {formData.genero || "\u00A0"}
                      </div>

                      <ul className="dropdown-opcoes">
                        {obterOpcoesGenero().map((opcao) => (
                          <li
                            key={opcao}
                            onClick={() => {
                              handleChange("genero", opcao);
                              setGeneroDropdownAberto(false);
                            }}
                          >
                            {opcao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button type="submit" className="salvar">
                    {t("Salvar alterações")}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ============ ENDEREÇOS ============ */}

          {secaoAtiva === "enderecos" && (
            <>
              <div className="secao-header">
                <h2 className="conteudo-titlle">
                  {t("Meus endereços")}
                </h2>

                <button
                  className="btn-adicionar"
                  onClick={abrirNovoEndereco}
                >
                  + {t("Adicionar endereço")}
                </button>
              </div>

              {carregandoEnderecos ? (
                <p className="empty-msg">
                  {t("Carregando informações...")}
                </p>
              ) : enderecos.length === 0 ? (
                <p className="empty-msg">
                  {t("Você ainda não tem endereços cadastrados.")}
                </p>
              ) : (
                <div className="lista-cards">
                  {enderecos.map((end) => (
                    <div key={end.id} className="card-item">
                      <div className="card-info">
                        <p className="card-titulo">
                          {t("Endereço")}
                        </p>

                        <p className="card-linha">
                          <strong>{end.nome}</strong> | {end.telefone}
                        </p>

                        <p className="card-linha">
                          {end.rua}, {end.numero}{" "}
                          {end.complemento &&
                            `- ${end.complemento}`}
                        </p>

                        <p className="card-linha">
                          {end.bairro}
                        </p>

                        <p className="card-linha">
                          {end.cidade} - {end.estado},{" "}
                          {t("CEP")}: {end.cep}
                        </p>

                        {end.padrao && (
                          <span
                            className="badge-padrao"
                            style={{ display: "inline-block", marginTop: "15px" }}
                          >
                            {t("Padrão")}
                          </span>
                        )}
                      </div>

                      <div className="card-acoes">
                        <div className="card-links">
                          <a onClick={() => abrirEditarEndereco(end)}>
                            {t("Editar")}
                          </a>
                          <span>|</span>
                          <a onClick={() => excluirEndereco(end.id)}>
                            {t("Excluir")}
                          </a>
                        </div>

                        {!end.padrao && (
                          <button
                            className="btn-padrao"
                            onClick={() => definirEnderecoPadrao(end.id)}
                          >
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
                <h2 className="conteudo-titlle">
                  {t("Meus cartões")}
                </h2>

                <button
                  className="btn-adicionar"
                  onClick={abrirNovoCartao}
                >
                  + {t("Adicionar cartão")}
                </button>
              </div>

              

              {cartoes.length === 0 ? (
                <p className="empty-msg">
                  {t("Você ainda não tem cartões cadastrados.")}
                </p>
              ) : (
                <div className="lista-cards">
                  {cartoes.map((c) => (
                    <div
                      key={c.id}
                      className="card-item card-cartao"
                    >
                      <div className="card-info">
                        <p className="card-titulo">
                          Cartão {c.bandeira ? `(${c.bandeira})` : ""} - {c.nome}
                        </p>

                        <p className="card-linha">
                          {c.tipo || "Crédito"}
                        </p>

                        {c.padrao && (
                          <span className="badge-padrao">
                            {t("Padrão")}
                          </span>
                        )}
                      </div>


                      <div className="card-numero">
                        **** **** ****{" "}
                        {c.ultimos4 ||
                          (c.numero || "").slice(-4)}
                      </div>

                      <div className="card-acoes">
                        <div className="card-links">
                          <a onClick={() => editarCartao(c.id)}>Editar</a>
                          <span>|</span>
                          <a onClick={() => excluirCartao(c.id)}>Excluir</a>
                        </div>

                        {!c.padrao && (
                          <button
                            className="btn-padrao"
                            onClick={() => definirCartaoPadrao(c.id)}
                          >
                            Definir como padrão
                          </button>
                        )}

                        {c.padrao && (
                          <span className="badge-padrao">Padrão</span>
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

                ].map((aba) => (
                  <button
                    key={aba.id}
                    className={`aba-pedido ${abaPedido === aba.id ? "ativa" : ""
                      }`}
                    onClick={() => setAbaPedido(aba.id)}
                  >
                    {aba.label}
                  </button>
                ))}
              </div>

              {carregandoPedidos ? (
                <p className="empty-msg">
                  {t("Carregando pedidos...")}
                </p>
              ) : pedidosFiltradosPorAba.length === 0 ? (
                <p className="empty-msg">
                  {t("Você ainda não realizou nenhum pedido.")}
                </p>
              ) : (
                <div>
                  {pedidosFiltradosPorAba.map((pedido) => {
                    const etapaAtual = obterEtapaAtual(pedido);

                    const statusPedido = String(
                      pedido.status || "PREPARANDO"
                    ).toUpperCase();

                    const parcelas = Math.max(
                      1,
                      Number(pedido.parcelas || 1)
                    );
                    const total = Number(pedido.total || 0);
                    const valorParcela = total / parcelas;

                    const formatarPreco = (valor) =>
                      Number(valor || 0).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });

                    const endereco = pedido.endereco;

                    const podeCancelar =
                      statusPedido === "PREPARANDO" ||
                      statusPedido === "A_CAMINHO";

                    const podeReembolsar =
                      statusPedido === "CANCELADO" ||
                      statusPedido === "REEMBOLSO_PENDENTE";

                    const nomesEtapas = [
                      "Fábrica",
                      "Estrada",
                      "Centro Logístico",
                      "Entrega",
                    ];

                    return (
                      <div
                        className="pedido-card-visual"
                        key={pedido.id}
                      >
                        {/* CABEÇALHO DO PEDIDO */}

                        <div
                          className="pedido-header pedido-header-visual"
                          onClick={() => togglePedido(pedido.id)}
                        >
                          <span className="pedido-codigo">
                            {t("Pedido")} #{pedido.codigo}
                          </span>

                          <span className="seta-css"></span>
                        </div>

                        {/* RASTREAMENTO NA ABA A CAMINHO */}

                        {abaPedido === "caminho" &&
                          ["PREPARANDO", "A_CAMINHO"].includes(statusPedido) && (
                            <div className="rastreamento-container">
                              <h3>
                                {t("Acompanhar pedido")} - {etapaAtual === 0
                                  ? t("Seu pedido está na fábrica.")
                                  : etapaAtual === 1
                                    ? t("Seu pedido está na estrada.")
                                    : etapaAtual === 2
                                      ? t("Seu pedido está no centro logístico.")
                                      : t("Seu pedido foi entregue!")}
                              </h3>

                              <div className="timeline-container">
                                {nomesEtapas.map((nomeEtapa, index) => {
                                  const concluida = etapaAtual >= index;
                                  const proximaEtapa =
                                    index === etapaAtual + 1;
                                  const atualizando =
                                    Boolean(etapasEmAtualizacao[pedido.id]);

                                  return (
                                    <button
                                      type="button"
                                      key={index}
                                      className={`status-item ${concluida ? "concluida" : ""
                                        }`}
                                      disabled={
                                        !proximaEtapa || atualizando
                                      }
                                      onClick={() =>
                                        atualizarEtapa(pedido.id, index)
                                      }
                                    >
                                      <div
                                        className={`bola ${concluida ? "ativa" : ""
                                          }`}
                                      />

                                      <p>{t(nomeEtapa)}</p>


                                    </button>
                                  );
                                })}
                              </div>

                              {/* <div className="mensagem-entrega">
                                <p>
                                  {etapaAtual === 0
                                    ? t("Seu pedido está na fábrica.")
                                    : etapaAtual === 1
                                      ? t("Seu pedido está na estrada.")
                                      : etapaAtual === 2
                                        ? t("Seu pedido está no centro logístico.")
                                        : t("Seu pedido foi entregue!")}
                                </p>
                              </div> */}
                            </div>
                          )}

                        {/* AÇÕES DO PEDIDO */}



                        {/* DETALHES DO PEDIDO */}

                        {aberto[pedido.id] && (
                          <div className="pedido-detalhes pedido-detalhes-visual">

                            {/* CABEÇALHO DA LISTA DE PRODUTOS */}

                            <div className="pedido-colunas">
                              <span>{t("Produto")}</span>
                              <span>{t("Quantidade")}</span>
                              <span>{t("Preço")}</span>
                            </div>

                            {/* PRODUTOS DO PEDIDO */}

                            <div className="pedido-lista-produtos">
                              {pedido.itens.map((item, index) => (
                                <div
                                  className="pedido-produto"
                                  key={index}
                                >
                                  <div className="pedido-produto-info">
                                    {item.img ? (
                                      <img
                                        src={item.img}
                                        alt={item.nome}
                                        className="pedido-produto-imagem"
                                      />
                                    ) : (
                                      <div className="pedido-produto-sem-imagem">
                                        {t("Sem imagem")}
                                      </div>
                                    )}

                                    <div className="pedido-produto-descricao">
                                      <strong>{item.nome}</strong>

                                      <div className="pedido-produto-variacoes">
                                        {item.medida &&
                                          item.medida !== "-" && (
                                            <span className="pedido-tamanho">
                                              {item.medida}
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  </div>

                                  <span className="pedido-produto-quantidade">
                                    {item.quantidade}
                                  </span>

                                  <span className="pedido-produto-preco">
                                    R$ {formatarPreco(item.preco)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* RODAPÉ DO PEDIDO */}

                            <div className="pedido-rodape">
                              <div className="pedido-rodape-informacoes">
                                <p>
                                  <strong>
                                    {t("Pagamento")}:
                                  </strong>{" "}
                                  {traduzirFormaPagamento(
                                    pedido.pagamento
                                  )}
                                  {parcelas > 1 &&
                                    `, parcelasxdeR ${formatarPreco(
                                      valorParcela
                                    )}`}
                                </p>

                                <p>
                                  <strong>{t("Endereço")}:</strong>
                                </p>

                                <div className="pedido-endereco">
                                  <strong>
                                    {endereco?.nome || ""}
                                    {" | "}
                                    {endereco
                                      ? [
                                        endereco.rua,
                                        endereco.numero,
                                        endereco.complemento,
                                        endereco.bairro,
                                        endereco.cidade,
                                        endereco.estado,
                                        endereco.cep,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")
                                      : t("Endereço não disponível")}
                                  </strong>
                                </div>

                                {pedido.cupom && (
                                  <p className="pedido-cupom">
                                    {t("Cupom")}: {pedido.cupom}
                                  </p>
                                )}
                              </div>

                              <div className="pedido-total">
                                <span>{t("Total a pagar")}:</span>
                                <strong>
                                  R$ {formatarPreco(total)}
                                </strong>
                              </div>
                            </div>

                            <div className="pedido-acoes">
                              {podeCancelar && (
                                <button
                                  type="button"
                                  className="btn-cancelar-pedido"
                                  disabled={Boolean(acoesPedido[pedido.id])}
                                  onClick={() =>
                                    cancelarPedido(pedido.id)
                                  }
                                >
                                  {acoesPedido[pedido.id]
                                    ? t("Aguarde...")
                                    : t("Cancelar pedido")}
                                </button>
                              )}

                              {podeReembolsar && (
                                <button
                                  type="button"
                                  className="btn-reembolsar-pedido"
                                  disabled={Boolean(acoesPedido[pedido.id])}
                                  onClick={() =>
                                    reembolsarPedido(pedido.id)
                                  }
                                >
                                  {acoesPedido[pedido.id]
                                    ? t("Aguarde...")
                                    : t("Resgatar pagamento")}
                                </button>
                              )}
                            </div>

                            {/* AVALIAR PEDIDO */}

                            {etapaAtual === 3 &&
                              statusPedido === "FINALIZADO" && (
                                <button
                                  className="btn-avaliar-pedido"
                                  onClick={() =>
                                    abrirAvaliacaoPedido(pedido)
                                  }
                                >
                                  {t("Avaliar pedido")}
                                </button>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ============ NOTIFICAÇÕES ============ */}

          {secaoAtiva === "notificacoes" && (
            <>
              <h2 className="conteudo-titlle">
                {t("Notificações")}
              </h2>

              {notificacoes.length === 0 ? (
                <p className="empty-msg">
                  {t("Você não tem notificações.")}
                </p>
              ) : (
                <ul className="lista-notif">
                  {notificacoes.map((n) => (
                    <li
                      key={n.id}
                      className={`notif-item ${n.lida ? "lida" : ""}`}
                    >
                      <p className="notif-titulo">
                        {n.titulo}
                      </p>

                      <p className="notif-msg">
                        {n.mensagem}
                      </p>

                      <span className="notif-data">
                        {n.data}
                      </span>
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
        <div
          className="modal-overlay"
          onClick={() => setModalEnderecoAberto(false)}
        >
          <div
            className="modal-conteudo"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {enderecoEditando
                ? t("Editar endereço")
                : t("Novo Endereço")}
            </h3>

            <form
              onSubmit={salvarEndereco}
              className="form-modal"
            >
              <div className="form-row">
                <input
                  placeholder={t("Nome Completo")}
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
                  placeholder={t("Número de Telefone")}
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
                placeholder={t("CEP")}
                value={formEndereco.cep}
                onChange={(e) => {
                  const val = e.target.value;

                  setFormEndereco({
                    ...formEndereco,
                    cep: val,
                  });

                  if (val.replace(/\D/g, "").length === 8) {
                    buscarCEP(val, "endereco");
                  }
                }}
                onBlur={(e) =>
                  buscarCEP(e.target.value, "endereco")
                }
                required
              />

              <input
                placeholder={t("Estado")}
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
                placeholder={t("Cidade")}
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
                placeholder={t("Bairro")}
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
                  placeholder={t("Rua / Avenida")}
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
                  placeholder={t("Número")}
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
                placeholder={t("Complemento (apto, bloco, etc.)")}
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
                  onClick={() => setModalEnderecoAberto(false)}
                >
                  {t("Cancelar")}
                </button>

                <button
                  type="submit"
                  className="btn-enviar"
                >
                  {t("Enviar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL CARTÃO ============ */}

      {modalCartaoAberto && (
        <div
          className="modal-overlay"
          onClick={() => setModalCartaoAberto(false)}
        >
          <div
            className="modal-conteudo modal-cartao"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{t("Adicionar cartão")}</h2>

            <p className="aviso-seguranca">
              {t(
                "Cadastre as informações do seu cartão para facilitar suas próximas compras."
              )}
            </p>

            <form
              className="form-modal"
              onSubmit={salvarCartao}
            >
              <div className="form-row">
                <label htmlFor="tipo-cartao-perfil">
                  {t("Tipo de cartão")}
                </label>

                <select
                  id="tipo-cartao-perfil"
                  value={formCartao.tipo}
                  onChange={(e) =>
                    setFormCartao({
                      ...formCartao,
                      tipo: e.target.value,
                    })
                  }
                  required
                >
                  <option value="CREDITO">{t("Crédito")}</option>
                  <option value="DEBITO">{t("Débito")}</option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="bandeira-cartao-perfil">
                  {t("Bandeira do cartão")}
                </label>

                <select
                  id="bandeira-cartao-perfil"
                  value={formCartao.bandeira}
                  onChange={(e) =>
                    setFormCartao({
                      ...formCartao,
                      bandeira: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    {t("Selecione a bandeira")}
                  </option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Elo">Elo</option>
                  <option value="American Express">
                    American Express
                  </option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="nome-cartao-perfil">
                  {t("Nome impresso no cartão")}
                </label>

                <input
                  id="nome-cartao-perfil"
                  type="text"
                  placeholder={t("Nome do titular")}
                  value={formCartao.nome}
                  onChange={(e) =>
                    setFormCartao({
                      ...formCartao,
                      nome: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="ultimos4-cartao-perfil">
                  {t("Últimos quatro dígitos")}
                </label>

                <input
                  id="ultimos4-cartao-perfil"
                  type="text"
                  placeholder="0000"
                  value={formCartao.ultimos4}
                  onChange={(e) =>
                    setFormCartao({
                      ...formCartao,
                      ultimos4: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4),
                    })
                  }
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="validade-cartao-perfil">
                  {t("Validade")}
                </label>

                <input
                  id="validade-cartao-perfil"
                  type="text"
                  placeholder="MM/AA"
                  value={formCartao.validade}
                  onChange={(e) => {
                    let validade = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4);

                    if (validade.length > 2) {
                      validade =
                        validade.slice(0, 2) +
                        "/" +
                        validade.slice(2);
                    }

                    setFormCartao({
                      ...formCartao,
                      validade,
                    });
                  }}
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
                    setFormCartao({
                      ...formCartao,
                      favorito: e.target.checked,
                    })
                  }
                />

                {t("Tornar este cartão padrão")}
              </label>

              <div className="modal-acoes">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalCartaoAberto(false)}
                >
                  {t("Cancelar")}
                </button>

                <button
                  type="submit"
                  className="btn-enviar"
                >
                  {t("Salvar cartão")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL AVALIAÇÃO INDIVIDUAL ============ */}

      {modalAvaliacaoAberto && pedidoAvaliando && (
        <div
          className="modal-overlay"
          onClick={() => setModalAvaliacaoAberto(false)}
        >
          <div
            className="modal-conteudo modal-avaliacao"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="titulo-avaliacao">
              {t("Avalie os produtos do seu pedido")}
            </h3>

            <p>
              {t("Selecione o produto que deseja avaliar:")}
            </p>

            <div className="produtos-para-avaliar">
              {pedidoAvaliando.itens?.map((item, index) => {
                const chave = `${pedidoAvaliando.id}-${index}`;
                const jaAvaliado = Boolean(itensJaAvaliados[chave]);
                const selecionado = itemSelecionadoAvaliacao === index;

                return (
                  <button
                    type="button"
                    key={`item.productId-${index}`}
                    className={`produto-para-avaliar ${selecionado ? "selecionado" : ""
                      }`}
                    disabled={jaAvaliado}
                    onClick={() => setItemSelecionadoAvaliacao(index)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px",
                      border: "0",
                      minWidth: "230px",
                      maxWidth: "230px",
                      minHeight: "165px",
                      opacity: jaAvaliado ? 0.6 : 1,
                      cursor: jaAvaliado ? "not-allowed" : "pointer",
                      backgroundColor: "transparent",
                    }}
                  >
                    {getImagemProduto(item) ? (
                      <img
                        src={getImagemProduto(item)}
                        alt={item.nome}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = Images.SemImagem;
                        }}
                        style={{
                          width: "140px",
                          height: "160px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          display: "block",
                          margin: "0 auto",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "110px",
                          height: "110px",
                          borderRadius: "6px",
                          backgroundColor: "#eeeeee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          color: "#666",
                          margin: "0 auto",
                        }}
                      >
                        {t("Sem imagem")}
                      </div>
                    )}

                    <span
                      style={{
                        display: "block",
                        width: "210px",
                        fontSize: "13px",
                        textAlign: "center",
                        lineHeight: "1.3",
                        fontWeight: selecionado ? "bold" : "normal",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.nome}
                    </span>

                    {jaAvaliado && (
                      <small>{t("Avaliado")}</small>
                    )}
                  </button>
                );
              })}
            </div>

            {(() => {
              const item = pedidoAvaliando.itens?.[itemSelecionadoAvaliacao];
              const chave = `${pedidoAvaliando.id}-${itemSelecionadoAvaliacao}`;
              const jaAvaliado = Boolean(itensJaAvaliados[chave]);

              if (!item) return null;

              if (jaAvaliado) {
                return (
                  <p className="mensagem-produto-avaliado">
                    {t("Este produto já foi avaliado. Selecione outro produto.")}
                  </p>
                );
              }

              return (
                <>
                  

                  <div className="estrelas-grandes">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`estrela ${(avaliacoes[chave] || 0) >= n ? "ativa" : ""
                          }`}
                        onClick={() =>
                          avaliarProduto(
                            pedidoAvaliando.id,
                            itemSelecionadoAvaliacao,
                            n
                          )
                        }
                      >
                        ★
                      </span>
                    ))}

                    <span className="nota-numerica">
                      {(avaliacoes[chave] || 0).toFixed(1)}
                    </span>
                  </div>

                  <textarea
                    placeholder={t("Detalhe sua avaliação")}
                    value={comentariosAvaliacao[chave] || ""}
                    onChange={(e) =>
                      setComentariosAvaliacao((prev) => ({
                        ...prev,
                        [chave]: e.target.value,
                      }))
                    }
                    className="textarea-avaliacao"
                    maxLength={1000}
                  />

                  <div className="modal-acoes">
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={() => setModalAvaliacaoAberto(false)}
                    >
                      {t("Cancelar")}
                    </button>

                    <button
                      type="button"
                      className="btn-enviar"
                      disabled={Boolean(enviandoAvaliacao[chave])}
                      onClick={() =>
                        concluirAvaliacao(
                          pedidoAvaliando.id,
                          itemSelecionadoAvaliacao
                        )
                      }
                    >
                      {enviandoAvaliacao[chave]
                        ? t("Enviando...")
                        : t("Enviar avaliação")}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============ OVERLAY DE SUCESSO ============ */}

      {overlayAtivo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {t("Avaliação enviada, obrigada!")}
        </div>
      )}

      {/* ============ NOTIFICAÇÃO VISUAL ============ */}

      {notificacao.visivel && (
        <div
          className={`alerta ${notificacao.tipo === "success"
            ? "sucesso"
            : notificacao.tipo === "error"
              ? "erro"
              : "info"
            }`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "15px 20px",
            borderRadius: "8px",
            color: "#fff",
            fontFamily: "'Arimo', sans-serif",
            zIndex: 10000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            minWidth: "300px",
            maxWidth: "400px",
            animation: "slideIn 0.3s ease-out",
            fontWeight: "500",
            borderLeft: `4px solid ${notificacao.tipo === "success"
              ? "#1e7e34"
              : notificacao.tipo === "error"
                ? "#a71e2a"
                : "#303030"
              }`,
            cursor: "pointer",
          }}
          onClick={() =>
            setNotificacao((prev) => ({
              ...prev,
              visivel: false,
            }))
          }
        >
          {notificacao.mensagem}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .status-pagamento {
          margin-bottom: 15px;
          font-size: 14px;
        }

        .pagamento-pago {
          color: #176b43;
          font-weight: bold;
        }

        .pagamento-pendente {
          color: #a71e2a;
          font-weight: bold;
        }

        .rastreamento-container {
          padding: 25px 20px;
          border-bottom: 1px solid #ddd;
          margin-bottom: 0;
        }

        .rastreamento-container h3 {
          margin: 0 0 25px;
          color: #353535;
          font-size: 14px;
          font-weight: 100;
          margin-bottom: 30px;
        }

        .timeline-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 0;
        }

        .timeline-container .status-item {
          flex: 1;
          text-align: center;
          position: relative;
          z-index: 1;
          border: 0;
          background: transparent;
          color: inherit;
          padding: 0;
          font: inherit;
        }

        .timeline-container .status-item:disabled {
          opacity: 1;
        }

        .timeline-container .status-item:not(:disabled) {
          cursor: pointer;
        }

        .timeline-container .bola {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          margin: 0 auto 10px;
          background: #ddd;
          border: 2px solid #083e39;
          box-sizing: border-box;
          transition: background-color 0.2s;
        }

        .timeline-container .bola.ativa {
          background: #07403b;
        }

        .timeline-container .status-item p {
          font-size: 13px;
          margin: 0;
        }

        .timeline-container .status-item small {
          display: block;
          margin-top: 5px;
          font-size: 10px;
          color: #0e2523;
        }

        .mensagem-entrega {
          text-align: center;
          margin-top: 25px;
          font-weight: bold;
        }

        .mensagem-entrega p {
          color: #3b3b3b;
          font-size: 14px;
          font-weight: 0;
        }

        .pedido-acoes {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding: 15px 20px;
        }

        .pedido-acoes button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancelar-pedido {
          padding: 10px 16px;
          border: 1px solid #a71e2a;
          background: #a71e2a;
          color: white;
          border-radius: 5px;
          cursor: pointer;
        }

        .btn-reembolsar-pedido {
          padding: 10px 16px;
          border: none;
          background: #084550;
          color: white;
          border-radius: 5px;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .timeline-container {
            gap: 3px;
          }

          .timeline-container .status-item p {
            font-size: 11px;
          }

          .timeline-container .status-item small {
            font-size: 9px;
          }
        }
      `}</style>

    </main>
  );
}


