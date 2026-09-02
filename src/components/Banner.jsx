import React, { useState, useEffect, useRef } from "react";
import "../assets/css/banner.css";
import Images from "../assets/img";

export default function Banner() {
  const slides = [
    { img: Images.colecao1, link: "mare-serena.html", textos: ["THE", "AREIA SALGADA"], cores: ["white", "white"] },
    { img: Images.capaFloral, link: "floral-atlantico.html", textos: ["THE", "ATLÂNTICO FLORAL", ""], cores: ["white", "white"] },
    { img: Images.capaEcos, link: "ecos.html", textos: ["THE", "ECOS DO MAR"], cores: ["white", "white"] },
    { img: Images.capaPerola, link: "perola.html", textos: ["THE", "PEROLA SALGADA"], cores: ["white", "white"] },
  ];

  const DURATION = 5000; // 8 segundos por slide
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fillBars, setFillBars] = useState(Array(slides.length).fill(false));
  const timerRef = useRef(null);

  // Avança automaticamente após DURATION; reinicia sempre que currentSlide muda.
  useEffect(() => {
    // limpa timeout anterior
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // seta o timeout para próximo slide
    timerRef.current = setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, DURATION);

    // limpa ao desmontar / antes do próximo effect
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentSlide, slides.length]);

  // Atualiza estado das barras: somente a barra do slide atual fica "ativa"
  useEffect(() => {
    const newFill = Array(slides.length).fill(false);
    newFill[currentSlide] = true;
    setFillBars(newFill);
  }, [currentSlide, slides.length]);

  // Navegação manual: limpa timer para reiniciar contagem (useEffect cuidará de reiniciar)
  const goToSlide = (index) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  return (
    <section className="banner">
      <div className="slides">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{
              backgroundImage: `url(${slide.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="slide-text-container">
              <a href={slide.link} className="slide-text-link" aria-label={`Ir para ${slide.textos.join(" ")}`}>
                {slide.textos.map((text, i) => (
                  <div
                    key={i}
                    className="slide-text"
                    style={{ color: slide.cores ? slide.cores[i] : "white" }}
                  >
                    {text}
                  </div>
                ))}
              </a>

              <div className="slide-cta">
                <a href={slide.link} className="btn-ver-colecao" aria-label={`Ver coleção ${slide.textos.join(" ")}`}>
                  VER COLECAO
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botões */}
      <button className="prev-btn" aria-label="Slide Anterior" onClick={prevSlide}>
        <img src={Images.setaEsquerda} alt="Anterior" />
      </button>
      <button className="next-btn" aria-label="Próximo Slide" onClick={nextSlide}>
        <img src={Images.setaDireita} alt="Próximo" />
      </button>

      {/* Barras de progresso */}
      <div className="progress-bar-container" role="tablist" aria-label="Progresso dos slides">
        {slides.map((_, index) => (
          <div
            key={index}
            role="tab"
            aria-selected={currentSlide === index}
            className={`progress-bar ${fillBars[index] ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
