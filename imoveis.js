
async function carregarImoveisLV() {
  const config = window.LV_SUPABASE;

  if (!config || !config.publishableKey) {
    throw new Error("Configuracao do Supabase ausente.");
  }

  const filtros = new URLSearchParams({
    select: "id,titulo,descricao,tipo,finalidade,cidade,bairro,preco,area,dormitorios,banheiros,vagas,fotos,destaque",
    status: "eq.Disponível",
    order: "criado_em.desc"
  });

  const resposta = await fetch(
    `${config.url}/rest/v1/imoveis?${filtros}`,
    {
      headers: {
        apikey: config.publishableKey
      }
    }
  );

  if (!resposta.ok) {
    throw new Error("Nao foi possivel carregar os imoveis.");
  }

  return await resposta.json();
}

window.carregarImoveisLV = carregarImoveisLV;
