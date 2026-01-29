
// ==========================================
// CONFIGURAÇÕES E API
// ==========================================
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? "http://127.0.0.1:3000/api"
    : "https://jnloja.onrender.com/api";

console.log("API_BASE:", API_BASE);

let esporteAtivo = 'football'; // Padrão
let filtroAtivo = 'live';     // Padrão: Ao Vivo
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

// Troca o esporte (Futebol, Basket, Vôlei, F1)
function setSport(sport, btn) {
    esporteAtivo = sport;
    // Estilo visual dos botões
    document.querySelectorAll('.btn-sport').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Esconde histórico/copa se estiverem abertos
    const hist = document.getElementById('secao-historico');
    const copa = document.getElementById('secao-copa-mundo');
    if(hist) hist.style.display = 'none';
    if(copa) copa.style.display = 'none';
    document.getElementById('jogos-container').style.display = 'flex';

    carregarEsportes();
}

// Troca o tempo (Ao vivo, Hoje, Amanhã)
function setFilter(filter, btn) {
    filtroAtivo = filter;
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    carregarEsportes();
}

async function carregarEsportes() {
    const container = document.getElementById('jogos-container');
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> Buscando ${esporteAtivo.toUpperCase()}...</div>`;

    let query = "live=all";
    const d = new Date();
    if (filtroAtivo === 'today') {
        query = `date=${d.toLocaleDateString('sv-SE')}`;
    } else if (filtroAtivo === 'tomorrow') {
        d.setDate(d.getDate() + 1);
        query = `date=${d.toLocaleDateString('sv-SE')}`;
    }

    try {
        // Chama a rota única que você criou no server.js
        const response = await fetch(`${API_BASE}/sports/${esporteAtivo}?${query}`);
        const dados = await response.json();
        
        renderizarJogos(dados); // Chama a função que desenha os cards
    } catch (err) {
        container.innerHTML = `<div class="loading-state" style="color:red;"><p>Erro ao conectar ao servidor.</p></div>`;
    }
}

// ==========================================
// RENDERIZAR JOGOS
// ==========================================
function renderizarJogos(dados) {
    const container = document.getElementById('jogos-container');
    container.innerHTML = '';

    if (!dados || dados.length === 0) {
        container.innerHTML = `<div class="loading-state"><p>Nenhum evento de ${esporteAtivo.toUpperCase()} encontrado.</p></div>`;
        return;
    }

    const grupos = {};
    const ordemLigasFinal = [];

    // Agrupamento
    dados.forEach(item => {
        const liga = item.league ? item.league.name : (item.competition ? item.competition.name : "Competição");
        if (!grupos[liga]) {
            grupos[liga] = [];
            ordemLigasFinal.push(liga);
        }
        grupos[liga].push(item);
    });

    ordemLigasFinal.forEach(ligaNome => {
        const h = document.createElement('div');
        h.className = 'league-title';
        const logoLiga = grupos[ligaNome][0].league?.logo || grupos[ligaNome][0].competition?.logo || '';
        h.innerHTML = logoLiga ? `<img src="${logoLiga}" width="24"> ${ligaNome}` : ligaNome;
        container.appendChild(h);

        grupos[ligaNome].forEach(jogo => {
            const card = document.createElement('div');
            card.className = `match-item sport-${esporteAtivo}`;

            if (esporteAtivo === 'f1') {
                // Layout F1
                card.innerHTML = `
                    <div style="width:100%; text-align:left; padding:10px;">
                        <span class="time-badge" style="color:var(--primary)">${jogo.status}</span>
                        <h3 style="margin:5px 0; color:#fff;">${jogo.circuit.name}</h3>
                        <p style="font-size:12px; color:#aaa;">${jogo.city}, ${jogo.country.name}</p>
                        <small style="color:var(--secondary)">${new Date(jogo.date).toLocaleString('pt-BR')}</small>
                    </div>`;
            } else {
                // Layout Futebol, Basquete e Vôlei
                const status = esporteAtivo === 'football' ? jogo.fixture.status.short : jogo.status.short;
                const scoreHome = esporteAtivo === 'football' ? (jogo.goals.home ?? 0) : (jogo.scores?.home?.total ?? 0);
                const scoreAway = esporteAtivo === 'football' ? (jogo.goals.away ?? 0) : (jogo.scores?.away?.total ?? 0);

                let tempo;
                if (status === 'NS') {
                    const dataISO = esporteAtivo === 'football' ? jogo.fixture.date : jogo.date;
                    tempo = new Date(dataISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                } else if (status === 'FT' || status === 'Finished') tempo = 'FIM';
                else tempo = status;

                card.innerHTML = `
                    <div class="team t-left"><span>${jogo.teams.home.name}</span><img src="${jogo.teams.home.logo}"></div>
                    <div class="score-area">
                        <span class="time-badge">${tempo}</span>
                        <div class="score-now">${scoreHome} - ${scoreAway}</div>
                    </div>
                    <div class="team t-right"><img src="${jogo.teams.away.logo}"><span>${jogo.teams.away.name}</span></div>`;
            }
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
    // Só atualiza se estiver vendo jogos AO VIVO
    if (filtroAtivo === 'live') {
        console.log('🔄 Atualizando jogos ao vivo automaticamente...');
        carregarEsportes();
    }
}, 1200000); // 20 minutos = 1.200.000 ms

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    carregarEsportes();
});