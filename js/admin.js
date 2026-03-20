// ── admin.js ──────────────────────────────────────────────────
Utils.requireAdmin();

// ── Navegação ────────────────────────────────────────────────
const sections = ['dashboard','consultas','alunos','aprovacoes'];
function showSection(id) {
  sections.forEach(s => {
    document.getElementById('sec-' + s).classList.toggle('hidden', s !== id);
  });
  document.querySelectorAll('.nav-item').forEach((el, i) => {
    el.classList.toggle('active', sections[i] === id);
  });
  document.getElementById('topbarTitle').textContent =
    { dashboard:'Dashboard', consultas:'Consultas', alunos:'Alunos', aprovacoes:'Aprovações' }[id];
  if (id === 'dashboard')  renderDashboard();
  if (id === 'consultas')  renderConsultas('todos');
  if (id === 'alunos')     renderAlunos('');
  if (id === 'aprovacoes') renderAprovacoes();
}

function logout() { DB.clearSessao(); Utils.go('index.html'); }

// ── DASHBOARD ────────────────────────────────────────────────
function renderDashboard() {
  const consultas = DB.getConsultas();
  const alunos    = DB.getAlunos();
  const cnt = s => consultas.filter(c => c.statusConsulta === s).length;
  const pendentes = alunos.filter(a => a.statusCadastro === 'pendente').length;

  // badge sidebar
  const badge = document.getElementById('badgePendentes');
  if (pendentes > 0) { badge.textContent = pendentes; badge.style.display = 'inline-flex'; }
  else { badge.style.display = 'none'; }

  document.getElementById('statsAdmin').innerHTML = `
    <div class="stat-card">
      <span class="stat-icon">🎓</span>
      <div class="stat-value">${alunos.filter(a=>a.statusCadastro==='aprovado').length}</div>
      <div class="stat-label">Alunos cadastrados</div>
    </div>
    <div class="stat-card warn">
      <span class="stat-icon">⏰</span>
      <div class="stat-value">${pendentes}</div>
      <div class="stat-label">Aprovações pendentes</div>
    </div>
    <div class="stat-card warn">
      <span class="stat-icon">📋</span>
      <div class="stat-value">${cnt('aguardando')}</div>
      <div class="stat-label">Aguardando análise</div>
    </div>
    <div class="stat-card blue">
      <span class="stat-icon">📌</span>
      <div class="stat-value">${cnt('confirmada')}</div>
      <div class="stat-label">Confirmadas</div>
    </div>
    <div class="stat-card green">
      <span class="stat-icon">✅</span>
      <div class="stat-value">${cnt('realizada')}</div>
      <div class="stat-label">Realizadas</div>
    </div>
    <div class="stat-card red">
      <span class="stat-icon">❌</span>
      <div class="stat-value">${cnt('cancelada')}</div>
      <div class="stat-label">Canceladas</div>
    </div>
    <div class="stat-card red">
      <span class="stat-icon">🚫</span>
      <div class="stat-value">${cnt('nao_compareceu')}</div>
      <div class="stat-label">Faltas</div>
    </div>
  `;

  // Próximas confirmadas
  const proximas = consultas
    .filter(c => c.statusConsulta === 'confirmada')
    .sort((a,b) => a.dataPreferencial.localeCompare(b.dataPreferencial))
    .slice(0, 8);

  const tbody = document.getElementById('tabelaDashboard');
  if (!proximas.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>Nenhuma consulta confirmada.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = proximas.map(c => {
    const al = DB.getAlunoById(c.idAluno);
    return `<tr>
      <td>${al ? al.nome : '—'}</td>
      <td>${c.motivo}</td>
      <td>${Utils.fmtDatePref(c.dataPreferencial)}</td>
      <td style="text-transform:capitalize">${c.turno} · ${c.horarioPreferencial}</td>
      <td>${Utils.badgeStatus(c.statusConsulta)}</td>
    </tr>`;
  }).join('');
}

// ── CONSULTAS ────────────────────────────────────────────────
let filtroConsultas = 'todos';
function renderConsultas(filtro) {
  filtroConsultas = filtro;
  let lista = DB.getConsultas();
  if (filtro !== 'todos') lista = lista.filter(c => c.statusConsulta === filtro);
  lista.sort((a,b) => b.dataCriacao.localeCompare(a.dataCriacao));

  const tbody = document.getElementById('tabelaConsultas');
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>Nenhum registro.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(c => {
    const al = DB.getAlunoById(c.idAluno);
    const nome = al ? al.nome : '—';
    const s = c.statusConsulta;
    let acoes = '';
    if (s === 'aguardando') {
      acoes = `
        <button class="btn btn-accent btn-sm" onclick="mudarStatus('${c.id}','confirmada')">Confirmar</button>
        <button class="btn btn-danger btn-sm" onclick="mudarStatus('${c.id}','cancelada')">Cancelar</button>
      `;
    } else if (s === 'confirmada') {
      acoes = `
        <button class="btn btn-accent btn-sm" onclick="mudarStatus('${c.id}','realizada')">Realizada</button>
        <button class="btn btn-outline btn-sm" onclick="mudarStatus('${c.id}','nao_compareceu')">Falta</button>
        <button class="btn btn-danger btn-sm" onclick="mudarStatus('${c.id}','cancelada')">Cancelar</button>
      `;
    }
    acoes += `<button class="btn btn-ghost btn-sm" onclick="openObs('${c.id}','${(c.observacaoPsicologa||'').replace(/'/g,"\\'")}')">📝 Obs.</button>`;
    return `<tr>
      <td><strong>${nome}</strong></td>
      <td>${c.motivo}</td>
      <td>${Utils.fmtDatePref(c.dataPreferencial)}</td>
      <td style="text-transform:capitalize">${c.turno}</td>
      <td>${Utils.badgeStatus(c.statusConsulta)}</td>
      <td><div class="td-actions">${acoes}</div></td>
    </tr>`;
  }).join('');
}

function mudarStatus(id, status) {
  DB.updateConsulta(id, { statusConsulta: status });
  renderConsultas(filtroConsultas);
}

document.getElementById('filterConsultas').addEventListener('click', function(e) {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('#filterConsultas .filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderConsultas(chip.dataset.status);
});

// ── ALUNOS ───────────────────────────────────────────────────
function renderAlunos(busca) {
  let lista = DB.getAlunos();
  if (busca) {
    const q = busca.toLowerCase();
    lista = lista.filter(a => a.nome.toLowerCase().includes(q) || a.matricula.includes(q));
  }
  lista.sort((a,b) => a.nome.localeCompare(b.nome));
  const tbody = document.getElementById('tabelaAlunos');
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🔍</div><p>Nenhum aluno encontrado.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(a => `
    <tr>
      <td>
        <div class="flex-center gap-8">
          <div class="avatar" style="width:30px;height:30px;font-size:12px;flex-shrink:0">${Utils.initials(a.nome)}</div>
          <strong>${a.nome}</strong>
        </div>
      </td>
      <td>${a.matricula}</td>
      <td>${a.curso} · ${a.turma}</td>
      <td>${a.email}</td>
      <td>${Utils.badgeCadastro(a.statusCadastro)}</td>
      <td class="text-muted">${Utils.fmtDate(a.dataCadastro)}</td>
    </tr>
  `).join('');
}

document.getElementById('buscaAluno').addEventListener('input', function() {
  renderAlunos(this.value.trim());
});

// ── APROVAÇÕES ───────────────────────────────────────────────
function renderAprovacoes() {
  const pendentes = DB.getAlunos().filter(a => a.statusCadastro === 'pendente');
  const badge = document.getElementById('badgePendentes');
  if (pendentes.length > 0) { badge.textContent = pendentes.length; badge.style.display = 'inline-flex'; }
  else { badge.style.display = 'none'; }

  const tbody = document.getElementById('tabelaAprovacoes');
  if (!pendentes.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🎉</div><p>Nenhuma aprovação pendente no momento.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = pendentes.map(a => `
    <tr>
      <td><strong>${a.nome}</strong></td>
      <td>${a.matricula}</td>
      <td>${a.curso} · ${a.turma}</td>
      <td>${a.cpf}</td>
      <td class="text-muted">${Utils.fmtDate(a.dataCadastro)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-accent btn-sm" onclick="aprovar('${a.id}')">Aprovar</button>
          <button class="btn btn-danger btn-sm" onclick="rejeitar('${a.id}')">Rejeitar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function aprovar(id) {
  DB.updateAluno(id, { statusCadastro: 'aprovado' });
  renderAprovacoes();
}
function rejeitar(id) {
  if (confirm('Deseja rejeitar este cadastro?')) {
    DB.updateAluno(id, { statusCadastro: 'rejeitado' });
    renderAprovacoes();
  }
}

// ── MODAL OBS ────────────────────────────────────────────────
function openObs(id, obs) {
  document.getElementById('obsConsultaId').value = id;
  document.getElementById('obsInput').value = obs || '';
  document.getElementById('modalObs').classList.add('open');
}
function closeModal() {
  document.getElementById('modalObs').classList.remove('open');
}
function salvarObs() {
  const id  = document.getElementById('obsConsultaId').value;
  const obs = document.getElementById('obsInput').value.trim();
  DB.updateConsulta(id, { observacaoPsicologa: obs });
  closeModal();
  renderConsultas(filtroConsultas);
}
document.getElementById('modalObs').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── Boot ─────────────────────────────────────────────────────
renderDashboard();
