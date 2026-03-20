// ── dados.js ─────────────────────────────────────────────────
// Camada de persistência via localStorage

const DB = {
  // ─ Alunos ─────────────────────────────────────────────────
  getAlunos() {
    return JSON.parse(localStorage.getItem('psi_alunos') || '[]');
  },
  saveAlunos(arr) {
    localStorage.setItem('psi_alunos', JSON.stringify(arr));
  },
  addAluno(aluno) {
    const arr = this.getAlunos();
    aluno.id = 'ALU_' + Date.now();
    aluno.statusCadastro = 'pendente'; // pendente | aprovado | rejeitado
    aluno.dataCadastro = new Date().toISOString();
    arr.push(aluno);
    this.saveAlunos(arr);
    return aluno;
  },
  getAlunoByMatricula(matricula) {
    return this.getAlunos().find(a => a.matricula === matricula);
  },
  getAlunoById(id) {
    return this.getAlunos().find(a => a.id === id);
  },
  updateAluno(id, changes) {
    const arr = this.getAlunos().map(a => a.id === id ? { ...a, ...changes } : a);
    this.saveAlunos(arr);
  },

  // ─ Consultas ──────────────────────────────────────────────
  getConsultas() {
    return JSON.parse(localStorage.getItem('psi_consultas') || '[]');
  },
  saveConsultas(arr) {
    localStorage.setItem('psi_consultas', JSON.stringify(arr));
  },
  addConsulta(consulta) {
    const arr = this.getConsultas();
    consulta.id = 'CON_' + Date.now();
    consulta.statusConsulta = 'aguardando';
    consulta.dataCriacao = new Date().toISOString();
    consulta.observacaoPsicologa = '';
    arr.push(consulta);
    this.saveConsultas(arr);
    return consulta;
  },
  getConsultasByAluno(idAluno) {
    return this.getConsultas().filter(c => c.idAluno === idAluno);
  },
  getConsultaById(id) {
    return this.getConsultas().find(c => c.id === id);
  },
  updateConsulta(id, changes) {
    const arr = this.getConsultas().map(c => c.id === id ? { ...c, ...changes } : c);
    this.saveConsultas(arr);
  },

  // ─ Sessão ─────────────────────────────────────────────────
  getSessao() {
    return JSON.parse(sessionStorage.getItem('psi_sessao') || 'null');
  },
  setSessao(data) {
    sessionStorage.setItem('psi_sessao', JSON.stringify(data));
  },
  clearSessao() {
    sessionStorage.removeItem('psi_sessao');
  },

  // ─ Seed inicial ───────────────────────────────────────────
  seed() {
    if (this.getAlunos().length) return; // já tem dados
    const alunos = [
      {
        id: 'ALU_001', nome: 'Ana Souza', matricula: '2024001',
        cpf: '111.222.333-44', curso: 'Administração', turma: 'ADM-1A',
        telefone: '(61) 99100-0001', email: 'ana@email.com',
        senha: '111.222.333-44', statusCadastro: 'aprovado',
        dataCadastro: new Date(Date.now() - 86400000 * 5).toISOString(),
        primeiroLogin: false
      },
      {
        id: 'ALU_002', nome: 'Carlos Lima', matricula: '2024002',
        cpf: '222.333.444-55', curso: 'Informática', turma: 'INF-2B',
        telefone: '(61) 99100-0002', email: 'carlos@email.com',
        senha: '222.333.444-55', statusCadastro: 'aprovado',
        dataCadastro: new Date(Date.now() - 86400000 * 3).toISOString(),
        primeiroLogin: false
      },
      {
        id: 'ALU_003', nome: 'Beatriz Nunes', matricula: '2024003',
        cpf: '333.444.555-66', curso: 'Enfermagem', turma: 'ENF-3C',
        telefone: '(61) 99100-0003', email: 'bia@email.com',
        senha: '333.444.555-66', statusCadastro: 'pendente',
        dataCadastro: new Date(Date.now() - 3600000 * 2).toISOString(),
        primeiroLogin: true
      }
    ];
    this.saveAlunos(alunos);

    const consultas = [
      {
        id: 'CON_001', idAluno: 'ALU_001',
        motivo: 'Ansiedade com provas', dataPreferencial: '2026-03-20',
        horarioPreferencial: '10:00', turno: 'manhã',
        observacaoAluno: 'Urgente.', observacaoPsicologa: '',
        statusConsulta: 'confirmada',
        dataCriacao: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'CON_002', idAluno: 'ALU_001',
        motivo: 'Dificuldade de concentração', dataPreferencial: '2026-03-10',
        horarioPreferencial: '14:00', turno: 'tarde',
        observacaoAluno: '', observacaoPsicologa: 'Retorno agendado.',
        statusConsulta: 'realizada',
        dataCriacao: new Date(Date.now() - 86400000 * 8).toISOString()
      },
      {
        id: 'CON_003', idAluno: 'ALU_002',
        motivo: 'Conflito com colegas', dataPreferencial: '2026-03-18',
        horarioPreferencial: '09:00', turno: 'manhã',
        observacaoAluno: '', observacaoPsicologa: '',
        statusConsulta: 'aguardando',
        dataCriacao: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'CON_004', idAluno: 'ALU_002',
        motivo: 'Estresse', dataPreferencial: '2026-03-05',
        horarioPreferencial: '11:00', turno: 'manhã',
        observacaoAluno: '', observacaoPsicologa: '',
        statusConsulta: 'nao_compareceu',
        dataCriacao: new Date(Date.now() - 86400000 * 12).toISOString()
      }
    ];
    this.saveConsultas(consultas);
  }
};

// Seed ao carregar
DB.seed();
