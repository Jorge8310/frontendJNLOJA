// ==========================================
// CONFIGURAÇÕES E API
// ==========================================
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

console.log("API_BASE:", API_BASE);

const PRIORIDADE_LIGAS = [
    71, 610, 602, 606, 611, 13, 2, 39, 140, 72, 1060
];

// ==========================================
// FUNDO DINÂMICO
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
        bg.style.backgroundImage = `url('${imagens[idx]}')`;
        idx = (idx + 1) % imagens.length;
    }
}

mudarFundo();
setInterval(mudarFundo, 7000);

// ==========================================
// BUSCAR JOGOS (VERSÃO ÚNICA E OTIMIZADA)
// ==========================================
async function carregarDadosFutebol(params = "live=all") {
    const container = document.getElementById('jogos-container');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-state">
            <i class="fa fa-spinner fa-spin"></i>
            Buscando partidas em tempo real...
        </div>`;

    try {
        let url = params === "live=all" 
            ? `${API_BASE}/football` 
            : `${API_BASE}/fixtures?${params}`;
        
        console.log("⚽ Buscando:", url);
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const fixtures = await response.json();
        console.log(`✅ ${fixtures.length} jogos recebidos do MongoDB`);
        
        renderizarJogos(fixtures);

    } catch (err) {
        console.error("❌ Erro:", err);
        container.innerHTML = `
            <div class="loading-state" style="color:#ff4757;">
                <i class="fa fa-exclamation-triangle"></i>
                <p>Erro ao carregar dados.</p>
            </div>`;
    }
}

// ==========================================
// RENDERIZAR JOGOS
// ==========================================
function renderizarJogos(fixtures) {
    const container = document.getElementById('jogos-container');
    container.innerHTML = '';

    if (!fixtures || fixtures.length === 0) {
        container.innerHTML = `<div class="loading-state"><p>Nenhum jogo encontrado.</p></div>`;
        return;
    }

    // ORDENAÇÃO POR PRIORIDADE
    fixtures.sort((a, b) => {
        let pA = PRIORIDADE_LIGAS.indexOf(a.league.id);
        let pB = PRIORIDADE_LIGAS.indexOf(b.league.id);
        if (pA === -1) pA = 900;
        if (pB === -1) pB = 900;
        
        const regexJuvenil = /sub-|u20|u17|youth|juvenil/i;
        if (regexJuvenil.test(a.league.name)) pA += 100;
        if (regexJuvenil.test(b.league.name)) pB += 100;
        
        return pA - pB;
    });

    const grupos = {};
    const ordemLigasFinal = [];

    // AGRUPAMENTO POR LIGA
    fixtures.forEach(f => {
        const liga = f.league.name;
        if (!grupos[liga]) {
            grupos[liga] = [];
            ordemLigasFinal.push(liga);
        }
        grupos[liga].push(f);
    });

    ordemLigasFinal.forEach(ligaNome => {
        const h = document.createElement('div');
        h.className = 'league-title';
        h.innerHTML = `<img src="${grupos[ligaNome][0].league.logo}" width="24"> ${ligaNome}`;
        container.appendChild(h);

        grupos[ligaNome].forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'match-item';
            const status = jogo.fixture.status.short;
            
            let tempo;
            if (status === 'NS') {
                const dataISO = jogo.fixture.date;
                const dataObjeto = new Date(dataISO);
                tempo = dataObjeto.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo' 
                });
            } 
            else if (status === 'FT') tempo = 'FIM';
            else if (status === 'HT') tempo = 'INT';
            else tempo = (jogo.fixture.status.elapsed || '0') + "'";

            card.innerHTML = `
                <div class="team t-left">
                    <span>${jogo.teams.home.name}</span>
                    <img src="${jogo.teams.home.logo}">
                </div>
                <div class="score-area">
                    <span class="time-badge">${tempo}</span>
                    <div class="score-now">${jogo.goals.home ?? 0} - ${jogo.goals.away ?? 0}</div>
                </div>
                <div class="team t-right">
                    <img src="${jogo.teams.away.logo}">
                    <span>${jogo.teams.away.name}</span>
                </div>`;
            container.appendChild(card);
        });
    });
}

// ==========================================
// POPULAR SIDEBARS
// ==========================================
function popularSidebars() {
    const equipes = [
        {name: "Flamengo", id: 127, s: 2026},
        {name: "Palmeiras", id: 121, s: 2026},
        {name: "Real Madrid", id: 541, s: 2025},
        {name: "Barcelona", id: 529, s: 2025},
        {name: "Man. City", id: 50, s: 2025},
        {name: "Al Nassr (CR7)", id: 2939, s: 2025},
        {name: "Inter Miami (Messi)", id: 1597, s: 2026}
    ];
    
    const ligas = [
        {name: "Brasileirão Série A", id: 71, s: 2026},
        {name: "Libertadores", id: 13, s: 2026},
        {name: "Champions League", id: 2, s: 2025},
        {name: "Premier League", id: 39, s: 2025},
        {name: "La Liga", id: 140, s: 2025},
        {name: "Série B", id: 72, s: 2026}
    ];

    const listaEquipes = document.getElementById('lista-equipes');
    const listaLigas = document.getElementById('lista-ligas');

    if (listaEquipes) {
        listaEquipes.innerHTML = equipes.map(e => 
            `<li onclick="carregarDadosFutebol('team=${e.id}&season=${e.s}')">
                <img src="https://media.api-sports.io/football/teams/${e.id}.png" width="22"> ${e.name}
            </li>`
        ).join('');
    }

    if (listaLigas) {
        listaLigas.innerHTML = ligas.map(l => 
            `<li onclick="carregarDadosFutebol('league=${l.id}&season=${l.s}')">
                <i class="fa-regular fa-circle-dot"></i> ${l.name}
            </li>`
        ).join('');
    }
}

// ==========================================
// FILTROS
// ==========================================
function tratarFiltro(tipo, botao) {
    // Esconde seções
    document.getElementById('secao-historico').style.display = 'none';
    document.getElementById('secao-copa-mundo').style.display = 'none';
    document.getElementById('jogos-container').style.display = 'flex';
    
    document.querySelectorAll('.btn-league').forEach(b => b.classList.remove('active'));
    if (botao) botao.classList.add('active');
    
    const d = new Date();
    
    if (tipo === 'live') {
        carregarDadosFutebol("live=all");
    } 
    else if (tipo === 'hoje') {
        const hoje = d.toLocaleDateString('sv-SE');
        carregarDadosFutebol(`date=${hoje}`);
    } 
    else if (tipo === 'amanha') {
        d.setDate(d.getDate() + 1);
        const amanha = d.toLocaleDateString('sv-SE');
        carregarDadosFutebol(`date=${amanha}`);
    }
}

// ==========================================
// ABRIR HISTÓRICO
// ==========================================
function abrirHistorico() {
    document.getElementById('jogos-container').style.display = 'none';
    document.getElementById('secao-copa-mundo').style.display = 'none';
    document.getElementById('secao-historico').style.display = 'block';
    document.getElementById('resultado-campeao').innerHTML = '';
    
    document.querySelectorAll('.btn-league').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

// ==========================================
// VER TABELA COMPLETA
// ==========================================
async function verTabelaCompleta(leagueId, ligaNome, anoSelectorId) {
    const ano = document.getElementById(anoSelectorId).value;
    const container = document.getElementById('resultado-campeao');
    
    container.innerHTML = `
        <div class="loading-state">
            <i class="fa fa-spinner fa-spin"></i>
            Carregando classificação...
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/standings/${leagueId}/${ano}`);
        const data = await res.json();

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="loading-state" style="color:#ffcc00;">
                    <p>⚠️ Dados não disponíveis para ${ano}</p>
                </div>`;
            return;
        }

        // MONTAR TABELA
        let html = `
            <h2 style="color:var(--yellow); margin-bottom:20px; font-family:'Black Ops One';">
                ${ligaNome} - ${ano}
            </h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>TIME</th>
                            <th>P</th>
                            <th>J</th>
                            <th>V</th>
                            <th>E</th>
                            <th>D</th>
                            <th>GP</th>
                            <th>GC</th>
                            <th>SG</th>
                        </tr>
                    </thead>
                    <tbody>`;

        data.forEach((time, index) => {
            const posicao = index + 1;
            let corFundo = '';
            
            if (posicao === 1) corFundo = 'background: rgba(255, 215, 0, 0.1);';
            else if (posicao <= 4) corFundo = 'background: rgba(0, 255, 136, 0.1);';
            else if (posicao >= data.length - 3) corFundo = 'background: rgba(255, 71, 87, 0.1);';

            html += `
                <tr style="${corFundo}">
                    <td>${posicao}</td>
                    <td>
                        <div class="team-cell">
                            <img src="${time.team.logo}" width="24">
                            <span>${time.team.name}</span>
                        </div>
                    </td>
                    <td><strong>${time.points}</strong></td>
                    <td>${time.all.played}</td>
                    <td>${time.all.win}</td>
                    <td>${time.all.draw}</td>
                    <td>${time.all.lose}</td>
                    <td>${time.all.goals.for}</td>
                    <td>${time.all.goals.against}</td>
                    <td>${time.goalsDiff > 0 ? '+' : ''}${time.goalsDiff}</td>
                </tr>`;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

    } catch (e) {
        console.error("Erro ao buscar tabela:", e);
        container.innerHTML = `
            <div class="loading-state" style="color:#ff4757;">
                <p>❌ Erro ao buscar dados</p>
            </div>`;
    }
}

