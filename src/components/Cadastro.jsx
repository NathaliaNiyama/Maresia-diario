import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/cadastro.css";
import Alert from "./alerta";
import { useTranslation } from "react-i18next";

export default function Cadastro() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [alerta, setAlerta] = useState(null);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");

    const mostrarAlerta = (mensagem, tipo = "info") => {
        setAlerta({ mensagem: t(mensagem), tipo });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nome.trim() || !email.trim()) {
            mostrarAlerta("Por favor, preencha todos os campos obrigatórios.", "error");
            return;
        }

        // ✅ SALVA OS DADOS NO LOCALSTORAGE
        const dadosCadastro = {
            nome: nome.trim(),
            email: email.trim(),
            timestamp: Date.now()
        };
        
        localStorage.setItem('cadastroParcial', JSON.stringify(dadosCadastro));
        
        mostrarAlerta("Redirecionando para cadastro completo...", "info");
        
        // ✅ REDIRECIONA PARA A PÁGINA DE CADASTRO COM STATE
        setTimeout(() => {
            navigate('/cadastro', { 
                state: { 
                    abrirCadastro: true,
                    dadosPreenchidos: dadosCadastro 
                } 
            });
        }, 1500);
    };

    return (
        <section>
            <hr />

            <div className="cadastro-container">
                <div className="cadastro">
                    <div className="cadastro-text">
                        <h3>{t("Cadastre-se")}</h3>
                        <p>
                            {t("Fique por dentro do que rola aqui e ganhe 25% de desconto na primeira compra no APP!")}
                        </p>
                    </div>

                    <div className="cadastro-add">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder={t("Nome e sobrenome")}
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder={t("E-mail")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">{t("Cadastre-se")}</button>
                        </form>
                    </div>
                </div>
            </div>

            {alerta && (
                <div id="alert-container">
                    <Alert
                        type={alerta.tipo}
                        message={alerta.mensagem}
                        onClose={() => setAlerta(null)}
                    />
                </div>
            )}

            <div className="cadastro-container">
                <div className="politica-cadastro cadastro">
                    <p>
                        {t("Ao se cadastrar na Maresia, você concorda que seus dados pessoais serão tratados para oferecer uma experiência personalizada em nossa loja. O cadastro é restrito a maiores de 18 anos. Antes de prosseguir, recomendamos que leia nossa")}{" "}
                        <a href="sobre.html?secao=regulamento">
                            {t("Política de Privacidade")}
                        </a>{" "}
                        {t("para entender como suas informações são utilizadas e protegidas.")}
                    </p>
                </div>
            </div>
        </section>
    );
}