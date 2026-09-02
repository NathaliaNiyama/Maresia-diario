import { Link } from "react-router-dom";
import "../assets/css/pagina404.css";
import Images from "../assets/img";

export default function NotFoundPage() {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <img src={Images.Img404} alt="Erro 404"/>

                <h1>Ops... Página não encontrada.</h1>
                <p>A página que você está procurando não existe ou foi movida.</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn-primary">
                        Voltar para a página inicial
                    </Link>
                </div>
            </div>
        </div>
    );
}