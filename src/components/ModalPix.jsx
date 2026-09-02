import { useState } from "react";
import Alert from "./alerta";
import "../assets/css/ModalPix.css";
import qrCodePix from "../assets/img/pixQrCode.png";



export default function ModalPix({
    aberto,
    onClose,
    onConfirmar,
}) {


    const [alerta, setAlerta] = useState(null);
    const codigo =
        "9a7c5d21-3f84-4e6b-b8a2-1c9d7f4e2a6b";
    const copiarCodigo = () => {
        navigator.clipboard.writeText(codigo);

        setAlerta({
            type: "sucesso",
            message: "Código PIX copiado!",
        });

    };
    if (!aberto) return null;
    return (
        <>
            {alerta && (
                <Alert
                    type={alerta.type}
                    message={alerta.message}
                    onClose={() => setAlerta(null)}
                />
            )}

            <div className="modal-overlay" onClick={onClose}>
                <div
                    className="modal-pix"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="topo-modal">
                        <h3>Pix</h3>

                        <button
                            className="fechar-modal"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    <p className="texto-modal">
                        Escaneie o QRCode, ou então copie o código abaixo:
                    </p>

                    <img
                        src={qrCodePix}
                        alt="QR Code PIX"
                        className="qr-pix"
                        onDoubleClick={() => {
                            setAlerta({
                                type: "sucesso",
                                message: "Pagamento confirmado com sucesso!",
                            });

                            setTimeout(() => {
                                onConfirmar();
                            }, 1200);
                        }}
                    />

                    <div className="codigo-pix">
                        <span>{codigo}</span>

                        <button onClick={copiarCodigo}>
                            Copiar
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}