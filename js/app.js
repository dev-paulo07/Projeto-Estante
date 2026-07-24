document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ URLs apontando para a sua API no Render
    const API_URL = 'https://projeto-estante-back-end.onrender.com/livros';
    const LOGIN_URL = 'https://projeto-estante-back-end.onrender.com/auth/login';

    const formLivro = document.getElementById('form-livro');
    const tituloLivro = document.getElementById('titulo-livro');
    const statusLivro = document.getElementById('status-livro');
    const generoLivro = document.getElementById('genero-livro');
    const listaLivros = document.getElementById('lista-livros');

    // Elementos da Caixinha de Login
    const containerLogin = document.getElementById('container-login');
    const formLoginBox = document.getElementById('form-login-box');
    const loginEmail = document.getElementById('login-email');
    const loginSenha = document.getElementById('login-senha');
    const loginErro = document.getElementById('login-erro');

    // -------------------------------------------------------------
    // 🔑 CONTROLE DA CAIXINHA DE LOGIN
    // -------------------------------------------------------------
    const exibirLogin = () => {
        if (containerLogin) containerLogin.classList.remove('d-none');
    };

    const esconderLogin = () => {
        if (containerLogin) containerLogin.classList.add('d-none');
    };

    // Processa o formulário da Caixinha de Login
    if (formLoginBox) {
        formLoginBox.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginErro.classList.add('d-none');

            try {
                const response = await fetch(LOGIN_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: loginEmail.value.trim(),
                        password: loginSenha.value.trim() // ✅ CORRIGIDO: enviando 'password' que o backend espera
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    // ✅ CORRIGIDO: lendo 'data.error' retornado pelo authController
                    throw new Error(data.error || data.mensagem || 'E-mail ou senha incorretos.');
                }

                if (data.token) {
                    localStorage.setItem('token', data.token);
                    esconderLogin();
                    carregarLivros();
                }

            } catch (error) {
                console.error('Erro de login:', error);
                loginErro.textContent = error.message;
                loginErro.classList.remove('d-none');
            }
        });
    }

    // Auxiliar para pegar o cabeçalho de Autenticação
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    // -------------------------------------------------------------
    // 1. CARREGAR LIVROS DO BANCO DE DADOS (GET)
    // -------------------------------------------------------------
    const carregarLivros = async () => {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error('Falha ao buscar livros do servidor.');
            }

            const livros = await response.json();
            listaLivros.innerHTML = '';

            if (livros.length === 0) {
                listaLivros.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-white-50 py-3">
                            <i class="fa-solid fa-book-open me-2"></i>Nenhum livro cadastrado na sua estante.
                        </td>
                    </tr>
                `;
                return;
            }

            livros.forEach(livro => renderizarLinhaLivro(livro));

        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            listaLivros.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger py-3">
                        Erro ao carregar dados do banco. Verifique se o servidor backend está rodando.
                    </td>
                </tr>
            `;
        }
    };

    // -------------------------------------------------------------
    // 2. RENDERIZAR LINHA DA TABELA
    // -------------------------------------------------------------
    const renderizarLinhaLivro = (livro) => {
        let statusClasse = 'status-quero';
        if (livro.status === 'Em andamento') {
            statusClasse = 'status-andamento';
        } else if (livro.status === 'Lido') {
            statusClasse = 'status-lido';
        }

        const finalGenre = (livro.genero && livro.genero.trim() !== "") ? livro.genero : "Sem Gênero";

        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td class="fw-semibold align-middle">${livro.titulo}</td>
            <td class="align-middle">
                <span class="badge etiqueta-status ${statusClasse}">${livro.status}</span>
            </td>
            <td class="align-middle">
                <span class="badge etiqueta-genero">${finalGenre}</span>
            </td>
            <td class="text-end align-middle">
                <button class="btn btn-sm btn-outline-danger border-0 btn-delete" data-id="${livro.id}" title="Excluir livro">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        listaLivros.appendChild(newRow);
    };

    // -------------------------------------------------------------
    // 3. ADICIONAR NOVO LIVRO (POST)
    // -------------------------------------------------------------
    formLivro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            exibirLogin();
            return;
        }

        const titulo = tituloLivro.value.trim();
        const status = statusLivro.value;
        const genero = generoLivro.value.trim();

        if (titulo === "") {
            alert("Erro! O nome do livro não pode ficar vazio.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    titulo: titulo,
                    status: status,
                    genero: genero || "Sem Gênero"
                })
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                exibirLogin();
                return;
            }

            if (!response.ok) {
                throw new Error('Erro ao salvar o livro no servidor.');
            }

            tituloLivro.value = "";
            generoLivro.value = "";

            carregarLivros();

        } catch (error) {
            console.error('Erro ao cadastrar livro:', error);
            alert("Ocorreu um erro ao tentar salvar o livro.");
        }
    });

    // -------------------------------------------------------------
    // 4. EXCLUIR LIVRO (DELETE)
    // -------------------------------------------------------------
    listaLivros.addEventListener('click', async (e) => {
        const btnDelete = e.target.closest('.btn-delete');
        
        if (btnDelete) {
            const token = localStorage.getItem('token');
            if (!token) {
                exibirLogin();
                return;
            }

            const idLivro = btnDelete.getAttribute('data-id');
            if (!idLivro) return;

            if (confirm("Tem certeza que deseja excluir este livro?")) {
                try {
                    const response = await fetch(`${API_URL}/${idLivro}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });

                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token');
                        exibirLogin();
                        return;
                    }

                    if (!response.ok) {
                        throw new Error('Erro ao deletar o livro no servidor.');
                    }

                    carregarLivros();

                } catch (error) {
                    console.error('Erro ao excluir livro:', error);
                    alert("Erro ao tentar remover o livro.");
                }
            }
        }
    });

    // Verificação inicial: se não tiver token, mostra a caixinha de login na tela
    if (!localStorage.getItem('token')) {
        exibirLogin();
    }

    // Carrega a tabela
    carregarLivros();
});
