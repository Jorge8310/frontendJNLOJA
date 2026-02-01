
// ==========================================
// SCRIPT DE CARREGAMENTO DO SCOREBAT
// ==========================================

console.log('🎬 Iniciando carregamento do ScoreBat...');

// ==========================================
// CONFIGURAÇÕES DO SERVIDOR
// ==========================================

// Detecta se está usando servidor local ou produção
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

console.log("🌐 Servidor API:", API_BASE);
console.log("📍 Hostname atual:", window.location.hostname);

// ⚠️ IMPORTANTE: O token NÃO fica mais no frontend!
// Agora sempre busca do servidor (privado e seguro)

// ==========================================
// FUNÇÕES DE COMUNICAÇÃO COM O SERVIDOR
// ==========================================

/**
 * Registra acesso ao ScoreBat no servidor (opcional)
 */
async function logScoreBatAccess() {
    try {
        await fetch(`${API_BASE}/football/log-access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page: 'scorebat',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            })
        });
        console.log('✅ Acesso registrado no servidor');
    } catch (error) {
        console.log('⚠️ Não foi possível registrar acesso:', error.message);
        // Não bloqueia o carregamento se o servidor não responder
    }
}

/**
 * Busca configurações do ScoreBat do servidor (opcional)
 */
async function getScoreBatConfig() {
    try {
        const response = await fetch(`${API_BASE}/football/scorebat-config`);
        if (response.ok) {
            const config = await response.json();
            console.log('✅ Configurações recebidas do servidor:', config);
            return config;
        }
    } catch (error) {
        console.log('⚠️ Usando configuração padrão');
    }
    return null;
}

/**
 * Busca dados do ScoreBat com cache de 30 minutos do servidor
 * Se o servidor não responder, carrega o iframe normal
 */
async function getCachedScoreBatData() {
    try {
        console.log('🔄 Buscando dados em cache do servidor...');
        const response = await fetch(`${API_BASE}/football/cached-data`);
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
                const minutes = Math.floor(result.expiresIn / 60);
                console.log(`✅ Dados recebidos (${result.data.length} jogos)`);
                console.log(`📦 Cache ${result.cached ? 'válido' : 'novo'} - expira em ${minutes} minutos`);
                return result.data;
            }
        }
    } catch (error) {
        console.log('⚠️ Servidor não disponível, carregando iframe direto');
    }
    return null;
}

/**
 * Carrega o iframe do ScoreBat automaticamente
 * SEMPRE busca o token do servidor (seguro)
 */
async function loadScoreBat() {
    const iframe = document.getElementById('scorebatFrame');
    const loadingContainer = document.getElementById('loading');
    
    if (!iframe) {
        console.error('❌ Iframe não encontrado!');
        return;
    }

    console.log('📺 Carregando ScoreBat...');
    
    // 🔒 BUSCA TOKEN DO SERVIDOR (nunca fica exposto no frontend)
    const serverConfig = await getScoreBatConfig();
    
    if (!serverConfig || !serverConfig.token) {
        console.error('❌ Não foi possível obter token do servidor');
        if (loadingContainer) {
            loadingContainer.innerHTML = `
                <div class="loading-text" style="color: #ff4c00;">
                    ❌ Erro ao conectar com o servidor. Verifique sua conexão.
                </div>
            `;
        }
        return;
    }
    
    const finalUrl = `https://www.scorebat.com/embed/livescore/?token=${serverConfig.token}`;
    
    console.log('🔑 Token recebido do servidor com sucesso');
   iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox');
    // Define a URL do iframe
    iframe.src = finalUrl;
    
    // Registra o acesso (não bloqueia o carregamento)
    logScoreBatAccess();
    
    // Quando o iframe carregar
    iframe.onload = function() {
        console.log('✅ ScoreBat carregado com sucesso!');
        
        // Esconde o loading e mostra o iframe
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        iframe.style.display = 'block';
    };
    
    // Se houver erro no carregamento
    iframe.onerror = function() {
        console.error('❌ Erro ao carregar ScoreBat');
        if (loadingContainer) {
            loadingContainer.innerHTML = `
                <div class="loading-text" style="color: #ff4c00;">
                    ❌ Erro ao carregar. Tente recarregar a página.
                </div>
            `;
        }
    };
}

/**
 * Carrega cards de vídeos usando os dados brutos da API
 */
async function loadCustomMatches() {
    const container = document.getElementById('custom-matches-grid');
    if (!container) return;

    const matches = await getCachedScoreBatData(); // Busca do seu servidor
    
    if (!matches) return;

    container.innerHTML = ''; // Limpa os cards anteriores

    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="feature-icon">🎥</div>
            <div class="feature-title">${match.title}</div>
            <div class="feature-description">${match.competition}</div>
            <div style="color: #ff4c00; margin-top: 15px; font-weight: bold;">
                <i class="fas fa-play-circle"></i> ASSISTIR GOLS
            </div>
        `;

        card.onclick = () => openVideoModal(match.embed);
        container.appendChild(card);
    });
}

/**
 * Abre o vídeo dentro do Modal do seu próprio site
 */
function openVideoModal(embedHtml) {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('videoPlayerContainer');
    
    if (modal && container) {
        container.innerHTML = embedHtml;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Trava o scroll do site
    }
}

/**
 * Configura o fechamento do modal
 */
function setupModalEvents() {
    const modal = document.getElementById('videoModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.getElementById('videoPlayerContainer').innerHTML = ''; // Para o som
            document.body.style.overflow = 'auto'; // Destrava scroll
        };
    }
}

/**
 * Atualiza a altura do iframe baseado no conteúdo
 */
function adjustIframeHeight() {
    const iframe = document.getElementById('scorebatFrame');
    if (!iframe) return;
    
    // Em vez de calcular pela janela, vamos definir uma altura fixa ideal 
    // para o ScoreBat mostrar vários jogos sem rolar dentro do iframe
    const isMobile = window.innerWidth < 768;
    iframe.style.height = isMobile ? "1200px" : "1500px"; 
}
/**
 * Recarrega o ScoreBat (útil para atualizar placares)
 */
function reloadScoreBat() {
    console.log('🔄 Recarregando ScoreBat...');
    const iframe = document.getElementById('scorebatFrame');
    if (iframe) {
        iframe.src = iframe.src; // Recarrega o iframe
    }
}

// ==========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ==========================================

// Carrega o ScoreBat quando a página carregar
window.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página carregada, iniciando ScoreBat...');
    
    // Aguarda 500ms para garantir que tudo está pronto
    setTimeout(function() {
        loadScoreBat();
        adjustIframeHeight();
    }, 500);
});

window.addEventListener('DOMContentLoaded', function() {
    // ... suas chamadas existentes (loadScoreBat, etc) ...
    
    loadCustomMatches(); // CARREGA OS CARDS DE VÍDEO
    setupModalEvents();  // ATIVA O BOTÃO DE FECHAR MODAL
});

// Ajusta altura quando redimensionar a janela
window.addEventListener('resize', adjustIframeHeight);

// Atualiza os placares automaticamente a cada 30 minutos
// Isso sincroniza com o cache do servidor que também é de 30 minutos
setInterval(function() {
    console.log('🔄 Atualizando placares (30 minutos)...');
    reloadScoreBat();
}, 1800000); // 1800000ms = 30 minutos

// Expõe função global para recarregar manualmente se necessário
window.reloadScoreBat = reloadScoreBat;

console.log('✅ Script ScoreBat inicializado!');
console.log('💡 Para recarregar manualmente, use: window.reloadScoreBat()');
console.log('⏰ Atualização automática configurada para 30 minutos');