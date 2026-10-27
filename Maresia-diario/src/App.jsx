import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Filtros from "./components/Filtros";
import Catalogo from "./components/Catalogo";
import Carrossel from "./components/Carrossel";
import Cadastro from "./components/Cadastro";
import Footer from "./components/Footer";
import CatalogoRelacionado from "./components/CatalogoRelacionado";
import Sidebar from "./components/Sidebar";

// Páginas
import CadastroPage from "./pages/CadastroPage";
import Colecoes from "./pages/ColecoesPage";
import SobreNos from "./pages/SobreNos";
import Perfil from "./pages/Perfil";
import Sacola from "./pages/SacolaPage"; 
import CatalogoPage from "./pages/CatalogoPage";
import Categorias from "./pages/Categorias";
import ColecaoPage from "./pages/ColecaoPage";
import ProdutoPage from "./pages/ProdutoPage";
import Busca from "./pages/Busca"; // 🔍 NOVA IMPORTAÇÃO
import Pagina404 from "./pages/Pagina404"; 
import { useRouteError } from "react-router-dom";
import MeusPedidos from "./pages/MeusPedidos";
import Checkout from "./pages/Checkout";


function AppContent() {
  const location = useLocation();

  // Rotas que NÃO devem exibir o Footer
  const hiddenFooterRoutes = ["/cadastro", "/colecoes", "/Perfil", "/sacola", "/busca", "/meus-pedidos"];

  // Verifica se é uma rota 404 - precisamos de uma lógica diferente
  const rotasExistentes = [
    "/", "/cadastro", "/sobrenos", "/perfil", 
    "/sacola", "/catalogo", "/colecao", "/busca", "/meus-pedidos" // 🔍 ADICIONADO /busca e /meus-pedidos
  ];
  
  // Verifica se a rota atual NÃO existe na lista de rotas válidas
  // E não começa com /produto/ (que é uma rota dinâmica)
  const isNotFoundPage = !rotasExistentes.includes(location.pathname) && 
                        !location.pathname.startsWith("/produto/") &&
                        !location.pathname.startsWith("/busca"); // 🔍 ADICIONADO verificação /busca

  return (
    <>
      <Header />

      <Routes>
        {/* Página inicial */}
        <Route
          path="/"
          element={
            <>
              <Banner />
              <Catalogo hideFilters={true} />
              <Cadastro />
            </>
          }
        />

        {/* Páginas existentes */}
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/colecoes" element={<Colecoes />} />
        <Route path="/sobrenos" element={<SobreNos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/sacola" element={<Sacola />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/colecao" element={<ColecaoPage />} />
        <Route path="/produto/:id" element={<ProdutoPage />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} /> {/* NOVA ROTA MEUS PEDIDOS */}
         <Route path="/categorias" element={<Categorias />} />
        <Route path="/checkout" element={<Checkout />} />
        {/* 🔍 NOVA ROTA DE BUSCA */}
        <Route path="/busca" element={<Busca />} />

        {/* Rota 404 - Captura qualquer rota não definida */}
        <Route path="*" element={<Pagina404 />} />
      </Routes>

      {/* Footer só aparece se a rota atual NÃO estiver na lista E não for 404 */}
      {!hiddenFooterRoutes.includes(location.pathname) && !isNotFoundPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 