import { useEffect, useState } from "react";
import "../assets/css/SelecionarParcelasModal.css";

export default function SelecionarParcelasModal({
  aberto,
  onClose,
  total,
  tipoPagamento,
  onConfirmar,
}) {
  const [parcelaSelecionada, setParcelaSelecionada] = useState(1);

  useEffect(() => {
    if (aberto) {
      setParcelaSelecionada(1);
    }
  }, [aberto, tipoPagamento]);

  if (!aberto) return null;

  const parcelas =
    tipoPagamento === "debito"
      ? [1]
      : [1, 2, 3, 4, 5];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-parcelas"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="topo-modal">
          <h2>
            {tipoPagamento === "debito"
              ? "Cartão de débito"
              : "Cartão de crédito"}
          </h2>

          <button
            type="button"
            className="fechar-modal"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="texto-modal">
          {tipoPagamento === "debito"
            ? "Confira abaixo a opção de pagamento:"
            : "Selecione abaixo uma das opções de parcelamento:"}
        </p>

        <div className="lista-parcelas">
          {parcelas.map((parcela) => (
            <label
              key={parcela}
              className={`item-parcela ${
                parcelaSelecionada === parcela
                  ? "selecionado"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="parcela"
                value={parcela}
                checked={parcelaSelecionada === parcela}
                onChange={() =>
                  setParcelaSelecionada(parcela)
                }
              />

              <span className="quadrado"></span>

              <span className="texto-parcela">
                {parcela}x de R${" "}
                {(total / parcela)
                  .toFixed(2)
                  .replace(".", ",")}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          className="btn-confirmar-parcela"
          onClick={() =>
            onConfirmar(parcelaSelecionada)
          }
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}