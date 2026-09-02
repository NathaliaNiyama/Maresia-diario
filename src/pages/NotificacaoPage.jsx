import React from "react";
import "./../assets/css/notificacao.css";
import SacolaNotificacoes from "../assets/img/sacola-notificacoes.png";
import SetaNotificacoes from "../assets/img/seta-notificacoes.png";
import Caminhao from "../assets/img/caminhao-notificacoes.png";
import PagamentoNotificacoes from "../assets/img/cartao-notificacoes.png";

export default function NotificacaoPage({ open, setOpen }) {
  

  return (
    <>
      <div
      className={`notificacao-overlay ${open ? "open" : ""}`}
      onClick={() => setOpen(false)}
    />

    <div className={`notificacao-sidebar ${open ? "open" : ""}`}>
      
      <div className="header-mobile">
        <button className="back" onClick={() => setOpen(false)}>
          <img src={SetaNotificacoes} className="icon" />
        </button>
        <h3>Notificacoes</h3>
      </div>

        {/* Itens */}
        <div className="item-content">
          <div className="item">
            <img src={SacolaNotificacoes} className="icon" />
            <p>O código do pedido 11111 foi confirmado</p>
          </div>
        </div>

        <div className="item-content">
          <div className="item">
            <img src={Caminhao} className="icon" />
            <p>Seu pedido saiu para entrega</p>
          </div>
        </div>

        <div className="item-content">
          <div className="item">
            <img src={PagamentoNotificacoes} className="icon" />
            <p>Pagamento foi efetuado com sucesso</p>
          </div>
        </div>

      </div>
    </>
  );
}