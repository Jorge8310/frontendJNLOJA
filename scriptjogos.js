
// --- COLOQUE ISSO NO INÍCIO DO ARQUIVO ---
const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://localhost:3000/api" 
    : "https://jnloja.onrender.com/api";

let allGames = [];
let filteredGames = [];
let viewMode = 'grid';

// ==========================================
// 1. FUNDO DINÂMICO (SLIDER)
// ==========================================

// LISTA DE IMAGENS (JNLOJA ELITE)
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
        // Aplica a imagem IMEDIATAMENTE
        bg.style.backgroundImage = "url('" + imagens[idx] + "')";
        
        // Prepara o próximo índice
        idx = (idx + 1) % imagens.length;
        console.log("Fundo trocado para imagem: " + idx);
    } else {
        console.error("ERRO: Não encontrei a div .game-wallpaper no HTML!");
    }
}

// Rodar assim que o script carregar
mudarFundo();

// Iniciar o cronômetro de 7 segundos
setInterval(mudarFundo, 7000);



// Dados mockados - SUBSTITUA PELA SUA API
const mockGames = [
    {
        id: 1,
        title: 'Battlefield 6',
        platform: 'PC',
        category: 'Ação',
        rating: 4.5,
        size: '50 GB',
        image: 'https://m.media-amazon.com/images/I/8177Oms9S9L._AC_SL1500_.jpg',
        description: 'Jogo de tiro em primeira pessoa com gráficos impressionantes e batalhas épicas.',
        downloadUrl: '#'
    },
    {
        id: 2,
        title: 'The Sims 4',
        platform: 'PC',
        category: 'Simulação',
        rating: 4.2,
        size: '25 GB',
        image: 'https://m.media-amazon.com/images/I/81vjr-9S9RL._AC_SL1500_.jpg',
        description: 'Crie e controle personagens em um mundo virtual completamente personalizável.',
        downloadUrl: '#'
    },
    {
        id: 3,
        title: 'FC 26',
        platform: 'PC',
        category: 'Esportes',
        rating: 4.7,
        size: '40 GB',
        image: 'https://m.media-amazon.com/images/I/81SSt28mS1L._AC_SL1500_.jpg',
        description: 'O melhor simulador de futebol do ano com gráficos realistas e jogabilidade aprimorada.',
        downloadUrl: '#'
    },
    {
        id: 4,
        title: 'F1 24',
        platform: 'PC',
        category: 'Corrida',
        rating: 4.4,
        size: '35 GB',
        image: 'https://m.media-amazon.com/images/I/71N-S7VnS6L._AC_SL1500_.jpg',
        description: 'Simulador oficial de Fórmula 1 com todos os circuitos e pilotos da temporada.',
        downloadUrl: '#'
    },
    {
        id: 5,
        title: 'Madden 25',
        platform: 'PC',
        category: 'Esportes',
        rating: 4.1,
        size: '45 GB',
        image: 'https://m.media-amazon.com/images/I/81fS-y79S5L._AC_SL1500_.jpg',
        description: 'Futebol americano como nunca visto, com mecânicas de jogo revolucionárias.',
        downloadUrl: '#'
    },
    {
        id: 6,
        title: 'Star Wars Jedi',
        platform: 'PC',
        category: 'Aventura',
        rating: 4.8,
        size: '55 GB',
        image: 'https://m.media-amazon.com/images/I/81B1m7vS9LL._AC_SL1500_.jpg',
        description: 'Aventura épica no universo Star Wars com combates intensos de sabre de luz.',
        downloadUrl: '#'
    },
    // --- ADICIONADOS AGORA ---
    {
        id: 7,
        title: 'COD Black Ops 6',
        platform: 'PC',
        category: 'Ação',
        rating: 4.9,
        size: '150 GB',
        image: 'https://m.media-amazon.com/images/I/81+mC489S6L._AC_SL1500_.jpg',
        description: 'O FPS definitivo com campanha épica e multiplayer intenso de nova geração.',
        downloadUrl: '#'
    },
    {
        id: 8,
        title: 'GTA V Premium',
        platform: 'PC',
        category: 'Aventura',
        rating: 5.0,
        size: '110 GB',
        image: 'https://m.media-amazon.com/images/I/815SInUoYnL._AC_SL1500_.jpg',
        description: 'Explore Los Santos no simulador de crime e ação mais famoso do mundo.',
        downloadUrl: '#'
    }
];

// Elementos do DOM
const searchInput = document.getElementById('searchInput');
const platformFilter = document.getElementById('platformFilter');
const categoryFilter = document.getElementById('categoryFilter');
const gamesContainer = document.getElementById('gamesContainer');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

