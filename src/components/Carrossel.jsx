import React, { useState, useEffect } from "react";
import "../assets/css/carrossel.css";
import Images from "../assets/img";
import { useTranslation } from "react-i18next";

export default function Carrossel() {
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Função para obter os slides baseados no idioma
  const getSlides = () => {
    return i18n.language === "pt" 
      ? [Images.slide1, Images.slide2, Images.slide3, Images.slide4]
      : [Images.slideTraducao1, Images.slideTraducao2, Images.slideTraducao3, Images.slideTraducao4];
  };

  const slides = getSlides();

  // Funções de navegação
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Slide automático a cada 15s
  useEffect(() => {
    const interval = setInterval(nextSlide, 15000);
    return () => clearInterval(interval);
  }, []);

  // Reset para o primeiro slide quando o idioma mudar
  useEffect(() => {
    setCurrentIndex(0);
  }, [i18n.language]);

  return (
    <section>
      <div className="carrossel-container">
        <div className="h1"><h1>{t("Descubra as tendências do momento")}</h1></div>

        <div className="carousel">
          <div
            className="carrossel-wrapper"
            style={{ transform: `translateX(-${currentIndex * 100}vw)` }}
          >
            {slides.map((slide, index) => (
              <div className={`carrossel-item slide${index + 1}`} key={index}>
                <a href="#">
                  <img src={slide} alt={t(`Slide ${index + 1}`)} />
                </a>
              </div>
            ))}
          </div>

          {/* Botões laterais */}
          <button className="btn btn-prev" onClick={prevSlide}>
            <img
              src={Images.prevIcon}
              alt={t("Anterior")}
              style={{ transform: "rotate(90deg)" }}
            />
          </button>
          <button className="btn btn-next" onClick={nextSlide}>
            <img src={Images.nextIcon} alt={t("Próximo")} />
          </button>

          {/* Indicadores */}
          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}