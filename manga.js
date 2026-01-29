// ==========================================
// CONFIGURAÇÕES E API
// ==========================================
const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

let listaLivros = []; // Global para a busca funcionar

// ==========================================
// 1. FUNDO DINÂMICO (SLIDER)
// ==========================================
const imagens = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop', 
    'view-soccer-ball-field.jpg',
    'Fire.jpg',
    '1387781.jpg',
    'free-fire-pictures-igbg9v8vem3du5h4.jpg',
    'free-fire-pictures-vv8phwlmkhz0ty43.jpg'
];

let idx = 0;
function mudarFundo() {
    const bg = document.querySelector('.game-wallpaper');
    if (bg) {
        bg.style.backgroundImage = "url('" + imagens[idx] + "')";
        idx = (idx + 1) % imagens.length;
    }
}
setInterval(mudarFundo, 7000);

// ==========================================
// 2. DADOS DE EXEMPLO (Caso o servidor falhe)
// ==========================================
const livrosExemplo = [
    { title: "Solo Leveling Vol. 01", author: "Chugong", category: "Manga", coverImage: "https://m.media-amazon.com/images/I/719vV-zG6zL.jpg", megaUrl: "https://mega.nz" },
    { title: "Naruto Gold Vol. 01", author: "Masashi Kishimoto", category: "Manga", coverImage: "https://m.media-amazon.com/images/I/912xS5IK92L.jpg", megaUrl: "https://mega.nz" },
    { title: "Berserk Deluxe", author: "Kentaro Miura", category: "Seinen", coverImage: "https://m.media-amazon.com/images/I/91DAr9S6ylL.jpg", megaUrl: "https://mega.nz" },
    { title: "One Piece Vol. 01", author: "Eiichiro Oda", category: "Manga", coverImage: "https://m.media-amazon.com/images/I/81S7mOAtpWL.jpg", megaUrl: "https://mega.nz" }
];

// ==========================================
// 3. FUNÇÕES PRINCIPAIS (CORRIGIDAS)
// ==========================================

// BUSCAR LIVROS
async function carregarLivros() {
    const container = document.getElementById('mangaContainer');
    container.innerHTML = "<p>Carregando biblioteca... ⏳</p>";

    try {
        const res = await fetch(`${API_URL}/books`);
        const dados = await res.json();

        // Se houver dados no servidor, usa eles, senão usa exemplos
        listaLivros = (dados && dados.length > 0) ? dados : livrosExemplo;
        renderizarCards(listaLivros);

    } catch (e) {
        console.log("Erro ao conectar, usando exemplos.");
        listaLivros = livrosExemplo;
        renderizarCards(listaLivros);
    }
}

// 1. FUNÇÃO PARA DESENHAR OS CARDS (Atualizada para Google Drive)
function renderizarCards(dados) {
    const container = document.getElementById('mangaContainer');
    if (!container) return;
    container.innerHTML = ""; 

    dados.forEach(livro => {
        container.innerHTML += `
            <div class="manga-card">
                <img src="${livro.coverImage}" alt="${livro.title}" onerror="this.src='https://via.placeholder.com/300x450?text=Capa+Indisponivel'">
                <div style="padding: 15px;">
                    <span style="background: #00f2ff; color: #000; padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: bold;">${livro.category || 'Manga'}</span>
                    <h3 style="margin-top:10px; color:#fff;">${livro.title}</h3>
                    <p style="color:#ccc; font-size:13px; margin-bottom:15px;">${livro.author}</p>
                    <div class="manga-actions">
                        <!-- Botão que abre o Leitor Interno -->
                        <button onclick="abrirLeitor('${livro.megaUrl}', '${livro.title}')" class="btn-manga" style="width:100%; border:none; cursor:pointer;">
                            <i class="fas fa-book-open"></i> LER AGORA
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// FILTRO DE BUSCA
function filtrarMangas() {
    const termo = document.getElementById('mangaSearch').value.toLowerCase();
    const filtrados = listaLivros.filter(l => 
        l.title.toLowerCase().includes(termo) || 
        l.author.toLowerCase().includes(termo)
    );
    renderizarCards(filtrados);
}

// 2. FUNÇÃO PARA ABRIR O LEITOR DENTRO DO SITE
function abrirLeitor(url, titulo) {
    const modal = document.getElementById('modalLeitor');
    const frame = document.getElementById('frameLivro');
    const tituloDoc = document.getElementById('tituloLivroAberto');

    if (!modal || !frame) {
        alert("Erro: Modal de leitura não encontrado no HTML!");
        return;
    }

    tituloDoc.innerText = titulo;
    
    // MÁGICA DO GOOGLE DRIVE:
    // Transforma o link normal do drive em um link que aceita ser exibido dentro do site
    let urlFinal = url;
    if (url.includes('drive.google.com')) {
        urlFinal = url.replace('/view', '/preview').replace('?usp=sharing', '');
    }

    frame.src = urlFinal;
    modal.style.display = 'block';
    
    // Bloqueia o scroll da página de fundo para não ficar mexendo
    document.body.style.overflow = 'hidden';
}

// 3. FUNÇÃO PARA FECHAR O LEITOR
function fecharLeitor() {
    const modal = document.getElementById('modalLeitor');
    const frame = document.getElementById('frameLivro');
    
    modal.style.display = 'none';
    frame.src = ""; // Limpa o link para o PDF parar de carregar/tocar
    
    // Devolve o scroll da página
    document.body.style.overflow = 'auto';
}

// INICIALIZAR
document.addEventListener('DOMContentLoaded', () => {
    mudarFundo();
    carregarLivros();
});










