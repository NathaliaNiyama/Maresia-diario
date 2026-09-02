import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Images from "../assets/img";
import "../assets/css/colecoesPage.css";
import { useTranslation } from "react-i18next";

export default function ColecoesPage() {
  const { t } = useTranslation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [itens, setItens] = useState([
    {
      id: 1,
      nome: "Vestido Saída Floral",
      preco: 159.9,
      qtd: 1,
      medida: "P",
      cor: "branca",
      img: Images.Vestido,
    },
    {
      id: 2,
      nome: "Canga Estampada",
      preco: 69.9,
      qtd: 1,
      cor: "azul",
      img: Images.Vestido,
    },
  ]);

  return (
    <>
      <main>
        <div className="colecoes-title">
          <h1>{t("Coleções")}</h1>
          <hr />
        </div>

        <div className="colecoes-conteiner">
          <div className="colecoes">
            <div className="colecao-item">
              <Link to="/colecao?colecao=Maré Serena"> {/* MUDADO AQUI */}
                <img src={Images.Colecao1} alt="Capa Maré Serena" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?colecao=Maré Serena">Maré Serena</Link> {/* MUDADO AQUI */}
              </div>
            </div>

            <div className="colecao-item">
              <Link to="/colecao?colecao=Floral Atlântico"> {/* MUDADO AQUI */}
                <img src={Images.Colecao2} alt="Capa Floral Atlântico" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?colecao=Floral Atlântico">Floral Atlântico</Link> {/* MUDADO AQUI */}
              </div>
            </div>

            <div className="colecao-item">
              <Link to="/colecao?colecao=Ecos do Mar"> {/* MUDADO AQUI */}
                <img src={Images.Colecoes4} alt="Capa Ecos do Mar" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?colecao=Ecos do Mar">Ecos do Mar</Link> {/* MUDADO AQUI */}
              </div>
            </div>

            <div className="colecao-item">
              <Link to="/colecao?colecao=Pérola Salgada"> {/* MUDADO AQUI */}
                <img src={Images.Colecao3} alt="Capa Pérola Salgada" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?colecao=Pérola Salgada">Pérola Salgada</Link> {/* MUDADO AQUI */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}