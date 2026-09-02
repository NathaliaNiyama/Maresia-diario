import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "../assets/css/cadastroPage.css";
import { login, register, setStoredUser } from "../utils/auth";

export default function CadastroPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [veioDoCadastro, setVeioDoCadastro] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''

    
  });

  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    cpf: "",
    genero: "",
    email: "",
    telefone: "",
    usuario: "",
    senha: "",
    confirmarSenha: ""
  });
  const [generoDropdownAberto, setGeneroDropdownAberto] = useState(false);

  const [aceitouDiretrizes, setAceitouDiretrizes] = useState(false);

  useEffect(() => {
  const etapaSalva = sessionStorage.getItem("cadastroEtapa");
  const dadosSalvos = sessionStorage.getItem("cadastroDados");

  if (etapaSalva) {
    setMostrarCadastro(true);
    setEtapa(Number(etapaSalva));
  }

  if (dadosSalvos) {
    setFormData(JSON.parse(dadosSalvos));
  }
}, []);

  // ✅ DETECTA SE VEIO DO COMPONENTE CADASTRO E ABRE DIRETO NO FORMULÁRIO
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('cadastroParcial');
    const state = location.state;

    if (state?.abrirCadastro || dadosSalvos) {
      setMostrarCadastro(true);
      setEtapa(0);
      setVeioDoCadastro(true);

      if (dadosSalvos) {
        try {
          const { nome, email } = JSON.parse(dadosSalvos);
          setFormData(prev => ({
            ...prev,
            nome: nome || "",
            email: email || ""
          }));

          criarAlertaForcado(t("Encontramos seus dados preenchidos anteriormente!"), "success");

          setTimeout(() => {
            localStorage.removeItem('cadastroParcial');
          }, 3000);

        } catch (error) {
          console.error("Erro ao carregar dados salvos:", error);
        }
      }

      if (state?.dadosPreenchidos) {
        const { nome, email } = state.dadosPreenchidos;
        setFormData(prev => ({
          ...prev,
          nome: nome || "",
          email: email || ""
        }));
      }
    }
  }, [location.state, t]);

  

  // ✅ FUNÇÃO DE ALERTA FORÇADO (COM TRADUÇÃO)
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

    // ✅ Aplicar estilos individualmente para evitar sobrescrita
    alerta.style.position = 'fixed';
    alerta.style.left = '50%';
    alerta.style.top = '20px';
    alerta.style.transform = 'translateX(-50%) translateZ(0)';
    alerta.style.zIndex = '2147483647';
    alerta.style.padding = '17px 20px';
    alerta.style.borderRadius = '5px';
    alerta.style.color = '#fff';
    alerta.style.fontFamily = 'Arimo, sans-serif';
    alerta.style.minWidth = '500px';
    alerta.style.maxWidth = '90vw';
    alerta.style.backgroundColor = bgColor;
    alerta.style.borderLeft = `4px solid ${borderColor}`;
    alerta.style.textAlign = 'start';
    alerta.style.opacity = '0.97';
    alerta.style.willChange = 'transform';
    alerta.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    alerta.textContent = mensagem;
    document.body.appendChild(alerta);

    setTimeout(() => {
      if (alerta.parentNode) {
        alerta.remove();
      }
    }, 4000);

    alerta.onclick = () => alerta.remove();
  };

  // ✅ Validação de CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;

    return digito1 === parseInt(cpf.charAt(9)) && digito2 === parseInt(cpf.charAt(10));
  };

  // ✅ Validação de Email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // ✅ Validação de Telefone
  const validarTelefone = (telefone) => {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
  };

  // ✅ Validação de Senha
  const validarSenha = (senha) => {
    return senha.length >= 8;
  };

  // ✅ Validação de Data de Nascimento (maior de 13 anos)
  const validarIdade = (dataNascimento) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      return idade - 1 >= 13;
    }
    return idade >= 13;
  };

  // ✅ Formatação de CPF
  const formatarCPF = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  // ✅ Formatação de Telefone
  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    }
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const handleLoginChange = (e) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({
        username: loginData.username,
        password: loginData.password
      });

      console.log("Login response:", response);
      setStoredUser(response.user);

      window.dispatchEvent(new Event('loginSuccess'));

      criarAlertaForcado(t("Login realizado com sucesso!"), "success");
      setTimeout(() => navigate('/perfil'), 1500);
    } catch (error) {
      criarAlertaForcado(t("Credenciais inválidas"), "error");
    }
  };

  const handleChange = (campo, valor) => {
    if (campo === 'cpf') {
      valor = formatarCPF(valor);
    } else if (campo === 'telefone') {
      valor = formatarTelefone(valor);
    }

    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleNext = () => {
    // ✅ Validações da Etapa 1
    if (etapa === 0) {
      if (!formData.nome || !formData.dataNascimento || !formData.cpf || !formData.genero) {
        criarAlertaForcado(t("Preencha todos os campos da etapa 1."), "error");
        return;
      }

      if (formData.nome.trim().length < 3) {
        criarAlertaForcado(t("Nome deve ter pelo menos 3 caracteres."), "error");
        return;
      }

      if (!validarIdade(formData.dataNascimento)) {
        criarAlertaForcado(t("Você deve ter pelo menos 13 anos para se cadastrar."), "error");
        return;
      }

      if (!validarCPF(formData.cpf)) {
        criarAlertaForcado(t("CPF inválido."), "error");
        return;
      }
    }

    // ✅ Validações da Etapa 2
    if (etapa === 1) {
      if (!formData.email) {
        criarAlertaForcado(t("Preencha o e-mail."), "error");
        return;
      }

      if (!validarEmail(formData.email)) {
        criarAlertaForcado(t("E-mail inválido. Use o formato: exemplo@email.com"), "error");
        return;
      }

      if (formData.telefone && !validarTelefone(formData.telefone)) {
        criarAlertaForcado(t("Telefone inválido. Use 10 ou 11 dígitos."), "error");
        return;
      }
    }

    if (etapa < 2) setEtapa(etapa + 1);
  };

  const handleBack = () => {
    if (etapa > 0) setEtapa(etapa - 1);
  };

  const handleFinalizar = async (e) => {
    e.preventDefault();


    if (!aceitouDiretrizes) {
  criarAlertaForcado(
    t("Você precisa aceitar as Diretrizes e o Regulamento para finalizar o cadastro."),
    "error"
  );
  return;
}

    
    // ✅ Validações da Etapa 3
    if (!formData.usuario || !formData.senha || !formData.confirmarSenha) {
      criarAlertaForcado(t("Preencha todos os campos."), "error");
      return;
    }

    if (formData.usuario.length < 3) {
      criarAlertaForcado(t("Nome de usuário deve ter pelo menos 3 caracteres."), "error");
      return;
    }

    if (!validarSenha(formData.senha)) {
      criarAlertaForcado(t("A senha deve ter no mínimo 8 caracteres."), "error");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      criarAlertaForcado(t("As senhas não coincidem."), "error");
      return;
    }

    if (etapa !== 2) {
      criarAlertaForcado(t("Complete todas as etapas antes de finalizar."), "error");
      return;
    }

    try {
      const generoMap = {
        "Feminino": "F",
        "Masculino": "M",
        "Outro": "O"
      };

      const response = await register({
        name: formData.nome,
        username: formData.usuario,
        email: formData.email,
        password: formData.senha,
        birthdate: formData.dataNascimento ? new Date(formData.dataNascimento).toISOString() : null,
        cpf: formData.cpf.replace(/\D/g, ''),
        gender: generoMap[formData.genero] || formData.genero,
        phone: formData.telefone.replace(/\D/g, '')
      });

      console.log("Register response:", response);
      criarAlertaForcado(t("Cadastro realizado com sucesso! Por favor, faça login."), "success");
      setEtapa(0);
      setTimeout(() => {
        setFormData({
          nome: "",
          dataNascimento: "",
          cpf: "",
          genero: "",
          email: "",
          telefone: "",
          usuario: "",
          senha: "",
          confirmarSenha: ""
        });
        setMostrarCadastro(false);
        setVeioDoCadastro(false);
      }, 2000);
    } catch (error) {
  console.log(error);
  console.log(error.response);
  console.log(error.response?.data);

  criarAlertaForcado(
    error.response?.data?.message ||
      error.message ||
      "Erro ao cadastrar",
    "error"
  );
}
};

  const handleVoltar = () => {
    setEtapa(0);
    setMostrarCadastro(false);
    setVeioDoCadastro(false);
    navigate('/cadastro', { replace: true, state: {} });
  };

  // ✅ FUNÇÃO PARA INICIAR CADASTRO
  const iniciarCadastro = () => {
    setMostrarCadastro(true);
    setEtapa(0);
    setVeioDoCadastro(false);
  };

  return (
 <section className="formulario">

  <button
    className="seta-inicial"
    onClick={() => navigate("/")}
    type="button"
    aria-label="Voltar para página inicial"
  >
    ←
  </button>
      

      {/* ✅ SÓ MOSTRA O TÍTULO SE NÃO VEIO DO CADASTRO E NÃO ESTÁ NO MODO CADASTRO */}
      {!veioDoCadastro && !mostrarCadastro && (
        <h2 className="titulo-form">
          {t("Entrar / Cadastro")}
        </h2>
      )}

      <div className="formulario-conteudo">
        {/* Formulário de Login - SÓ MOSTRA SE NÃO VEIO DO CADASTRO E NÃO ESTÁ NO CADASTRO */}
        {!mostrarCadastro && !veioDoCadastro && (
          <form className="forms login-form" onSubmit={handleLoginSubmit}>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              placeholder={t("Nome de Usuário")}
              required
              minLength={3}
            />
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder={t("Senha")}
              required
              minLength={8}
            />
            <button type="submit">
              <span>{t("Entrar")}</span>
            </button>
            <span className="acesso" onClick={iniciarCadastro}>
              {t("Primeiro Acesso →")}
            </span>
          </form>
        )}

        {/* Formulário de Cadastro em Etapas - MOSTRA SE VEIO DO CADASTRO OU CLICOU EM PRIMEIRO ACESSO */}
        {mostrarCadastro && (
          <div className="cadastro-steps visivel">
            {/* Etapa 1 - Informações Pessoais */}
            {etapa === 0 && (
              <div className="step-content step-1 visivel">
                <h2>{t("Informações Pessoais")}</h2>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                  {t("Complete suas informações para finalizar o cadastro.")}
                </p>
                <form>
                  <input
                    type="text"
                    placeholder={t("Nome Completo")}
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    required
                    minLength={3}
                  />
                  <input
                    type="date"
                    placeholder={t("Data de Nascimento")}
                    value={formData.dataNascimento}
                    onChange={(e) => handleChange("dataNascimento", e.target.value)}
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  />
                  <input
                    type="text"
                    placeholder={t("CPF")}
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    required
                    maxLength={14}
                  />

                  {/* Dropdown de Gênero */}
                  <div className="dropdown-genero-container">
                    <div
                      className={`dropdown-genero ${generoDropdownAberto ? "ativo" : ""}`}
                      onClick={() => setGeneroDropdownAberto(!generoDropdownAberto)}
                    >
                      <div className="dropdown-selecionado">
                        {formData.genero || t("Selecione")}
                      </div>
                      <ul className="dropdown-opcoes">
                        {[t("Feminino"), t("Masculino"), t("Outro")].map((opcao) => (
                          <li
                            key={opcao}
                            onClick={(e) => {
                              e.stopPropagation();
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

                  <div className="progress-steps">
                    <span className={`step ${etapa === 0 ? "active" : ""}`} />
                    <span className="step" />
                    <span className="step" />
                  </div>

                  <div className="botoes">
                    <button type="button" onClick={handleVoltar}>
                      {t("Cancelar")}
                    </button>
                    <button type="button" onClick={handleNext}>
                      {t("Próximo")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Etapa 2 - Dados de Contato */}
            {etapa === 1 && (
              <div className="step-content step-2 visivel">
                <h2>{t("Dados de contato")}</h2>
                <form>
                  <input
                    type="email"
                    placeholder={t("E-mail")}
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder={t("Telefone")}
                    value={formData.telefone}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                    maxLength={15}
                  />

                  <div className="progress-steps">
                    <span className="step" />
                    <span className={`step ${etapa === 1 ? "active" : ""}`} />
                    <span className="step" />
                  </div>

                  <div className="botoes">
                    <button type="button" onClick={handleBack}>
                      {t("Voltar")}
                    </button>
                    <button type="button" onClick={handleNext}>
                      {t("Próximo")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Etapa 3 - Crie Sua Conta */}
            {etapa === 2 && (
              <div className="step-content step-3 visivel">
                <h2>{t("Crie Sua Conta")}</h2>
                <form onSubmit={handleFinalizar}>
                  <input
                    type="text"
                    placeholder={t("Nome de Usuário")}
                    value={formData.usuario}
                    onChange={(e) => handleChange("usuario", e.target.value)}
                    required
                    minLength={3}
                  />
                  <input
                    type="password"
                    placeholder={t("Senha (mínimo 8 caracteres)")}
                    value={formData.senha}
                    onChange={(e) => handleChange("senha", e.target.value)}
                    required
                    minLength={8}
                  />
                  <input
                    type="password"
                    placeholder={t("Confirme Sua Senha")}
                    value={formData.confirmarSenha}
                    onChange={(e) => handleChange("confirmarSenha", e.target.value)}
                    required
                    minLength={8}
                  />

                
                 <>
<div className="termos-diretrizes">
  <label className="termos-label">
    <input
      type="checkbox"
      checked={aceitouDiretrizes}
      onChange={(e) => setAceitouDiretrizes(e.target.checked)}
      className="checkbox-diretrizes"
    />

    <span className="texto-termos">
      Li e concordo com as{" "}
      <span
        className="link-diretrizes"
        onClick={(e) => {
          e.preventDefault();

          sessionStorage.setItem("cadastroEtapa", etapa);
          sessionStorage.setItem(
            "cadastroDados",
            JSON.stringify(formData)
          );

          navigate("/sobrenos?secao=regulamento");
        }}
      >
        Diretrizes e Regulamento
      </span>
    </span>
  </label>
</div>

  <div className="progress-steps">
                    <span className="step" />
                    <span className="step" />
                    <span className={`step ${etapa === 2 ? "active" : ""}`} />
                  </div>




<div className="botoes">
  <button type="button" onClick={handleBack}>
    {t("Voltar")}
  </button>

<button type="submit">
  {t("Finalizar Cadastro")}
</button>
</div>
</>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}