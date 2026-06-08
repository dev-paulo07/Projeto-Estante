document.addEventListener('DOMContentLoaded', () => {
    
    const formLivro = document.getElementById('form-livro');
    const tituloLivro = document.getElementById('titulo-livro');
    const statusLivro = document.getElementById('status-livro');
    const generoLivro = document.getElementById('genero-livro');
    const listaLivros = document.getElementById('lista-livros');

    formLivro.addEventListener('submit', (e) => {
        e.preventDefault();

        const titulo = tituloLivro.value.trim();
        const status = statusLivro.value;
        const genero = generoLivro.value.trim();

        if (titulo === "") {
            alert("Erro! O nome do livro não pode ficar vazio.");
            return; 
        }

        let statusClasse = 'status-quero';
        if (status === 'Em andamento') {
            statusClasse = 'status-andamento';
        } else if (status === 'Lido') {
            statusClasse = 'status-lido';
        }

        const finalGenre = genero === "" ? "Sem Gênero" : genero;

        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td class="fw-semibold text-white align-middle">${titulo}</td>
            <td class="align-middle">
                <span class="badge etiqueta-status ${statusClasse}">${status}</span>
            </td>
            <td class="align-middle">
                <span class="badge etiqueta-genero">${finalGenre}</span>
            </td>
            <td class="text-end align-middle">
                <button class="btn btn-sm btn-outline-danger border-0 btn-delete" title="Excluir livro">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        listaLivros.appendChild(newRow);

        tituloLivro.value = "";
        generoLivro.value = "";
    });

    listaLivros.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
            
            const rowToDelete = e.target.closest('tr');
            
            rowToDelete.remove();
        }
    });
});