// Inicializar aplicação
function init() {
    loadGames();
    setupEventListeners();
}

// --- SUBSTITUA A FUNÇÃO loadGames POR ESTA ---
async function loadGames() {
    try {
        const response = await fetch(`${API_URL}/games`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        // Se o banco estiver vazio, usa os seus dados mockados
        allGames = data.length > 0 ? data : mockGames;
        filteredGames = allGames;
        displayGames();
    } catch (error) {
        console.log("Servidor offline, usando dados locais de teste...");
        // Se der erro no servidor, ele carrega os seus jogos originais
        allGames = mockGames;
        filteredGames = mockGames;
        displayGames();
    }
}

// Configurar event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', filterGames);
    platformFilter.addEventListener('change', filterGames);
    categoryFilter.addEventListener('change', filterGames);
    gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    listViewBtn.addEventListener('click', () => setViewMode('list'));
}

// Filtrar jogos
function filterGames() {
    const searchTerm = searchInput.value.toLowerCase();
    const platform = platformFilter.value;
    const category = categoryFilter.value;

    filteredGames = allGames.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm);
        const matchesPlatform = platform === 'all' || game.platform === platform;
        const matchesCategory = category === 'all' || game.category === category;

        return matchesSearch && matchesPlatform && matchesCategory;
    });

    displayGames();
}

// Exibir jogos
function displayGames() {
    loading.style.display = 'none';
    
    if (filteredGames.length === 0) {
        gamesContainer.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    gamesContainer.style.display = 'grid';
    gamesContainer.innerHTML = '';

    filteredGames.forEach(game => {
        const gameCard = createGameCard(game);
        gamesContainer.appendChild(gameCard);
    });
}

// Criar card de jogo
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';

    // Importante: MongoDB usa _id. Se for teste, usa id.
    const idUnico = game._id || game.id;

    card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" class="game-image">
        <div class="game-content">
            <div class="game-header">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-rating">
                    <svg class="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>${game.rating}</span>
                </div>
            </div>
            <p class="game-description">${game.description}</p>
            <div class="game-tags">
                <span class="game-tag tag-platform">${game.platform}</span>
                <span class="game-tag tag-category">${game.category}</span>
                <span class="game-tag tag-size">${game.size}</span>
            </div>

            <!-- O BOTÃO DE DOWNLOAD ESTÁ AQUI -->
            <button class="download-btn" onclick="downloadGame('${game._id}')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    Baixar Agora
</button>
        </div>
    `;

    return card;
}


// Alterar modo de visualização
function setViewMode(mode) {
    viewMode = mode;

    if (mode === 'grid') {
        gamesContainer.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        gamesContainer.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    }
}

// FUNÇÃO DE DOWNLOAD REAL
function downloadGame(gameId) {
    const usuario = localStorage.getItem('jnloja_user');
    
    if (!usuario) {
        alert("⚠️ ACESSO RESTRITO: Você precisa estar logado para baixar jogos!");
        // Opcional: Abre o modal de login automaticamente
        if(typeof abrirAreaCliente === 'function') abrirAreaCliente();
        return;
    }

    // 1. Procura o jogo na lista 'allGames' usando o ID do MongoDB (_id)
    const game = allGames.find(g => g._id === gameId);
    
    if (!game) {
        alert("Erro: Jogo não encontrado no sistema.");
        return;
    }

    if (!game.downloadUrl || game.downloadUrl === "") {
        alert("Aviso: O link de download para este jogo ainda não foi cadastrado.");
        return;
    }

    // 2. Notificação visual simples
    console.log(`Iniciando download de: ${game.title}`);
    
    // 3. Abre o link de download (Mega, Mediafire, Google Drive, etc) em uma nova aba
    // Isso evita que o usuário saia da sua loja enquanto baixa
    window.
    open(game.downloadUrl, '_blank');
}

// FUNÇÃO PARA EXECUTAR O DOWNLOAD REAL
function downloadGame(gameId) {
    // 1. Procura o jogo na lista (allGames) usando o ID
    const game = allGames.find(g => (g._id === gameId || g.id === gameId));
    
    if (!game) return alert("Jogo não encontrado!");

    // 2. Abre o link de download em uma nova aba (Mega, Mediafire, etc)
    if (game.downloadUrl && game.downloadUrl !== "#") {
        window.open(game.downloadUrl, '_blank');
    } else {
        alert("O link de download deste jogo ainda não foi cadastrado no banco.");
    }
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

