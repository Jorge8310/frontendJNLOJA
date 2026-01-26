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
// RENDERIZAR JOGOS
// ==========================================
function renderizarJogos(fixtures) {
    const container = document.getElementById('jogos-container');
    container.innerHTML = '';

    if (!fixtures || fixtures.length === 0) {
        container.innerHTML = `<div class="loading-state"><p>Nenhum jogo encontrado.</p></div>`;
        return;
    }

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
            if (status === 'NS') tempo = jogo.fixture.date.split('T')[1].substring(0,5);
            else if (status === 'FT') tempo = 'FIM';
            else if (status === 'HT') tempo = 'HT';
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