// ==========================================
// CONFIGURAÇÕES E API
// ==========================================
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

console.log("API_BASE:", API_BASE);

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


// ==========================================
// 1. MUDAR CANAL
// ==========================================


// Coloque isso no seu script_live.js
function mudarCanal(urlOuId, titulo, elemento) {
    const player = document.getElementById('arenaPlayer');
    const displayTitulo = document.getElementById('current-channel-title');
    
    if (!player) return;

    // Atualiza o título em cima do vídeo
    if (displayTitulo) {
        displayTitulo.innerHTML = `<i class="fas fa-tv"></i> ${titulo}`;
    }

    // Se for um link completo (como Pluto TV), usamos direto
    if (urlOuId.startsWith('http')) {
        player.src = urlOuId;
    } 
    // Se for ID de canal do YouTube (começa com UC)
    else if (urlOuId.startsWith('UC')) {
        player.src = "https://www.youtube.com/embed/live_stream?channel=" + urlOuId + "&autoplay=1";
    }
    // Se for ID de vídeo comum do YouTube
    else {
        player.src = "https://www.youtube.com/embed/" + urlOuId + "?autoplay=1";
    }

    // Estilo visual dos botões
    document.querySelectorAll('.btn-channel, .btn-fifa').forEach(btn => btn.classList.remove('active'));
    if (elemento) {
        elemento.classList.add('active');
    }
}