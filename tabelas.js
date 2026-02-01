// ==========================================
// CONFIGURAÇÕES E API
// ==========================================
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

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
mudarFundo();
setInterval(mudarFundo, 7000);

// ==========================================
// 2. FUNÇÃO PARA TROCAR AS TABELAS
// ==========================================
function mudarTabela(ids, nomeLiga) {
    const iframe = document.getElementById('sofa-standings-embed');
    const titulo = document.getElementById('current-league-title');
    
    if (!iframe) return;

    // 1. Muda o texto do título para o usuário saber o que está vendo
    if (titulo) {
        titulo.innerText = nomeLiga;
    }

    // 2. Divide os IDs (ex: "36/77559" vira ["36", "77559"])
    const partes = ids.split('/');
    const tId = partes[0]; // ID do Torneio
    const sId = partes[1]; // ID da Temporada

    // 3. Monta a URL perfeita que o SofaScore aceita
    const novaUrl = `https://widgets.sofascore.com/pt-BR/embed/tournament/${tId}/season/${sId}/standings/`;
    
    // 4. Troca o src do iframe
    iframe.src = novaUrl;
    
    console.log("Sistema JN SHOP: Carregando " + nomeLiga);
}
// INICIALIZAÇÃO: Carregar o Brasileirão assim que a página abrir
window.addEventListener('DOMContentLoaded', () => {
    // Carrega o Brasileirão Série A por padrão
    mudarTabela('83/87678', 'Brasileirão Série A');
});