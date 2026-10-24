alert("L&V: vitrine.js carregou!");
async function mostrarVitrineLV() {
  const aviso = [...document.querySelectorAll(".empty")]
    .find(el => el.textContent.includes("Em breve, nossos imóveis"));

  if (!aviso) return;

  try {
    const imoveis = await window.carregarImoveisLV();

    if (!imoveis.length) {
  aviso.textContent = "Nenhum imóvel retornou do Supabase.";
  return;
}

    const vitrine = document.createElement("div");
    vitrine.className = "lv-vitrine";
    vitrine.style.cssText =
      "display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;";

    const dinheiro = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    });

    imoveis.forEach(imovel => {
      const card = document.createElement("article");
      card.style.cssText =
        "background:white;border:1px solid #ddd;border-radius:12px;overflow:hidden;";

      const foto = Array.isArray(imovel.fotos)
        ? imovel.fotos.find(url => /^https:\/\//.test(url))
        : null;

      if (foto) {
        const img = document.createElement("img");
        img.src = foto;
        img.alt = imovel.titulo || "Imóvel L&V";
        img.loading = "lazy";
        img.style.cssText =
          "width:100%;height:190px;object-fit:cover;";
        card.appendChild(img);
      }

      const info = document.createElement("div");
      info.style.padding = "18px";

      function linha(texto, destaque = false) {
        const p = document.createElement("p");
        p.textContent = texto;
        p.style.cssText = destaque
          ? "font-weight:bold;font-size:22px;color:#ac8a3f;"
          : "margin:10px 0;";
        info.appendChild(p);
      }

      linha(imovel.titulo || "Imóvel L&V", true);
      linha([imovel.bairro, imovel.cidade].filter(Boolean).join(" - "));
      linha([
        imovel.dormitorios ? `${imovel.dormitorios} dormitórios` : "",
        imovel.area ? `${imovel.area} m²` : "",
        imovel.vagas ? `${imovel.vagas} vagas` : ""
      ].filter(Boolean).join(" | "));

      linha(dinheiro.format(Number(imovel.preco) || 0), true);

      card.appendChild(info);
      vitrine.appendChild(card);
    });

    aviso.replaceWith(vitrine);
  } catch (erro) {
   aviso.textContent = "Erro na conexão: " + erro.message;
  }
}

document.addEventListener("DOMContentLoaded", mostrarVitrineLV);
