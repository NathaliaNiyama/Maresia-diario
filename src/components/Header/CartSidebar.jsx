import { Link } from "react-router-dom";
import Images from "../../assets/img";

export default function CartSidebar({
  menuAberto,
  setMenuAberto,
  itens,
  subtotal,
  carregandoSacola,
  alterarQuantidade,
  excluirItemComAlerta,
  fecharCarrinhoERedirecionar,
  obterCorHex,
  t,
  menuLateralRef,
  itensSelecionados,
  toggleSelecionarItem,
  selecionarTodos,
  desmarcarTodos,
  totalSelecionado
}) {
  const todosSelecionados = itens.length > 0 && itens.every(item => itensSelecionados.has(item.id));

  return (
    <>
      {/* OVERLAY */}
      {menuAberto && (
        <div
          className="overlay"
          style={{ opacity: 1, visibility: "visible" }}
          onClick={() => setMenuAberto(false)}
        ></div>
      )}

      {/* MENU LATERAL */}
      <div
        className="menu-lateral"
        style={{ right: menuAberto ? 0 : "-600px" }}
        ref={menuLateralRef}
      >
        <div className="itens">
          {carregandoSacola ? (
            <p style={{ textAlign: "center", color: "#524b4b" }}>
              {t("Carregando...")}
            </p>
          ) : itens.length === 0 ? (
            <p style={{ textAlign: "center", color: "#524b4b" }}>
              {t("Você ainda não possui itens na sacola.")}
            </p>
          ) : (
            <>
              {itens.map(item => (
                <div className="item-carrinho" key={item.id}>
                  <img src={item.img} alt={item.nome} />

                  <div className="detalhes-item">
                    <div className="detalhes-produto-header-alinhamento">
                      <div className="detalhes-produto-header">
                        <h1>{item.nome}</h1>
                        <p>R$ {item.preco.toFixed(2).replace(".", ",")}</p>

                        <div className="info-adicional">
                          {item.medida && (
                            <div className="medida">{item.medida}</div>
                          )}

                          {item.cor && (
                            <div className="cor-indicador">
                              <div
                                className={
                                  obterCorHex(item.cor) === "#ffffff"
                                    ? "corh"
                                    : "cor2h"
                                }
                                style={{
                                  backgroundColor: obterCorHex(item.cor),
                                  border:
                                    obterCorHex(item.cor) === "#ffffff"
                                      ? "1px solid #ddd"
                                      : "none"
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={itensSelecionados.has(item.id)}
                          onChange={() => toggleSelecionarItem(item.id)}
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            accentColor: "#524b4b"
                          }}
                        />
                      </div>
                    </div>

                    <div className="controles-item">
                      <div className="quantidade">
                        <button onClick={() => alterarQuantidade(item.id, -1)}>-</button>
                        <p style={{ width: "25px", textAlign: "center" }}>{item.qtd} {t("uni.")}</p>
                        <button onClick={() => alterarQuantidade(item.id, 1)}>+</button>
                      </div>

                      <p className="preco-mobile">R$ {item.preco.toFixed(2).replace(".", ",")}</p>

                      <button
                        className="excluir"
                        onClick={() => excluirItemComAlerta(item.id)}
                        aria-label={t("Remover item")}
                      >
                        <img src={Images.LixeiraIcon} alt={t("Excluir")} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="fechar-pedido">
          <div className="selecao-header" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderBottom: "1px solid #eee",
            marginBottom: "10px",
            paddingBottom: "10px",
          }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              cursor: "pointer"
            }}>
              <input
                type="checkbox"
                checked={todosSelecionados}
                onChange={(e) => {
                  if (e.target.checked) {
                    selecionarTodos();
                  } else {
                    desmarcarTodos();
                  }
                }}
                style={{ 
                  width: "18px", 
                  height: "18px", 
                  cursor: "pointer",
                  accentColor: "#524b4b"
                }}
              />
              <span style={{ fontSize: "14px", fontWeight: "500", width: "150px" }}>
                {t("Selecionar todos")}
              </span>
            </label>

            <p style={{ 
              fontWeight: "bold", 
              fontSize: "16px",
              color: "#524b4b",
              margin: 0,
              marginLeft: "70px"
            }}>
              {t("Total:")} R$ {totalSelecionado.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <Link
              to="/sacola"  // ✅ CORRIGIDO: AGORA VAI PARA /sacola
              onClick={(e) => {
                if (itensSelecionados.size === 0) {
                  e.preventDefault();
                  const alertaDiv = document.createElement('div');
                  alertaDiv.className = 'alerta-forcado-manual';
                  alertaDiv.style.cssText = 'position:fixed;left:50%;top:20px;transform:translateX(-50%);z-index:999999;padding:12px 20px;border-radius:5px;color:#fff;background:#dc3545;text-align:center;font-family:Arial, sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.2);';
                  alertaDiv.textContent = t("Selecione pelo menos um item para comprar");
                  document.body.appendChild(alertaDiv);
                  setTimeout(() => alertaDiv.remove(), 3000);
                  return;
                }
                const itensParaComprar = itens.filter(item => itensSelecionados.has(item.id));
                localStorage.setItem('checkoutItems', JSON.stringify(itensParaComprar));
                fecharCarrinhoERedirecionar();
              }}
              style={{
                flex: 1,
                backgroundColor: "#524b4b",
                color: "#fff",
                textAlign: "center",
                fontSize: "14px",
                padding: "12px",
                borderRadius: "30px",
                textDecoration: "none",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#3a3434"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#524b4b"}
            >
              {t("Comprar selecionados")} ({itensSelecionados.size})
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}