// Selecionando o campo de busca
const buscarPais = document.querySelector("#buscar-pais");

// Selecionando a área de resultados
const resultadoBusca = document.querySelector("#resultado-pesquisa");

// URL base da API do IBGE
const apiUrlIBGE = "https://servicodados.ibge.gov.br/api/v1/localidades/paises";

// URL base da API da Wikipedia
const apiUrlWikipedia = "https://pt.wikipedia.org/api/rest_v1/page/summary";

// Chave de API do Pexels
const pexelsApiKey = "IiXwaC647Muko1zMTlxKzUIikq6XCNWK0LcmL1AdQsXOZCXig7O3QEvw";

// Função assíncrona para realizar a busca de países
async function realizarBusca() {
  try {
    // Obtendo o valor digitado no campo de busca e convertendo para minúsculas
    const paisDigitado = buscarPais.value.toLowerCase();

    // Fazendo uma solicitação GET para a API do IBGE
    const response = await fetch(apiUrlIBGE);

    // Verificando se a solicitação foi bem-sucedida
    if (!response.ok) {
      throw new Error("Erro ao buscar os dados");
    }

    // Convertendo a resposta em formato JSON
    const data = await response.json();

    // Filtrando os países com base no valor digitado
    const paises = data.filter((pais) =>
      pais.nome.toLowerCase().includes(paisDigitado)
    );

    // Limpando resultados anteriores
    resultadoBusca.innerHTML = "";

    // Exibindo os resultados da busca
    exibirResultados(paises);
  } catch (error) {
    console.error("Erro ao realizar busca:", error);
  }
}

// Função para exibir os resultados de busca na área de resultados
function exibirResultados(paises) {
  // Criando uma lista não ordenada para mostrar os países
  const ul = document.createElement("ul");
  
  // Iterando sobre os países e criando um item de lista para cada um deles
  paises.forEach((pais, key) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = pais.nome;
    link.classList.add("pais-link");
    link.dataset.nomePais = pais.nome; // Adicionando um atributo de dados para armazenar o nome do país
    li.appendChild(link);
    ul.appendChild(li);
  });
  
  // Adicionando a lista de países à área de resultados
  resultadoBusca.appendChild(ul);
  
  // Adicionando um event listener aos links dos países para buscar informações adicionais ao serem clicados
  const linksPaises = document.querySelectorAll(".pais-link");
  linksPaises.forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevenindo o comportamento padrão de seguir o link

      const nomePais = event.target.dataset.nomePais; // Obtendo o nome do país a partir do atributo de dados
      const resumo = await buscarResumoWikipedia(nomePais); // Buscando o resumo do país na Wikipedia

      // Atualizando o texto do elemento h2 para exibir o nome do país
      const nomePaisElement = document.createElement("h2");
      nomePaisElement.textContent = nomePais;
      nomePaisElement.id = "nome-pais"
      resultadoBusca.insertBefore(nomePaisElement, ul);

      // Removendo os links dos países após o clique em um país
      ul.remove();

      // Exibindo o resumo do país na página
      exibirResumo(resumo, nomePais);
    });
  });
}

// Função para buscar o resumo do país na Wikipedia
async function buscarResumoWikipedia(nomePais) {
  try {
    // Construindo a URL da API da Wikipedia para buscar o resumo do país
    const url = `${apiUrlWikipedia}/${nomePais}`;

    // Fazendo uma solicitação GET para a API da Wikipedia
    const response = await fetch(url);

    // Verificando se a solicitação foi bem-sucedida
    if (!response.ok) {
      throw new Error("Erro ao buscar os dados da Wikipedia");
    }

    // Convertendo a resposta em formato JSON
    const data = await response.json();

    // Retornando o resumo do país
    return data.extract;
  } catch (error) {
    console.error("Erro ao buscar informações da Wikipedia:", error);
    return null;
  }
}

// Função para exibir o resumo do país na página
function exibirResumo(resumo, nomePais) {
  // Removendo qualquer resumo anterior exibido na página
  const resumoAnterior = document.querySelector("#resumo-pais");
  if (resumoAnterior) {
    resumoAnterior.remove();
  }

  // Criando um elemento de parágrafo para exibir o resumo do país
  const paragrafoResumo = document.createElement("p");
  const erroResumo = document.createElement("h3");
  paragrafoResumo.id = "resumo-pais";
  if (resumo) {
    paragrafoResumo.textContent = resumo;
  } else {
    erroResumo.textContent = "Resumo do país não encontrado.";
  }

  // Adicionando o resumo à área de resultados
  resultadoBusca.appendChild(paragrafoResumo);

  // Adicionando uma imagem do local correspondente ao país, se disponível
  adicionarImagemLocal(nomePais);
}

// Função para adicionar uma imagem do local correspondente ao país utilizando a API do Pexels
async function adicionarImagemLocal(nomePais) {
  try {
    // Removendo qualquer imagem anterior exibida na página
    const imagemAnterior = document.querySelector("#imagem-local");
    if (imagemAnterior) {
      imagemAnterior.remove();
    }

    // Fazendo uma solicitação GET para a API do Pexels para buscar uma imagem do local correspondente ao país
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${nomePais}&per_page=1`,
      {
        headers: {
          Authorization: pexelsApiKey,
        },
      }
    );

    // Verificando se a solicitação foi bem-sucedida
    if (!response.ok) {
      throw new Error("Erro ao buscar os dados do Pexels");
    }

    // Convertendo a resposta em formato JSON
    const data = await response.json();

    // Obtendo a URL da imagem do local correspondente ao país
    const imagemUrl = data?.photos?.[0]?.src?.large;

    if (imagemUrl) {
      // Criando um elemento de imagem
      const imagemLocal = document.createElement("img");
      imagemLocal.id = "imagem-local";
      imagemLocal.src = imagemUrl;

      // Adicionando a imagem do local correspondente ao país à área de resultados
      resultadoBusca.appendChild(imagemLocal);
    } else {
      // Se a imagem não for encontrada, exibir mensagem de erro
      const mensagemErro = document.createElement("h3");
      mensagemErro.textContent = "Imagem do local não encontrada.";
      resultadoBusca.appendChild(mensagemErro);
    }
  } catch (error) {
    console.error("Erro ao buscar imagem do local:", error);
  }
}

// Adicionando um event listener para o evento de submissão do formulário
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevenindo o comportamento padrão de recarregar a página ao enviar o formulário
  realizarBusca(); // Chamando a função para realizar a busca
});

// Adicionando um event listener ao campo de busca para buscar dinamicamente enquanto o usuário digita
buscarPais.addEventListener("input", () => {
  realizarBusca(); // Chamando a função para realizar a busca
});
