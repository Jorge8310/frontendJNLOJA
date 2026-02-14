const API_URL = "https://jnloja.onrender.com/api";
let userLogado = JSON.parse(localStorage.getItem('jnloja_user')) || null;

// SEGURANÇA: SE NÃO FOR ADMIN, VOLTA PRO INDEX
if (!userLogado || userLogado.email !== "rivasmendez57@gmail.com") {
    alert("⛔ Acesso restrito!");
    window.location.href = "index.html";
}

document.getElementById('adminName').textContent = userLogado.name;

// FUNÇÃO: VOLTAR AO SITE (COMO CLIENTE LOGADO)
function voltarAoSite() {
    window.location.href = "index.html";
}

// FUNÇÃO: SAIR COMPLETAMENTE
function sairAdmin() {
    if (confirm("🚪 Deseja encerrar sua sessão?")) {
        localStorage.removeItem('jnloja_user');
        window.location.href = "index.html";
    }
}

// CONTROLE DE ABAS
// ============================================================================
// 2️⃣ ATUALIZAR FUNÇÃO mostrarAba()
// ============================================================================

function mostrarAba(nomeAba, event) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById('aba-' + nomeAba).style.display = 'block';
    if(event) event.target.classList.add('active');
    
    if (nomeAba === 'clientes') carregarClientes();
    if (nomeAba === 'codigos') carregarCodigos();
    
    // AQUI: Deve chamar o nome da função que você definiu
    if (nomeAba === 'pagamentos') carregarPagamentos(); 
    
    if (nomeAba === 'adicionar') { /* não precisa carregar nada */ }
    if (nomeAba === 'livros') carregarLivrosAdmin();
}

// --- FUNÇÕES DE CARREGAMENTO ---
async function carregarStats() {
    try {
        const [clientes, codigos] = await Promise.all([
            fetch(`${API_URL}/admin/customers?adminEmail=${userLogado.email}`).then(r => r.json()),
            fetch(`${API_URL}/admin/pins?adminEmail=${userLogado.email}`).then(r => r.json())
        ]);
        document.getElementById('totalClientes').textContent = clientes.length;
        document.getElementById('codigosUsados').textContent = codigos.filter(c => c.isUsed).length;
        document.getElementById('codigosDisponiveis').textContent = codigos.filter(c => !c.isUsed).length;
    } catch (e) { console.error(e); }
}

// CARREGAR CLIENTES COM COLUNA ID FREE FIRE
async function carregarClientes() {
    const container = document.getElementById('lista-clientes');
    try {
        const res = await fetch(`${API_URL}/admin/customers?adminEmail=${userLogado.email}`);
        const clientes = await res.json();
        
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>ID Free Fire</th>
                    <th>Ação</th>
                </tr>
            </thead><tbody>`;
        
        clientes.forEach(c => {
            html += `<tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td style="color: #00f2ff; font-weight: bold;">${c.freeFireId || '—'}</td>
                <td>
                    <button onclick="deletarCliente('${c._id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
        
        container.innerHTML = html + `</tbody></table>`;
    } catch (e) { 
        container.innerHTML = "Erro ao carregar clientes."; 
    }
}

// CARREGAR CÓDIGOS
async function carregarCodigos() {
    const container = document.getElementById('lista-codigos');
    try {
        const res = await fetch(`${API_URL}/admin/pins?adminEmail=${userLogado.email}`);
        const pins = await res.json();
        
        const disponiveis = pins.filter(p => !p.isUsed);

        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Código</th>
                    <th>Valor</th>
                    <th>Ação</th>
                </tr>
            </thead><tbody>`;
        
        disponiveis.forEach(p => {
            html += `<tr>
                <td style="color: var(--secondary); font-weight: bold;">${(p.category || 'FREEFIRE').toUpperCase()}</td>
                <td>${p.code}</td>
                <td>R$ ${p.amount}</td>
                <td>
                    <button onclick="deletarPin('${p._id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        container.innerHTML = html + `</tbody></table>`;
    } catch (e) { 
        console.error(e);
        container.innerHTML = "Erro ao carregar estoque."; 
    }
}

// ADICIONAR CÓDIGO
async function adicionarCodigo() {
    const category = document.getElementById('newCategory').value;
    const code = document.getElementById('newCode').value;
    const amount = document.getElementById('newAmount').value;

    if(!code || !amount) return alert("Por favor, preencha o código e o valor!");

    try {
        const res = await fetch(`${API_URL}/admin/add-pin`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                adminEmail: userLogado.email, 
                code, 
                amount,
                category
            })
        });

        const data = await res.json();

        if(data.success) {
            alert(`✅ Sucesso: PIN de ${category.toUpperCase()} salvo!`);
            document.getElementById('newCode').value = "";
            carregarStats();
        } else {
            alert("Erro ao salvar: " + data.error);
        }
    } catch (e) {
        alert("Erro de conexão com o servidor.");
    }
}

