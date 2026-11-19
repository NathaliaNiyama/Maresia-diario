import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../assets/css/banner.css";
import Images from "../assets/img";

export default function Banner() {
  const slides = [
    {
      img: Images.colecao1,
      link: "/colecao?colecao=Maré Serena",
      textos: ["THE", "MARÉ SERENA"],
      cores: ["white", "white"]
    },
    {
      img: Images.capaFloral,
      link: "/colecao?colecao=Floral Atlântico",
      textos: ["THE", "FLORAL ATLÂNTICO", ""],
      cores: ["white", "white"]
    },
    {
      img: Images.capaEcos,
      link: "/colecao?colecao=Ecos do Mar",
      textos: ["THE", "ECOS DO MAR"],
      cores: ["white", "white"]
    },
    {
      img: Images.capaPerola,
      link: "/colecao?colecao=Pérola Salgada",
      textos: ["THE", "PÉROLA SALGADA"],
      cores: ["white", "white"]
    },
  ];

  const DURATION = 5000;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fillBars, setFillBars] = useState(
    Array(slides.length).fill(false)
  );
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, DURATION);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentSlide, slides.length]);

  useEffect(() => {
    const newFill = Array(slides.length).fill(false);
    newFill[currentSlide] = true;
    setFillBars(newFill);
  }, [currentSlide, slides.length]);

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

              <Link
                to={slide.link}
                className="slide-text-link"
                aria-label={`Ir para ${slide.textos.join(" ")}`}
              >
                {slide.textos.map((text, i) => (
                  <div
                    key={i}
                    className="slide-text"
                    style={{
                      color: slide.cores ? slide.cores[i] : "white"
                    }}
                  >
                    {text}
                  </div>
                ))}
              </Link>

              <div className="slide-cta">
                <Link
                  to={slide.link}
                  className="btn-ver-colecao"
                  aria-label={`Ver coleção ${slide.textos.join(" ")}`}
                >
                  VER COLECAO
                </Link>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Botões */}
      <button
        className="prev-btn"
        aria-label="Slide Anterior"
        onClick={prevSlide}
      >
        <img src={Images.setaEsquerda} alt="Anterior" />
      </button>

      <button
        className="next-btn"
        aria-label="Próximo Slide"
        onClick={nextSlide}
      >
        <img src={Images.setaDireita} alt="Próximo" />
      </button>

      {/* Barras de progresso */}
      <div
        className="progress-bar-container"
        role="tablist"
        aria-label="Progresso dos slides"
      >
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
