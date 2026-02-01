// ==========================================
// CONFIGURAÇÕES E API
// ==========================================

// Detecta se está usando servidor local ou produção
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

console.log("API_BASE:", API_BASE);

// Configuração da API ScoreBat (fallback direto)
const SCOREBAT_API = 'https://www.scorebat.com/embed/livescore/?token=MjczODUzXzE3Njk5MDg0NTdfZDhjMDk4Mzc0ZGRjOTlkN2IxYWZkZWM0YmM2ODZiZjkwMGQzZGQ0MQ==';
                                                                                                   
// Principais ligas para filtrar                                          
const LEAGUES_FILTER = [
    'UEFA Champions League',
    'Premier League', 
    'La Liga',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
    'Brasileirão',
    'Copa Libertadores',
    'Europa League',
    'Championship'
];

// Cache global dos dados
let cachedMatches = null;
let lastFetchTime = 0;
const CACHE_DURATION = 120000; // 2 minutos

// ==========================================
// FUNÇÕES DE API
// ==========================================

/**
 * Tenta buscar do servidor primeiro, depois direto da API ScoreBat
 */
async function fetchScoreBat() {
    try {
        const now = Date.now();
        
        // Usa cache se disponível e recente
        if (cachedMatches && (now - lastFetchTime) < CACHE_DURATION) {
            console.log('✅ Usando cache dos jogos');
            return cachedMatches;
        }

        console.log('🔄 Buscando jogos...');
        
        // OPÇÃO 1: Tenta buscar do SEU SERVIDOR primeiro
        try {
            const serverResponse = await fetch(`${API_BASE}/football/matches`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (serverResponse.ok) {
                const serverData = await serverResponse.json();
                console.log('✅ Jogos recebidos do servidor:', serverData);
                
                cachedMatches = serverData.matches || serverData || [];
                lastFetchTime = now;
                return cachedMatches;
            }
        } catch (serverError) {
            console.log('⚠️ Servidor não disponível, usando API direta');
        }
        
        // OPÇÃO 2: Se o servidor falhar, busca direto da ScoreBat
        const response = await fetch(SCOREBAT_API);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Jogos recebidos da ScoreBat:', data);
        
        cachedMatches = data.response || data || [];
        lastFetchTime = now;
        
        return cachedMatches;
        
    } catch (error) {
        console.error('❌ Erro ao buscar jogos:', error);
        return cachedMatches || []; // Retorna cache antigo se houver erro
    }
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function formatTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getLeagueBadge(competition) {
    const leagueColors = {
        'Champions League': '#0066cc',
        'Premier League': '#3d195b',
        'La Liga': '#ff6b00',
        'Bundesliga': '#d20515',
        'Serie A': '#024494',
        'Ligue 1': '#dae025',
        'Brasileirão': '#00a859',
        'Libertadores': '#ff4c00'
    };
    
    const color = leagueColors[competition] || '#666';
    return `<span class="league-badge" style="background: ${color}">${competition}</span>`;
}

// ==========================================
// TICKER DO HEADER (PLACAR AO VIVO)
// ==========================================

async function updateLiveTicker() {
    const ticker = document.getElementById('ticker');
    if (!ticker) return;

    try {
        const matches = await fetchScoreBat();
        
        if (!matches || matches.length === 0) {
            ticker.innerHTML = '<span class="ticker-item-style">📺 AGUARDANDO JOGOS AO VIVO...</span>';
            return;
        }

        // Filtra apenas jogos das principais ligas
        const topMatches = matches.filter(m => 
            LEAGUES_FILTER.some(league => m.competition?.includes(league))
        ).slice(0, 10);

        if (topMatches.length === 0) {
            ticker.innerHTML = '<span class="ticker-item-style">⚽ NENHUM JOGO AO VIVO NO MOMENTO</span>';
            return;
        }

        // Cria o HTML dos jogos
        let tickerHTML = '';
        topMatches.forEach(match => {
            const title = match.title || 'Jogo sem título';
            const competition = match.competition || 'Competição';
            
            tickerHTML += `
                <span class="ticker-item-style">
                    🔴 ${title} | ${competition}
                </span>
            `;
        });

        ticker.innerHTML = tickerHTML;

    } catch (error) {
        console.error('❌ Erro ao atualizar ticker:', error);
        ticker.innerHTML = '<span class="ticker-item-style">⚠️ CARREGANDO PLACARES...</span>';
    }
}

// ==========================================
// PLACAR DO FOOTER
// ==========================================

async function updateFooterScores() {
    const footerTicker = document.getElementById('footer-ticker');
    if (!footerTicker) return;

    try {
        const matches = await fetchScoreBat();
        
        if (!matches || matches.length === 0) {
            footerTicker.innerHTML = '<span>Carregando placares...</span>';
            return;
        }

        const topMatches = matches.slice(0, 5);
        let footerHTML = '';
        
        topMatches.forEach(match => {
            const title = match.title || 'Jogo';
            footerHTML += `<span>⚽ ${title}</span> `;
        });

        footerTicker.innerHTML = footerHTML;

    } catch (error) {
        console.error('❌ Erro ao atualizar footer:', error);
        footerTicker.innerHTML = '<span>Atualizando...</span>';
    }
}

// ==========================================
// PÁGINA DE TABELAS - JOGOS POR LIGA
// ==========================================

async function loadMatchesByLeague(leagueName) {
    const container = document.getElementById('matches-container');
    if (!container) return;

    container.innerHTML = '<div class="loading">⚽ Carregando jogos...</div>';

    try {
        const allMatches = await fetchScoreBat();
        
        if (!allMatches || allMatches.length === 0) {
            container.innerHTML = '<div class="no-data">❌ Nenhum jogo disponível no momento</div>';
            return;
        }

        // Filtra jogos da liga selecionada
        const leagueMatches = allMatches.filter(m => 
            m.competition && m.competition.includes(leagueName)
        );

        if (leagueMatches.length === 0) {
            container.innerHTML = `<div class="no-data">📺 Nenhum jogo de ${leagueName} disponível no momento.<br>Tente outra liga!</div>`;
            return;
        }

        let html = '<div class="matches-grid">';
        
        leagueMatches.forEach(match => {
            html += createMatchCard(match);
        });
        
        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('❌ Erro ao carregar jogos:', error);
        container.innerHTML = '<div class="error">❌ Erro ao carregar jogos. Tente novamente em alguns segundos.</div>';
    }
}

// ==========================================
// CRIAR CARD DE JOGO
// ==========================================

function createMatchCard(match) {
    const title = match.title || 'Jogo sem título';
    const competition = match.competition || 'Competição';
    const date = formatDate(match.date);
    const thumbnail = match.thumbnail || 'https://via.placeholder.com/300x200?text=Futebol';
    const hasVideo = match.videos && match.videos.length > 0;
    
    return `
        <div class="match-card">
            ${getLeagueBadge(competition)}
            <div class="match-thumbnail">
                <img src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x200?text=Futebol'">
            </div>
            <div class="match-info">
                <div class="match-title">${title}</div>
                <div class="match-date">📅 ${date}</div>
                ${hasVideo ? '<div class="has-video">🎥 Melhores Momentos Disponíveis</div>' : ''}
            </div>
        </div>
    `;
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

// Atualiza o ticker a cada 60 segundos
if (document.getElementById('ticker')) {
    console.log('🎬 Iniciando ticker...');
    updateLiveTicker();
    setInterval(updateLiveTicker, 60000);
}

// Atualiza footer a cada 2 minutos
if (document.getElementById('footer-ticker')) {
    console.log('📊 Iniciando footer...');
    updateFooterScores();
    setInterval(updateFooterScores, 120000);
}

// Configuração da página de tabelas
if (document.getElementById('matches-container')) {
    console.log('⚽ Iniciando página de jogos...');
    // Carrega Champions League por padrão
    loadMatchesByLeague('Champions League');
}

console.log('✅ Sistema de futebol inicializado!');