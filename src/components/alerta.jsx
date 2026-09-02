import { useEffect } from "react";
import "../assets/css/sacola.css";

export default function Alert({ type = "info", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alerta ${type}`}>
      {message}
    </div>
  );
}
