// Header.js - Adicione os novos states e funções
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/header.css";
import Images from "../../assets/img";
import { getStoredUser } from "../../utils/auth";
import { cartService } from "../../services/cartService";
import SearchBar from "./SearchBar";
import UserActions from "./UserActions";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import CartSidebar from "./CartSidebar";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [menuAberto, setMenuAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [submenuAtivo, setSubmenuAtivo] = useState(null);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [alerta, setAlerta] = useState({ mensagem: "", tipo: "" });

  const [termoBusca, setTermoBusca] = useState("");
  const [termoBuscaMobile, setTermoBuscaMobile] = useState("");

  const [itens, setItens] = useState([]);
  const [carregandoSacola, setCarregandoSacola] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  

  // ✅ NOVOS STATES PARA SELEÇÃO DE ITENS

  const [itensSelecionados, setItensSelecionados] = useState(new Set());
  const [totalSelecionado, setTotalSelecionado] = useState(0);

  const buscaRef = useRef(null);
  const menuLateralRef = useRef(null);
  const carrinhoRef = useRef(null);


  // ✅ FUNÇÕES PARA GERENCIAR SELEÇÃO DE ITENS

  const toggleSelecionarItem = (itemId) => {
    setItensSelecionados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selecionarTodos = () => {
    const todosIds = itens.map(item => item.id);
    setItensSelecionados(new Set(todosIds));
  };

  const desmarcarTodos = () => {
    setItensSelecionados(new Set());
  };


  // ✅ CALCULAR TOTAL DOS ITENS SELECIONADOS

  useEffect(() => {
    const total = itens
      .filter(item => itensSelecionados.has(item.id))
      .reduce((sum, item) => sum + (item.preco * item.qtd), 0);
    setTotalSelecionado(total);
  }, [itens, itensSelecionados]);


  // ✅ LIMPAR SELEÇÃO QUANDO O CARRINHO MUDA

  useEffect(() => {
    // Remove itens que não existem mais no carrinho
    const idsExistentes = new Set(itens.map(item => item.id));
    setItensSelecionados(prev => {
      const newSet = new Set();
      prev.forEach(id => {
        if (idsExistentes.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [itens]);


  // Paleta de cores (mantenha igual)

  const paletaDeCores = {
    "Coral": "#dc143c",
    "Canela": "#992e04",
    "Vinho": "#720c2e",
    "Laranja": "#ffa500",
    "Narciso": "#ffff00",
    "Lima": "#32cd32",
    "Musgo": "#006400",
    "Piscina": "#0c6f72",
    "Azul": "#00bfff",
    "Marine": "#191970",
    "Roxo": "#4B0082",
    "Lilás": "#9370DB",
    "Rosa": "#ff69b4",
    "Bege": "#f5f5dc",
    "Marrom": "#392620",
    "Cinza": "#696969",
    "Preto": "#000000",
    "Branco": "#ffffff",
  };

  // Função para obter código hexadecimal da cor
  const obterCorHex = (nomeCor) => {
    if (!nomeCor) return null;
    const corNormalizada = nomeCor.charAt(0).toUpperCase() + nomeCor.slice(1).toLowerCase();
    return paletaDeCores[corNormalizada] || nomeCor;
  };


  // Função para criar alerta (mantenha igual)

  const criarAlertaForcado = (mensagem, tipo) => {
    const alertasAntigos = document.querySelectorAll('.alerta-forcado-manual');
    alertasAntigos.forEach(alerta => alerta.remove());

    const alerta = document.createElement('div');
    alerta.className = 'alerta-forcado-manual';

    let bgColor = '#28a745';
    let borderColor = '#1e7e34';

    if (tipo === 'error' || tipo === 'erro') {
      bgColor = '#dc3545';
      borderColor = '#a71e2a';
    }

    alerta.style.position = 'fixed';
    alerta.style.left = '50%';
    alerta.style.top = '20px';
    alerta.style.transform = 'translateX(-50%) translateZ(0)';
    alerta.style.zIndex = '2147483647';
    alerta.style.padding = '12px 16px';
    alerta.style.borderRadius = '6px';
    alerta.style.color = '#fff';
    alerta.style.fontFamily = 'Arimo, sans-serif';
    alerta.style.minWidth = '220px';
    alerta.style.width = 'auto';
    alerta.style.maxWidth = '90vw';
    alerta.style.boxSizing = 'border-box';
    alerta.style.backgroundColor = bgColor;
    alerta.style.borderLeft = `4px solid ${borderColor}`;
    alerta.style.textAlign = 'center';
    alerta.style.opacity = '0.97';
    alerta.style.willChange = 'transform';
    alerta.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    alerta.style.right = 'auto';
    alerta.setAttribute('role', 'alert');
    alerta.setAttribute('aria-live', 'polite');

    alerta.textContent = mensagem;
    document.body.appendChild(alerta);

    setTimeout(() => {
      if (alerta.parentNode) {
        alerta.remove();
      }
    }, 4000);

    alerta.onclick = () => alerta.remove();
  };

  // Função para realizar busca
  const realizarBusca = (termo) => {
    if (!termo || termo.trim() === "") {
      criarAlertaForcado(t("Digite algo para pesquisar"), "error");
      return;
    }

    navigate(`/busca?q=${encodeURIComponent(termo.trim())}`);
    setMostrarBusca(false);
    setTermoBusca("");
    setTermoBuscaMobile("");
    setMenuMobileAberto(false);
  };


  // Verifica usuário logado (mantenha igual)

  useEffect(() => {
    const u = getStoredUser();
    setUsuarioLogado(u);

    const onLoginSuccess = () => {
      const novoUser = getStoredUser();
      setUsuarioLogado(novoUser);
      if (novoUser?.id) {
        carregarSacola(novoUser.id);
      }
    };

    const onLogoutSuccess = () => {
      setUsuarioLogado(null);
      setItens([]);
      setSubtotal(0);
      setItensSelecionados(new Set()); // Limpar seleção ao deslogar
    };

    const onStorage = (e) => {
      if (e.key === 'user') {
        const novoUser = getStoredUser();
        setUsuarioLogado(novoUser);
        if (novoUser?.id) {
          carregarSacola(novoUser.id);
        } else {
          setItens([]);
          setItensSelecionados(new Set());
        }
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('loginSuccess', onLoginSuccess);
    window.addEventListener('logoutSuccess', onLogoutSuccess);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('loginSuccess', onLoginSuccess);
      window.removeEventListener('logoutSuccess', onLogoutSuccess);
    };
  }, []);

  useEffect(() => {
    if (usuarioLogado?.id) {
      carregarSacola(usuarioLogado.id);
    }
  }, [usuarioLogado]);

  useEffect(() => {
    const handleCartUpdate = () => {
      if (usuarioLogado?.id) {
        carregarSacola(usuarioLogado.id);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [usuarioLogado]);

  const carregarSacola = async (userId) => {
    try {
      setCarregandoSacola(true);
      const data = await cartService.getCart(userId);

      const itensFormatados = data.items.map(item => ({
        id: item.id,
        nome: item.product.name,
        preco: parseFloat(item.product.price),
        qtd: item.quantidade,
        medida: item.tamanho,
        cor: item.cor,
        img: item.product.image1,
        productId: item.productId
      }));

      setItens(itensFormatados);
      setSubtotal(parseFloat(data.total));
    } catch (error) {
      console.error('Erro ao carregar sacola:', error);
      criarAlertaForcado(t("Erro ao carregar sacola"), "error");
    } finally {
      setCarregandoSacola(false);
    }
  };

  const alterarQuantidade = async (cartItemId, delta) => {
    const item = itens.find(i => i.id === cartItemId);
    if (!item) return;

    const novaQuantidade = item.qtd + delta;
    if (novaQuantidade < 1) return;

    try {
      await cartService.updateQuantity(cartItemId, novaQuantidade);

      setItens(prev =>
        prev.map(i =>
          i.id === cartItemId ? { ...i, qtd: novaQuantidade } : i
        )
      );

      const novoSubtotal = itens.reduce((soma, i) => {
        const qtd = i.id === cartItemId ? novaQuantidade : i.qtd;
        return soma + (i.preco * qtd);
      }, 0);
      setSubtotal(novoSubtotal);

    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      criarAlertaForcado(t("Erro ao atualizar quantidade"), "error");
    }
  };

  const excluirItemComAlerta = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);

      setItens(prev => prev.filter(item => item.id !== cartItemId));
      
      // Remover do set de selecionados também
      setItensSelecionados(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });

      const novoSubtotal = itens
        .filter(i => i.id !== cartItemId)
        .reduce((soma, i) => soma + (i.preco * i.qtd), 0);
      setSubtotal(novoSubtotal);

      criarAlertaForcado(t("Você removeu um item da sacola."), "success");
    } catch (error) {
      console.error('Erro ao remover item:', error);
      criarAlertaForcado(t("Erro ao remover item"), "error");
    }
  };

  function mostrarAlerta(mensagem, tipo = "success") {
    setAlerta({ mensagem, tipo });
    setTimeout(() => {
      setAlerta({ mensagem: "", tipo: "" });
    }, 3000);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (mostrarBusca && buscaRef.current && !buscaRef.current.contains(event.target)) {
        setMostrarBusca(false);
      }

      if (menuAberto &&
        menuLateralRef.current &&
        !menuLateralRef.current.contains(event.target) &&
        carrinhoRef.current &&
        !carrinhoRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarBusca, menuAberto]);

  useEffect(() => {
    return () => {
      if (menuAberto) {
        setMenuAberto(false);
      }
    };
  }, [menuAberto]);

  const fecharCarrinhoERedirecionar = () => {
    setMenuAberto(false);
  };

  const toggleCarrinho = () => {
    setMenuAberto(prev => !prev);
  };

  return (
    <header>
      <div className="topo">
        {/* LOGO + MENU */}
        <div className="conjunto1">
          <div
            className="hamburguer"
            onClick={() => setMenuMobileAberto(true)}
            role="button"
            aria-label={t("Abrir menu")}
          >
            <img src={Images.MenuIcon} alt={t("Menu")} />
          </div>

          <div className="logo">
            <Link to="/">
              <img src={Images.LogoNova} alt={t("Logo")} />
            </Link>
          </div>
        </div>

        {/* MENU DESKTOP */}
        <DesktopMenu t={t} />

        {/* SEARCH BAR */}
        <SearchBar
          termoBusca={termoBusca}
          setTermoBusca={setTermoBusca}
          mostrarBusca={mostrarBusca}
          setMostrarBusca={setMostrarBusca}
          realizarBusca={realizarBusca}
          buscaRef={buscaRef}
          t={t}
        />

        {/* AÇÕES */}
        <UserActions
          usuarioLogado={usuarioLogado}
          itens={itens}
          toggleCarrinho={toggleCarrinho}
          carrinhoRef={carrinhoRef}
          t={t}
        />
      </div>

      

      {/* MENU MOBILE REMOVIDO */}
      {/* MENU MOBILE */}
      <MobileMenu
        menuMobileAberto={menuMobileAberto}
        setMenuMobileAberto={setMenuMobileAberto}
        termoBuscaMobile={termoBuscaMobile}
        setTermoBuscaMobile={setTermoBuscaMobile}
        realizarBusca={realizarBusca}
        t={t}
      />
      <CartSidebar
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
        itens={itens}
        subtotal={subtotal}
        carregandoSacola={carregandoSacola}
        alterarQuantidade={alterarQuantidade}
        excluirItemComAlerta={excluirItemComAlerta}
        fecharCarrinhoERedirecionar={fecharCarrinhoERedirecionar}
        obterCorHex={obterCorHex}
        t={t}
        menuLateralRef={menuLateralRef}
        // NOVAS PROPS
        itensSelecionados={itensSelecionados}
        toggleSelecionarItem={toggleSelecionarItem}
        selecionarTodos={selecionarTodos}
        desmarcarTodos={desmarcarTodos}
        totalSelecionado={totalSelecionado}
      />
    </header>
  );
}