// ==========================================
// CONFIGURAÇÕES E API
// ==========================================
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

let todosVideos = [];
let filtroAtual = 'todos';
let livescoreUrl = '';

// ==========================================
// 1. FUNDO DINÂMICO (SLIDER)
// ==========================================
const imagens = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop'
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
// 2. CARREGAR CONFIGURAÇÃO DO LIVESCORE
// ==========================================
async function carregarLivescore() {
    const loading = document.getElementById('placar-loading');
    const container = document.getElementById('placar-container');
    const iframe = document.getElementById('livescore-iframe');
    
    try {
        console.log('🔄 Carregando configuração do livescore...');
        
        const response = await fetch(`${API_BASE}/scorebat/livescore-config`);
        const config = await response.json();
        
        if (config.embedUrl) {
            livescoreUrl = config.embedUrl;
            iframe.src = livescoreUrl;
            
            loading.style.display = 'none';
            container.style.display = 'block';
            
            console.log('✅ Placar ao vivo carregado');
        } else {
            throw new Error('URL do livescore não encontrada');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar livescore:', error);
        loading.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar placar ao vivo</p>
                <small>${error.message}</small>
                <br><br>
                <small style="color: #999;">Verifique se SCOREBAT_LIVESCORE_TOKEN está configurado no .env</small>
            </div>
        `;
    }
}

// ==========================================
// 3. ALTERNAR ENTRE PLACAR E VÍDEOS
// ==========================================
function mudarModo(modo) {
    // Remove active dos botões
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Remove active das seções
    document.querySelectorAll('.secao-conteudo').forEach(secao => secao.classList.remove('active'));
    
    if (modo === 'placar') {
        document.getElementById('secao-placar').classList.add('active');
    } else if (modo === 'videos') {
        document.getElementById('secao-videos').classList.add('active');
        if (todosVideos.length === 0) {
            carregarVideos();
        }
    }
}

// ==========================================
// 4. CARREGAR VÍDEOS DA API
// ==========================================
async function carregarVideos() {
    const container = document.getElementById('videos-container');
    const loading = document.getElementById('videos-loading');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    
    try {
        console.log('🔄 Carregando vídeos...');
        
        const response = await fetch(`${API_BASE}/scorebat/videos`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Erro ao carregar vídeos');
        }
        
        todosVideos = data.videos;
        console.log(`✅ ${todosVideos.length} vídeos carregados`);
        console.log(`💾 Cache: ${data.cached ? 'SIM' : 'NÃO'}`);
        
        loading.style.display = 'none';
        exibirVideos(todosVideos);
        
    } catch (error) {
        console.error('❌ Erro ao carregar vídeos:', error);
        loading.style.display = 'none';
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar vídeos</p>
                <small>${error.message}</small>
                <br><br>
                <small style="color: #999;">Verifique se SCOREBAT_VIDEO_TOKEN está configurado no .env</small>
            </div>
        `;
    }
}

// ==========================================
// 5. EXIBIR VÍDEOS NA TELA
// ==========================================
function exibirVideos(videos) {
    const container = document.getElementById('videos-container');
    
    if (videos.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-video-slash"></i>
                <p>Nenhum vídeo encontrado</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    videos.forEach((video, index) => {
        const thumbnail = video.thumbnail || 'https://via.placeholder.com/640x360?text=Video';
        const title = video.title || 'Sem título';
        const competition = video.competition || 'Liga desconhecida';
        const date = video.date ? new Date(video.date).toLocaleDateString('pt-BR') : '';
        
        html += `
            <div class="video-card" onclick="abrirVideo(${index})">
                <div class="video-thumbnail">
                    <img src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/640x360?text=Video'">
                    <i class="fas fa-play-circle video-play-icon"></i>
                </div>
                <div class="video-info">
                    <div class="video-title">${title}</div>
                    <div class="video-meta">
                        <span class="video-competition">${competition}</span>
                        ${date ? `<span class="video-date">${date}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==========================================
// 6. FILTRAR VÍDEOS POR LIGA
// ==========================================
function filtrarVideos(liga) {
    filtroAtual = liga;
    
    // Atualiza botões ativos
    document.querySelectorAll('#secao-videos .btn-fifa').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (liga === 'todos') {
        exibirVideos(todosVideos);
    } else {
        const videosFiltrados = todosVideos.filter(video => 
            video.competition && video.competition.toLowerCase().includes(liga.toLowerCase())
        );
        exibirVideos(videosFiltrados);
    }
}

// ==========================================
// 7. ABRIR MODAL DE VÍDEO
// ==========================================
function abrirVideo(index) {
    const videosFiltrados = filtroAtual === 'todos' 
        ? todosVideos 
        : todosVideos.filter(v => v.competition && v.competition.toLowerCase().includes(filtroAtual.toLowerCase()));
    
    const video = videosFiltrados[index];
    
    if (!video || !video.videos || video.videos.length === 0) {
        alert('Vídeo não disponível');
        return;
    }
    
    // Cria modal se não existir
    let modal = document.getElementById('video-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.className = 'video-modal';
        document.body.appendChild(modal);
    }
    
    // Pega o primeiro vídeo disponível
    const videoEmbed = video.videos[0].embed;
    
    modal.innerHTML = `
        <div class="video-modal-content">
            <div class="video-modal-close" onclick="fecharVideo()">
                <i class="fas fa-times"></i>
            </div>
            <div class="video-player">
                ${videoEmbed}
            </div>
            <div class="video-modal-info">
                <div class="video-modal-title">${video.title}</div>
                <div class="video-modal-meta">
                    <span class="video-competition">${video.competition}</span>
                    ${video.date ? `<span class="video-date">${new Date(video.date).toLocaleDateString('pt-BR')}</span>` : ''}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharVideo() {
    const modal = document.getElementById('video-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.innerHTML = '';
        document.body.style.overflow = 'auto';
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    const modal = document.getElementById('video-modal');
    if (modal && e.target === modal) {
        fecharVideo();
    }
});

// Fechar modal com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharVideo();
    }
});

// ==========================================
// 8. VERIFICAR STATUS DA API
// ==========================================
async function verificarStatusAPI() {
    try {
        const response = await fetch(`${API_BASE}/scorebat/config`);
        const config = await response.json();
        
        console.log('📊 Status da API ScoreBat:');
        console.log('  Video Token:', config.videoToken);
        console.log('  Embed Token:', config.embedToken);
        console.log('  Livescore Token:', config.livescoreToken);
        console.log('  Cache:', config.cacheEnabled ? 'Ativado' : 'Desativado');
        
    } catch (error) {
        console.warn('⚠️ Não foi possível verificar status da API');
    }
}

// ==========================================
// 9. INICIALIZAÇÃO
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 JN SHOP Football inicializado');
    console.log('🔗 API Base:', API_BASE);
    console.log('⚽ Carregando placar ao vivo...');
    
    // Carrega placar ao vivo
    carregarLivescore();
    
    // Verifica status da API
    verificarStatusAPI();
    
    // Vídeos serão carregados quando o usuário clicar no botão
});

// ==========================================
// 10. LOG DE INFORMAÇÕES ÚTEIS
// ==========================================
console.log('%c🎯 JN SHOP - Sistema de Placar e Vídeos', 'color: #ff4c00; font-size: 16px; font-weight: bold;');
console.log('%c⚽ Placar ao vivo carregando...', 'color: #00ff88;');
console.log('%c🎥 Vídeos disponíveis ao clicar no botão', 'color: #00f2ff;');
console.log('%c💾 Cache automático de 30 minutos', 'color: #ffcc00;');
console.log('%c🔐 Tokens carregados do .env', 'color: #ffcc00;');