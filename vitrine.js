(() => {
  let imoveis = [];
  const dinheiro = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const texto = valor => String(valor ?? "");
  const normalizar = valor => texto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  function elemento(tag, conteudo, classe) {
    const el = document.createElement(tag);
    if (conteudo !== undefined) el.textContent = conteudo;
    if (classe) el.className = classe;
    return el;
  }

  function fotosDo(imovel) {
    let fotos = imovel.fotos;
    if (typeof fotos === "string") {
      try {
        fotos = JSON.parse(fotos);
      } catch {
        fotos = [fotos];
      }
    }
    return Array.isArray(fotos)
      ? fotos.filter(url =>
          typeof url === "string" && /^https:\/\//i.test(url)
        )
      : [];
  }

  function caracteristicas(imovel) {
    return [
      imovel.dormitorios
        ? `${imovel.dormitorios} dormitórios` : "",
      imovel.banheiros
        ? `${imovel.banheiros} banheiros` : "",
      imovel.area ? `${imovel.area} m²` : "",
      imovel.vagas ? `${imovel.vagas} vagas` : ""
    ].filter(Boolean).join(" | ");
  }

  function imagem(url, titulo) {
    const img = elemento("img");
    img.src = url;
    img.alt = titulo || "Foto do imóvel";
    img.loading = "lazy";
    img.style.cssText =
      "width:100%;height:220px;object-fit:cover;display:block";
    return img;
  }

  function fecharDetalhes() {
    document.getElementById("lv-detalhes")?.remove();
  }

  function abrirImovel(imovel) {
    fecharDetalhes();

    const painel = elemento("section", undefined, "card");
    painel.id = "lv-detalhes";
    painel.style.cssText = "padding:22px;margin-bottom:30px";

    const voltar = elemento("button", "← Voltar aos imóveis");
    voltar.type = "button";
    voltar.onclick = () => {
      history.replaceState(null, "", location.pathname + location.search);
      fecharDetalhes();
      document.getElementById("cards").scrollIntoView({
        behavior: "smooth"
      });
    };

    painel.append(
      voltar,
      elemento("h2", imovel.titulo || "Imóvel L&V"),
      elemento("p",
        [imovel.bairro, imovel.cidade].filter(Boolean).join(" — ")),
      elemento("p",
        [imovel.tipo, imovel.finalidade].filter(Boolean).join(" · ")),
      elemento("p", caracteristicas(imovel)),
      elemento("p", dinheiro.format(Number(imovel.preco) || 0), "price")
    );

    const galeria = elemento("div");
    galeria.style.cssText =
      "display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px";

    fotosDo(imovel).forEach(url => {
      const link = elemento("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.append(imagem(url, imovel.titulo));
      galeria.append(link);
    });

    painel.append(galeria);

    const descricao = elemento("p",
      imovel.descricao || "Entre em contato para mais informações.");
    descricao.style.cssText =
      "white-space:pre-wrap;line-height:1.7;margin:24px 0";
    painel.append(descricao);

    const contato = elemento("a", "Tenho interesse neste imóvel", "btn");
    contato.href = "https://wa.me/5551996169051?text=" +
      encodeURIComponent(
        `Olá! Tenho interesse no imóvel: ${imovel.titulo}.\n` +
        location.href
      );
    contato.target = "_blank";
    contato.rel = "noopener noreferrer";
    painel.append(contato);

    const cards = document.getElementById("cards");
    cards.before(painel);
    painel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function abrirPeloLink() {
    const id = new URLSearchParams(location.hash.slice(1)).get("imovel");
    if (!id) {
      fecharDetalhes();
      return;
    }
    const imovel = imoveis.find(item => texto(item.id) === id);
    if (imovel) abrirImovel(imovel);
  }

  function renderizar() {
    const cards = document.getElementById("cards");
    if (!cards) return;

    const busca = normalizar(document.getElementById("busca")?.value);
    const tipo = normalizar(document.getElementById("tipo")?.value);
    const finalidade = normalizar(
      document.getElementById("finalidade")?.value
    );

    fecharDetalhes();
    cards.replaceChildren();

    const encontrados = imoveis.filter(imovel => {
      const local = normalizar(
        `${imovel.titulo || ""} ${imovel.bairro || ""} ${imovel.cidade || ""}`
      );
      return local.includes(busca) &&
        (!tipo || normalizar(imovel.tipo) === tipo) &&
        (!finalidade || normalizar(imovel.finalidade) === finalidade);
    });

    if (!encontrados.length) {
      cards.append(elemento("p",
        "Nenhum imóvel encontrado com esses filtros.", "empty"));
      return;
    }

    encontrados.forEach(imovel => {
      const card = elemento("article", undefined, "card");
      const fotos = fotosDo(imovel);
      if (fotos.length) {
        card.append(imagem(fotos[0], imovel.titulo));
      }

      const info = elemento("div", undefined, "details");
      const link = elemento("a", "Ver imóvel", "btn");
      link.href = "#imovel=" + encodeURIComponent(imovel.id);
      link.onclick = event => {
        event.preventDefault();
        history.pushState(null, "", link.href);
        abrirImovel(imovel);
      };

      info.append(
        elemento("h3", imovel.titulo || "Imóvel L&V"),
        elemento("p",
          [imovel.bairro, imovel.cidade].filter(Boolean).join(" — ")),
        elemento("p", caracteristicas(imovel)),
        elemento("p",
          dinheiro.format(Number(imovel.preco) || 0), "price"),
        link
      );

      card.append(info);
      cards.append(card);
    });
  }

  async function iniciar() {
    window.render = renderizar;
    const cards = document.getElementById("cards");
    if (!cards) return;
    cards.replaceChildren(elemento("p", "Carregando imóveis…", "empty"));

    document.getElementById("busca")?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        renderizar();
      }
    });

    try {
      imoveis = await window.carregarImoveisLV();
      renderizar();
      abrirPeloLink();
    } catch (erro) {
      cards.replaceChildren(elemento("p",
        "Não foi possível carregar os imóveis. Atualize a página para tentar novamente.",
        "empty"));
      console.error(erro);
    }

    window.addEventListener("hashchange", abrirPeloLink);
    window.addEventListener("popstate", abrirPeloLink);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
