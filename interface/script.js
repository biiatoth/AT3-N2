const formLivro = document.getElementById('formLivro');
const livrosLista = document.getElementById('livrosLista');

function carregarLivros() {
    fetch('/livros')
        .then(response => response.json())
        .then(livros => {
            livrosLista.innerHTML = '';
            livros.forEach(livro => {
                const divLivro = document.createElement('div');
                divLivro.classList.add('livro');
                divLivro.innerHTML = `
                    <h3>${livro.titulo}</h3>
                    <p>Autor: ${livro.autor}</p>
                    <p>Gênero: ${livro.genero}</p>
                    <p>Cópias Disponíveis: ${livro.copias_disponiveis}</p>
                    <img src="${livro.imagem}" alt="${livro.titulo}">
                `;
                livrosLista.appendChild(divLivro);
            });
        })
        .catch(error => console.error('Erro ao carregar livros', error));
}

formLivro.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formLivro);
    const livro = {
        titulo: formData.get('titulo'),
        autor: formData.get('autor'),
        genero: formData.get('genero'),
        imagem: formData.get('imagem'),
        copiasDisponiveis: parseInt(formData.get('copiasDisponiveis'), 10)
    };

    fetch('/livros', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(livro)
    })
    .then(response => response.json())
    .then(novoLivro => {
        console.log('Livro adicionado:', novoLivro);
        formLivro.reset();
        carregarLivros();
    })
    .catch(error => console.error('Erro ao adicionar livro', error));
});

document.addEventListener('DOMContentLoaded', carregarLivros);