// ==========================================
// COPA DO MUNDO - FUNÇÕES
// ==========================================

// Controle de visibilidade das seções
function inicializarCopaMundo() {
    const btnMostrarCopa = document.getElementById('btn-mostrar-copa');
    const btnVoltarTabelas = document.getElementById('btn-voltar-tabelas');
    const secaoCopa = document.getElementById('secao-copa-mundo');
    const seletorCopa = document.getElementById('anoCopa');

    if (btnMostrarCopa) {
        btnMostrarCopa.addEventListener('click', function() {
            // Esconde outras seções
            document.getElementById('jogos-container').style.display = 'none';
            document.getElementById('secao-historico').style.display = 'none';
            
            // Remove active de todos os botões
            document.querySelectorAll('.btn-league').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adiciona active neste botão
            this.classList.add('active');
            
            // Mostra Copa do Mundo
            secaoCopa.style.display = 'block';
            
            // Carrega a Copa de 2022 por padrão
            carregarCopaMundo(2022);
            
            // Scroll suave para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnVoltarTabelas) {
        btnVoltarTabelas.addEventListener('click', function() {
            // Mostra jogos novamente
            document.getElementById('jogos-container').style.display = 'flex';
            
            // Esconde Copa do Mundo
            secaoCopa.style.display = 'none';
            
            // Reativa o botão AO VIVO
            const btnLive = document.getElementById('btn-live');
            if (btnLive) {
                document.querySelectorAll('.btn-league').forEach(btn => {
                    btn.classList.remove('active');
                });
                btnLive.classList.add('active');
                carregarDadosFutebol("live=all");
            }
            
            // Scroll suave para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Event listener no seletor de ano
    if (seletorCopa) {
        seletorCopa.addEventListener('change', function() {
            carregarCopaMundo(this.value);
        });
    }
}

// Carregar dados da Copa do Mundo
async function carregarCopaMundo(ano) {
    mostrarLoadingCopa(true);
    
    try {
        console.log(`🏆 Carregando Copa do Mundo ${ano}...`);
        
        // Busca classificação (fase de grupos)
        const standings = await buscarClassificacaoCopa(ano);
        
        // Busca a final para identificar o campeão
        const campeao = await buscarCampeaoCopa(ano);
        
        // Renderiza os resultados
        renderizarCampeaoCopa(campeao, ano);
        renderizarFaseGruposCopa(standings);
        
        mostrarLoadingCopa(false);
    } catch (error) {
        console.error('❌ Erro ao carregar dados da Copa:', error);
        mostrarErroCopa('Erro ao carregar os dados da Copa do Mundo. Tente novamente.');
        mostrarLoadingCopa(false);
    }
}

// Buscar classificação (fase de grupos)
async function buscarClassificacaoCopa(ano) {
    try {
        const response = await fetch(`${API_BASE}/standings/1/${ano}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar classificação');
        }
        
        const data = await response.json();
        console.log('✅ Classificação recebida:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro na busca da classificação:', error);
        throw error;
    }
}

// Buscar campeão da Copa (final)
async function buscarCampeaoCopa(ano) {
    try {
        const response = await fetch(`${API_BASE}/fixtures?league=1&season=${ano}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar jogos');
        }
        
        const fixtures = await response.json();
        console.log(`✅ Jogos da Copa ${ano} recebidos:`, fixtures.length);
        
        // Filtra apenas a final
        const finalMatch = fixtures.find(f => 
            f.league.round === "Final" || 
            f.league.round === "World Cup - Final"
        );
        
        if (!finalMatch) {
            console.log('⚠️ Final não encontrada');
            return null;
        }
        
        console.log('🏆 Final encontrada:', finalMatch);
        
        // Determina o campeão
        let campeao;
        const homeGoals = finalMatch.goals.home;
        const awayGoals = finalMatch.goals.away;
        
        if (finalMatch.score.penalty && finalMatch.score.penalty.home !== null) {
            campeao = finalMatch.score.penalty.home > finalMatch.score.penalty.away 
                ? finalMatch.teams.home 
                : finalMatch.teams.away;
        } else {
            campeao = homeGoals > awayGoals 
                ? finalMatch.teams.home 
                : finalMatch.teams.away;
        }
        
        return {
            time: campeao,
            jogo: finalMatch
        };
    } catch (error) {
        console.error('❌ Erro na busca do campeão:', error);
        return null;
    }
}

// Renderizar campeão
function renderizarCampeaoCopa(dados, ano) {
    const container = document.getElementById('resultado-campeao-copa');
    
    if (!dados) {
        container.innerHTML = `
            <div style="background: rgba(255, 204, 0, 0.1); border: 2px solid var(--yellow); padding: 30px; border-radius: 15px; text-align: center; margin: 30px auto; max-width: 600px;">
                <p style="color: var(--yellow); font-weight: 700; font-size: 16px;">
                    📊 Dados do campeão de ${ano} não disponíveis no momento.
                </p>
                <p style="margin-top: 10px; font-size: 13px; color: #fff;">
                    Confira a fase de grupos abaixo!
                </p>
            </div>
        `;
        return;
    }
    
    const { time, jogo } = dados;
    
    container.innerHTML = `
        <div class="campeao-card">
            <div class="campeao-trophy">🏆</div>
            <img src="${time.logo}" alt="${time.name}" class="campeao-logo">
            <h2 class="campeao-nome">${time.name}</h2>
            <p class="campeao-ano">CAMPEÃO DA COPA ${ano}</p>
            
            <div class="campeao-stats">
                <div>
                    <strong>${jogo.teams.home.name}</strong>
                    <p style="font-size: 1.5rem; color: var(--yellow); margin-top: 10px;">${jogo.goals.home}</p>
                </div>
                <div>
                    <strong style="font-size: 2rem; color: var(--secondary);">×</strong>
                </div>
                <div>
                    <strong>${jogo.teams.away.name}</strong>
                    <p style="font-size: 1.5rem; color: var(--yellow); margin-top: 10px;">${jogo.goals.away}</p>
                </div>
            </div>
            
            ${jogo.score.penalty && jogo.score.penalty.home !== null ? `
                <p style="margin-top: 20px; color: var(--secondary); font-weight: 900; font-size: 14px;">
                    🎯 Pênaltis: ${jogo.score.penalty.home} - ${jogo.score.penalty.away}
                </p>
            ` : ''}
            
            <p style="margin-top: 15px; color: #999; font-size: 12px;">
                📅 ${new Date(jogo.fixture.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                })}
            </p>
        </div>
    `;
}

// Renderizar fase de grupos
function renderizarFaseGruposCopa(standings) {
    const container = document.getElementById('fase-grupos');
    
    if (!standings || standings.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: var(--secondary); padding: 40px;">
                📊 Dados da fase de grupos não disponíveis.
            </p>
        `;
        return;
    }
    
    let html = '<h2 class="title-glow" style="font-size: 1.8rem; margin-bottom: 30px;">FASE DE GRUPOS</h2>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
    
    // Agrupa por grupos
    const grupos = {};
    standings.forEach(time => {
        const nomeGrupo = time.group.replace('Group ', '');
        if (!grupos[nomeGrupo]) {
            grupos[nomeGrupo] = [];
        }
        grupos[nomeGrupo].push(time);
    });
    
    Object.keys(grupos).sort().forEach(nomeGrupo => {
        html += `
            <div class="grupo-copa">
                <h4>GRUPO ${nomeGrupo}</h4>
                <table style="width: 100%; font-size: 12px; margin-top: 15px;">
                    <thead>
                        <tr style="background: rgba(255, 76, 0, 0.2);">
                            <th style="padding: 8px; text-align: center;">POS</th>
                            <th style="padding: 8px; text-align: left;">TIME</th>
                            <th style="padding: 8px; text-align: center;">PTS</th>
                            <th style="padding: 8px; text-align: center;">J</th>
                            <th style="padding: 8px; text-align: center;">V</th>
                            <th style="padding: 8px; text-align: center;">E</th>
                            <th style="padding: 8px; text-align: center;">D</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        grupos[nomeGrupo].forEach(time => {
            html += `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 10px; text-align: center; font-weight: 900; color: var(--secondary);">${time.rank}</td>
                    <td style="padding: 10px; text-align: left;">
                        <img src="${time.team.logo}" width="20" style="vertical-align: middle; margin-right: 8px;">
                        <span style="font-weight: 700; font-size: 11px;">${time.team.name}</span>
                    </td>
                    <td style="padding: 10px; text-align: center;"><strong style="color: var(--yellow);">${time.points}</strong></td>
                    <td style="padding: 10px; text-align: center;">${time.all.played}</td>
                    <td style="padding: 10px; text-align: center; color: #0f0;">${time.all.win}</td>
                    <td style="padding: 10px; text-align: center; color: #ff0;">${time.all.draw}</td>
                    <td style="padding: 10px; text-align: center; color: #f00;">${time.all.lose}</td>
                </tr>
            `;
        });
        
        html += `</tbody></table></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Funções auxiliares
function mostrarLoadingCopa(mostrar) {
    const loading = document.getElementById('loading-copa');
    if (loading) {
        loading.style.display = mostrar ? 'block' : 'none';
    }
}

function mostrarErroCopa(mensagem) {
    const container = document.getElementById('resultado-campeao-copa');
    if (container) {
        container.innerHTML = `
            <div style="background: rgba(255, 0, 0, 0.1); border: 2px solid #ff0000; padding: 30px; border-radius: 15px; text-align: center; margin: 30px auto; max-width: 600px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff0000; margin-bottom: 20px;"></i>
                <p style="color: #ff0000; font-weight: 700; font-size: 16px;">${mensagem}</p>
                <p style="margin-top: 15px; font-size: 13px; color: #fff;">
                    Verifique se o servidor backend está rodando.
                </p>
            </div>
        `;
    }
}

// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA A CADA 20 MINUTOS
// ==========================================
setInterval(() => {
    const btnLive = document.getElementById('btn-live');
    if (btnLive && btnLive.classList.contains('active')) {
        console.log('🔄 Atualizando jogos ao vivo... (via MongoDB)');
        carregarDadosFutebol("live=all");
    }
}, 1200000); // 20 minutos = 1200000 ms

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Popular sidebars
    popularSidebars();
    
    // Carrega jogos ao vivo inicialmente
    carregarDadosFutebol("live=all");
    
    // Inicializa Copa do Mundo
    inicializarCopaMundo();
    
    // Event listener do botão Live
    const btnLive = document.getElementById('btn-live');
    if (btnLive) {
        btnLive.addEventListener('click', function() {
            document.querySelectorAll('.btn-league').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            carregarDadosFutebol("live=all");
        });
    }
});

/*
// ==========================================
// CONFIGURAÇÕES E API
// ==========================================
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

console.log("API_BASE:", API_BASE);

const PRIORIDADE_LIGAS = [
    71, 610, 602, 606, 611, 13, 2, 39, 140, 72, 1060
];

// ==========================================
// FUNDO DINÂMICO
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
        bg.style.backgroundImage = `url('${imagens[idx]}')`;
        idx = (idx + 1) % imagens.length;
    }
}

mudarFundo();
setInterval(mudarFundo, 7000);

// ==========================================
// BUSCAR JOGOS
// ==========================================
async function carregarDadosFutebol(params = "live=all") {
    const container = document.getElementById('jogos-container');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-state">
            <i class="fa fa-spinner fa-spin"></i>
            Buscando partidas em tempo real...
        </div>`;

    try {
        let url = params === "live=all" 
            ? `${API_BASE}/football` 
            : `${API_BASE}/fixtures?${params}`;
        
        console.log("Buscando:", url);
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const fixtures = await response.json();
        renderizarJogos(fixtures);

    } catch (err) {
        console.error("Erro:", err);
        container.innerHTML = `
            <div class="loading-state" style="color:#ff4757;">
                <i class="fa fa-exclamation-triangle"></i>
                <p>Erro ao carregar dados.</p>
            </div>`;
    }
}

// ==========================================
// RENDERIZAR JOGOS (VERSÃO ATUALIZADA)
// ==========================================
function renderizarJogos(fixtures) {
    const container = document.getElementById('jogos-container');
    container.innerHTML = '';

    if (!fixtures || fixtures.length === 0) {
        container.innerHTML = `<div class="loading-state"><p>Nenhum jogo encontrado.</p></div>`;
        return;
    }

    // MANTÉM SUA LÓGICA DE ORDENAÇÃO ORIGINAL
    fixtures.sort((a, b) => {
        let pA = PRIORIDADE_LIGAS.indexOf(a.league.id);
        let pB = PRIORIDADE_LIGAS.indexOf(b.league.id);
        if (pA === -1) pA = 900;
        if (pB === -1) pB = 900;
        
        const regexJuvenil = /sub-|u20|u17|youth|juvenil/i;
        if (regexJuvenil.test(a.league.name)) pA += 100;
        if (regexJuvenil.test(b.league.name)) pB += 100;
        
        return pA - pB;
    });

    const grupos = {};
    const ordemLigasFinal = [];

    // MANTÉM SEU AGRUPAMENTO POR LIGA
    fixtures.forEach(f => {
        const liga = f.league.name;
        if (!grupos[liga]) {
            grupos[liga] = [];
            ordemLigasFinal.push(liga);
        }
        grupos[liga].push(f);
    });

    ordemLigasFinal.forEach(ligaNome => {
        const h = document.createElement('div');
        h.className = 'league-title';
        h.innerHTML = `<img src="${grupos[ligaNome][0].league.logo}" width="24"> ${ligaNome}`;
        container.appendChild(h);

        grupos[ligaNome].forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'match-item';
            const status = jogo.fixture.status.short;
            
            let tempo;
            if (status === 'NS') {
                // CORREÇÃO DE HORÁRIO: Converte UTC para Horário de Brasília
                const dataISO = jogo.fixture.date;
                const dataObjeto = new Date(dataISO);
                tempo = dataObjeto.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo' 
                });
            } 
            else if (status === 'FT') tempo = 'FIM';
            else if (status === 'HT') tempo = 'INT';
            else tempo = (jogo.fixture.status.elapsed || '0') + "'";

            // ✅ CORRIGIDO: Ordem correta dos elementos
            card.innerHTML = `
                <div class="team t-left">
                    <span>${jogo.teams.home.name}</span>
                    <img src="${jogo.teams.home.logo}">
                </div>
                <div class="score-area">
                    <span class="time-badge">${tempo}</span>
                    <div class="score-now">${jogo.goals.home ?? 0} - ${jogo.goals.away ?? 0}</div>
                </div>
                <div class="team t-right">
                    <img src="${jogo.teams.away.logo}">
                    <span>${jogo.teams.away.name}</span>
                </div>`;
            container.appendChild(card);
        });
    });
}
// ==========================================
// POPULAR SIDEBARS
// ==========================================
function popularSidebars() {
    const equipes = [
        {name: "Flamengo", id: 127, s: 2026},
        {name: "Palmeiras", id: 121, s: 2026},
        {name: "Real Madrid", id: 541, s: 2025},
        {name: "Barcelona", id: 529, s: 2025},
        {name: "Man. City", id: 50, s: 2025},
        {name: "Al Nassr (CR7)", id: 2939, s: 2025},
        {name: "Inter Miami (Messi)", id: 1597, s: 2026}
    ];
    
    const ligas = [
        {name: "Brasileirão Série A", id: 71, s: 2026},
        {name: "Libertadores", id: 13, s: 2026},
        {name: "Champions League", id: 2, s: 2025},
        {name: "Premier League", id: 39, s: 2025},
        {name: "La Liga", id: 140, s: 2025},
        {name: "Série B", id: 72, s: 2026}
    ];

    const listaEquipes = document.getElementById('lista-equipes');
    const listaLigas = document.getElementById('lista-ligas');

    if (listaEquipes) {
        listaEquipes.innerHTML = equipes.map(e => 
            `<li onclick="carregarDadosFutebol('team=${e.id}&season=${e.s}')">
                <img src="https://media.api-sports.io/football/teams/${e.id}.png" width="22"> ${e.name}
            </li>`
        ).join('');
    }

    if (listaLigas) {
        listaLigas.innerHTML = ligas.map(l => 
            `<li onclick="carregarDadosFutebol('league=${l.id}&season=${l.s}')">
                <i class="fa-regular fa-circle-dot"></i> ${l.name}
            </li>`
        ).join('');
    }
}

// ==========================================
// FILTROS
// ==========================================
function tratarFiltro(tipo, botao) {
    document.getElementById('secao-historico').style.display = 'none';
    document.getElementById('jogos-container').style.display = 'flex';
    
    document.querySelectorAll('.btn-league').forEach(b => b.classList.remove('active'));
    if (botao) botao.classList.add('active');
    
    const d = new Date();
    
    if (tipo === 'live') {
        carregarDadosFutebol("live=all");
    } 
    else if (tipo === 'hoje') {
        const hoje = d.toLocaleDateString('sv-SE');
        carregarDadosFutebol(`date=${hoje}`);
    } 
    else if (tipo === 'amanha') {
        d.setDate(d.getDate() + 1);
        const amanha = d.toLocaleDateString('sv-SE');
        carregarDadosFutebol(`date=${amanha}`);
    }
}

// ==========================================
// ABRIR HISTÓRICO
// ==========================================
function abrirHistorico() {
    document.getElementById('jogos-container').style.display = 'none';
    document.getElementById('secao-historico').style.display = 'block';
    document.getElementById('resultado-campeao').innerHTML = '';
    
    document.querySelectorAll('.btn-league').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

// ==========================================
// VER TABELA COMPLETA
// ==========================================
// BUSCAR E EXIBIR TABELA COMPLETA
async function verTabelaCompleta(leagueId, ligaNome, anoSelectorId) {
    const ano = document.getElementById(anoSelectorId).value;
    const container = document.getElementById('resultado-campeao');
    
    container.innerHTML = `
        <div class="loading-state">
            <i class="fa fa-spinner fa-spin"></i>
            Carregando classificação...
        </div>`;

    try {
        const res = await fetch(`${API_BASE}/standings/${leagueId}/${ano}`);
        const data = await res.json();

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="loading-state" style="color:#ffcc00;">
                    <p>⚠️ Dados não disponíveis para ${ano}</p>
                </div>`;
            return;
        }

        // MONTAR TABELA
        let html = `
            <h2 style="color:var(--yellow); margin-bottom:20px; font-family:'Black Ops One';">
                ${ligaNome} - ${ano}
            </h2>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>TIME</th>
                            <th>P</th>
                            <th>J</th>
                            <th>V</th>
                            <th>E</th>
                            <th>D</th>
                            <th>GP</th>
                            <th>GC</th>
                            <th>SG</th>
                        </tr>
                    </thead>
                    <tbody>`;

        data.forEach((time, index) => {
            const posicao = index + 1;
            let corFundo = '';
            
            // Cores especiais
            if (posicao === 1) corFundo = 'background: rgba(255, 215, 0, 0.1);'; // Campeão
            else if (posicao <= 4) corFundo = 'background: rgba(0, 255, 136, 0.1);'; // Libertadores
            else if (posicao >= data.length - 3) corFundo = 'background: rgba(255, 71, 87, 0.1);'; // Rebaixamento

            html += `
                <tr style="${corFundo}">
                    <td>${posicao}</td>
                    <td>
                        <div class="team-cell">
                            <img src="${time.team.logo}" width="24">
                            <span>${time.team.name}</span>
                        </div>
                    </td>
                    <td><strong>${time.points}</strong></td>
                    <td>${time.all.played}</td>
                    <td>${time.all.win}</td>
                    <td>${time.all.draw}</td>
                    <td>${time.all.lose}</td>
                    <td>${time.all.goals.for}</td>
                    <td>${time.all.goals.against}</td>
                    <td>${time.goalsDiff > 0 ? '+' : ''}${time.goalsDiff}</td>
                </tr>`;
        });

        html += `
                    </tbody>
                </table>
            </div>`;

        container.innerHTML = html;

    } catch (e) {
        console.error("Erro ao buscar tabela:", e);
        container.innerHTML = `
            <div class="loading-state" style="color:#ff4757;">
                <p>❌ Erro ao buscar dados</p>
            </div>`;
    }
}

// ==========================================
// SISTEMA DE ATUALIZAÇÃO COM DADOS DO MONGODB
// Adicione este código no seu scriptfootball.js
// ==========================================

// URL do backend (ajuste conforme necessário)
const BACKEND_URL = 'http://localhost:3000'; // ⚠️ Troque em produção

// ==========================================
// FUNÇÃO PARA CARREGAR DADOS DO BACKEND
// O backend busca do MongoDB primeiro, depois da API se necessário
// ==========================================
async function carregarDadosFutebol(params) {
    try {
        console.log(`⚽ Buscando dados: ${params}`);
        
        // Busca no seu backend - ele vai verificar o MongoDB primeiro
        const response = await fetch(`${BACKEND_URL}/api/fixtures?${params}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar dados');
        }
        
        const fixtures = await response.json();
        console.log(`✅ ${fixtures.length} jogos recebidos do MongoDB`);
        
        // Renderiza os jogos na tela
        renderizarJogos(fixtures);
        
        return fixtures;
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        return [];
    }
}

// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA A CADA 20 MINUTOS
// ==========================================
setInterval(() => {
    const btnLive = document.getElementById('btn-live');
    if (btnLive && btnLive.classList.contains('active')) {
        console.log('🔄 Atualizando jogos ao vivo...');
        carregarDadosFutebol("live=all");
    }
}, 1200000); // 20 minutos = 1200000 ms

// ==========================================
// CARREGAMENTO INICIAL
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Carrega jogos ao vivo inicialmente
    carregarDadosFutebol("live=all");
    
    // Event listeners dos botões
    const btnLive = document.getElementById('btn-live');
    if (btnLive) {
        btnLive.addEventListener('click', function() {
            // Remove active de todos
            document.querySelectorAll('.btn-league').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adiciona active neste
            this.classList.add('active');
            
            // Carrega jogos ao vivo
            carregarDadosFutebol("live=all");
        });
    }
});