// DELETAR CLIENTE
async function deletarCliente(id) {
    if (!confirm("⚠️ ATENÇÃO: Deseja realmente excluir este cliente do banco de dados?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/customer/${id}?adminEmail=${userLogado.email}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Cliente excluído!");
            carregarClientes();
            carregarStats();
        }
    } catch (e) { alert("Erro ao excluir."); }
}

// DELETAR PIN
async function deletarPin(id) {
    if (!confirm("⚠️ Deseja remover este código do estoque?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/pin/${id}?adminEmail=${userLogado.email}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ PIN removido!");
            carregarCodigos();
            carregarStats();
        }
    } catch (e) { alert("Erro ao excluir."); }
}

// ============================================================================
// 3️⃣ FUNÇÃO: CARREGAR VENDAS PIX
// ============================================================================

async function carregarPagamentos() {
    const container = document.getElementById('lista-vendas-pix');
    
    try {
        const res = await fetch(`${API_URL}/admin/vendas-pix?adminEmail=${userLogado.email}`);
        const vendas = await res.json();

        if (vendas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    Nenhuma venda PIX ainda.
                </div>
            `;
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>IP</th>
                        <th>Produto</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Código</th>
                    </tr>
                </thead>
                <tbody>
        `;

        vendas.forEach(v => {
            const data = new Date(v.createdAt).toLocaleString('pt-BR');
            const statusClass = v.status === 'PAGO' ? 'status-pago' : 'status-pendente';
            const statusIcon = v.status === 'PAGO' ? '✅' : '⏳';

            html += `
                <tr>
                    <td>${data}</td>
                    <td>
                        <div style="font-weight: bold;">${v.customerName}</div>
                        <div style="font-size: 11px; color: #888;">${v.customerEmail}</div>
                    </td>
                    <td style="color: #888; font-size: 11px;">${v.customerIp || '—'}</td>
                    <td style="color: var(--secondary); font-weight: bold;">
                        ${(v.category || 'freefire').toUpperCase()}
                    </td>
                    <td style="font-weight: bold;">R$ ${v.amount.toFixed(2)}</td>
                    <td>
                        <span class="${statusClass}">
                            ${statusIcon} ${v.status}
                        </span>
                    </td>
                    <td style="color: #00f2ff; font-weight: bold;">
                        ${v.codigoEntregue || '—'}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #f44336;">
                ❌ Erro ao carregar vendas PIX
            </div>
        `;
    }
}

// --- FUNÇÕES DE LIVROS ---

async function carregarLivrosAdmin() {
    const container = document.getElementById('lista-livros');
    try {
        const res = await fetch(`${API_URL}/books`);
        const livros = await res.json();
        
        let html = `<table class="admin-table">
            <thead>
                <tr>
                    <th>Capa</th>
                    <th>Título</th>
                    <th>Autor/Categoria</th>
                    <th>Ação</th>
                </tr>
            </thead><tbody>`;
        
        livros.forEach(l => {
            html += `<tr>
                <td><img src="${l.coverImage}" style="width: 40px; border-radius: 4px;"></td>
                <td style="font-weight: bold;">${l.title}</td>
                <td>${l.author} | ${l.category}</td>
                <td>
                    <button onclick="deletarLivro('${l._id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
        container.innerHTML = html + `</tbody></table>`;
    } catch (e) { container.innerHTML = "Erro ao carregar livros."; }
}

async function adicionarLivro() {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const category = document.getElementById('bookCategory').value;
    const coverImage = document.getElementById('bookCover').value;
    const megaUrl = document.getElementById('bookMega').value;

    if(!title || !megaUrl || !coverImage) return alert("Preencha ao menos Título, Capa e Link do MEGA!");

    try {
        const res = await fetch(`${API_URL}/admin/add-book`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                adminEmail: userLogado.email, 
                title, author, category, coverImage, megaUrl 
            })
        });
        
        const data = await res.json();
        if(data.success) {
            alert("📚 Livro adicionado com sucesso!");
            document.getElementById('bookTitle').value = "";
            document.getElementById('bookAuthor').value = "";
            document.getElementById('bookCover').value = "";
            document.getElementById('bookMega').value = "";
            carregarLivrosAdmin();
        } else {
            alert("Erro: " + data.error);
        }
    } catch (e) { alert("Erro ao conectar com o servidor."); }
}

async function deletarLivro(id) {
    if (!confirm("⚠️ Deseja realmente remover este livro da biblioteca?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/book/${id}?adminEmail=${userLogado.email}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Livro removido!");
            carregarLivrosAdmin();
        }
    } catch (e) { alert("Erro ao excluir livro."); }
}

// Iniciar
carregarStats();
carregarClientes();