// ==========================================
// INICIALIZAÇÃO
// ==========================================
popularSidebars();
window.onload = () => carregarDadosFutebol("live=all");

setInterval(() => {
    const btnLive = document.getElementById('btn-live');
    if (btnLive && btnLive.classList.contains('active')) {
        carregarDadosFutebol("live=all");
    }
}, 1200000);

*/

/*
// ==========================================
// ADICIONE ESTE CÓDIGO NO FINAL DO SEU SCRIPTFOOTBALL.JS
// ==========================================

// ==========================================
// COPA DO MUNDO - API FOOTBALL
// ==========================================

const API_KEY_COPA = 'SUA_CHAVE_API_AQUI'; // ⚠️ SUBSTITUA PELA SUA CHAVE DA API-FOOTBALL
const API_HOST_COPA = 'v3.football.api-sports.io';

// Controle de visibilidade das seções
document.addEventListener('DOMContentLoaded', function() {
    const btnMostrarCopa = document.getElementById('btn-mostrar-copa');
    const btnVoltarTabelas = document.getElementById('btn-voltar-tabelas');
    const secaoCopa = document.getElementById('secao-copa-mundo');
    const seletorCopa = document.getElementById('anoCopa');

    // Esconde as seções principais quando existirem
    const secaoClassificacao = document.querySelector('.table-container');
    const botoesLigas = document.querySelector('.standings-menu');

    if (btnMostrarCopa) {
        btnMostrarCopa.addEventListener('click', function() {
            // Esconde classificações
            if (secaoClassificacao) secaoClassificacao.style.display = 'none';
            if (botoesLigas) {
                Array.from(botoesLigas.children).forEach(btn => {
                    if (btn.id !== 'btn-mostrar-copa') btn.style.display = 'none';
                });
            }
            
            // Mostra Copa do Mundo
            secaoCopa.style.display = 'block';
            
            // Carrega a Copa de 2022 por padrão
            carregarCopa(2022);
            
            // Scroll suave para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnVoltarTabelas) {
        btnVoltarTabelas.addEventListener('click', function() {
            // Mostra classificações novamente
            if (secaoClassificacao) secaoClassificacao.style.display = 'block';
            if (botoesLigas) {
                Array.from(botoesLigas.children).forEach(btn => {
                    btn.style.display = 'inline-block';
                });
            }
            
            // Esconde Copa do Mundo
            secaoCopa.style.display = 'none';
            
            // Scroll suave para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Event listener no seletor de ano
    if (seletorCopa) {
        seletorCopa.addEventListener('change', function() {
            carregarCopa(this.value);
        });
    }
});

// ==========================================
// CARREGAR DADOS DA COPA
// ==========================================
async function carregarCopa(ano) {
    mostrarLoadingCopa(true);
    
    try {
        // Busca informações da liga/torneio
        const standings = await buscarClassificacaoCopa(ano);
        const campeao = await buscarCampeaoCopa(ano);
        
        // Renderiza os resultados
        renderizarCampeao(campeao, ano);
        renderizarFaseGrupos(standings);
        
        mostrarLoadingCopa(false);
    } catch (error) {
        console.error('Erro ao carregar dados da Copa:', error);
        mostrarErroCopa('Erro ao carregar os dados. Verifique sua chave API.');
        mostrarLoadingCopa(false);
    }
}

// ==========================================
// BUSCAR CLASSIFICAÇÃO (FASE DE GRUPOS)
// ==========================================
async function buscarClassificacaoCopa(ano) {
    const url = `https://${API_HOST_COPA}/standings?league=1&season=${ano}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': API_HOST_COPA,
            'x-rapidapi-key': API_KEY_COPA
        }
    });
    
    const data = await response.json();
    return data.response;
}

// ==========================================
// BUSCAR CAMPEÃO DA COPA
// ==========================================
async function buscarCampeaoCopa(ano) {
    // Busca a final da Copa
    const url = `https://${API_HOST_COPA}/fixtures?league=1&season=${ano}&round=Final`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': API_HOST_COPA,
            'x-rapidapi-key': API_KEY_COPA
        }
    });
    
    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
        const finalMatch = data.response[0];
        const homeGoals = finalMatch.goals.home;
        const awayGoals = finalMatch.goals.away;
        
        // Determina o campeão (pode ter sido nos pênaltis)
        let campeao;
        if (finalMatch.score.penalty && finalMatch.score.penalty.home !== null) {
            campeao = finalMatch.score.penalty.home > finalMatch.score.penalty.away 
                ? finalMatch.teams.home 
                : finalMatch.teams.away;
        } else {
            campeao = homeGoals > awayGoals 
                ? finalMatch.teams.home 
                : finalMatch.teams.away;
        }
        
        return {
            time: campeao,
            jogo: finalMatch
        };
    }
    
    return null;
}

// ==========================================
// RENDERIZAR CAMPEÃO
// ==========================================
function renderizarCampeao(dados, ano) {
    const container = document.getElementById('resultado-campeao');
    
    if (!dados) {
        container.innerHTML = '<p>Dados do campeão não disponíveis.</p>';
        return;
    }
    
    const { time, jogo } = dados;
    
    container.innerHTML = `
        <div class="campeao-card">
            <div class="campeao-trophy">🏆</div>
            <img src="${time.logo}" alt="${time.name}" class="campeao-logo">
            <h2 class="campeao-nome">${time.name}</h2>
            <p class="campeao-ano">CAMPEÃO DA COPA ${ano}</p>
            
            <div class="campeao-stats">
                <div>
                    <strong>${jogo.teams.home.name}</strong>
                    <p style="font-size: 1.5rem; color: var(--yellow);">${jogo.goals.home}</p>
                </div>
                <div>
                    <strong style="font-size: 2rem; color: var(--secondary);">×</strong>
                </div>
                <div>
                    <strong>${jogo.teams.away.name}</strong>
                    <p style="font-size: 1.5rem; color: var(--yellow);">${jogo.goals.away}</p>
                </div>
            </div>
            
            ${jogo.score.penalty && jogo.score.penalty.home !== null ? `
                <p style="margin-top: 20px; color: var(--secondary); font-weight: 900; font-size: 14px;">
                    🎯 Pênaltis: ${jogo.score.penalty.home} - ${jogo.score.penalty.away}
                </p>
            ` : ''}
        </div>
    `;
}

// ==========================================
// RENDERIZAR FASE DE GRUPOS
// ==========================================
function renderizarFaseGrupos(standings) {
    const container = document.getElementById('fase-grupos');
    
    if (!standings || standings.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--secondary);">Dados da fase de grupos não disponíveis.</p>';
        return;
    }
    
    let html = '<h2 class="title-glow" style="font-size: 1.8rem; margin-bottom: 30px;">FASE DE GRUPOS</h2>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
    
    standings[0].league.standings.forEach(grupo => {
        html += `
            <div class="grupo-copa">
                <h4>GRUPO ${grupo[0].group.replace('Group ', '')}</h4>
                <table style="width: 100%; font-size: 12px; margin-top: 15px;">
                    <thead>
                        <tr style="background: rgba(255, 76, 0, 0.2);">
                            <th style="padding: 8px; text-align: center;">POS</th>
                            <th style="padding: 8px; text-align: left;">TIME</th>
                            <th style="padding: 8px; text-align: center;">PTS</th>
                            <th style="padding: 8px; text-align: center;">J</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        grupo.forEach(time => {
            html += `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 10px; text-align: center; font-weight: 900; color: var(--secondary);">${time.rank}</td>
                    <td style="padding: 10px; text-align: left;">
                        <img src="${time.team.logo}" width="20" style="vertical-align: middle; margin-right: 8px;">
                        <span style="font-weight: 700; font-size: 11px;">${time.team.name}</span>
                    </td>
                    <td style="padding: 10px; text-align: center;"><strong style="color: var(--yellow);">${time.points}</strong></td>
                    <td style="padding: 10px; text-align: center;">${time.all.played}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
function mostrarLoadingCopa(mostrar) {
    const loading = document.getElementById('loading-copa');
    if (loading) {
        loading.style.display = mostrar ? 'block' : 'none';
    }
}

function mostrarErroCopa(mensagem) {
    const container = document.getElementById('resultado-campeao');
    if (container) {
        container.innerHTML = `
            <div style="background: rgba(255, 0, 0, 0.1); border: 2px solid #ff0000; padding: 30px; border-radius: 15px; text-align: center; margin: 30px auto; max-width: 600px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff0000; margin-bottom: 20px;"></i>
                <p style="color: #ff0000; font-weight: 700; font-size: 16px;">${mensagem}</p>
                <p style="margin-top: 15px; font-size: 13px; color: #fff;">
                    Certifique-se de ter inserido sua chave API válida no arquivo scriptfootball.js
                </p>
                <p style="margin-top: 10px; font-size: 12px; color: var(--secondary);">
                    Obtenha sua chave em: <a href="https://www.api-football.com/" target="_blank" style="color: var(--primary);">api-football.com</a>
                </p>
            </div>
        `;
    }
}
*/