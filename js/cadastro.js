document.getElementById('formCadastro').addEventListener('submit', function(e) {
  e.preventDefault();
  const matricula = document.getElementById('matricula').value.trim();

  if (DB.getAlunoByMatricula(matricula)) {
    Utils.showAlert('alertBox', 'danger', 'Matrícula já cadastrada no sistema.');
    return;
  }

  const aluno = {
    nome:      document.getElementById('nome').value.trim(),
    matricula,
    cpf:       document.getElementById('cpf').value.trim(),
    telefone:  document.getElementById('telefone').value.trim(),
    curso:     document.getElementById('curso').value.trim(),
    turma:     document.getElementById('turma').value.trim(),
    email:     document.getElementById('email').value.trim(),
    senha:     document.getElementById('cpf').value.trim(), // senha inicial = CPF
    primeiroLogin: true
  };

  DB.addAluno(aluno);

  document.getElementById('formCadastro').innerHTML = `
    <div class="alert alert-success">
      ✅ <strong>Cadastro enviado com sucesso!</strong><br/>
      Aguarde aprovação da psicóloga em até 24 horas. Após aprovação, seu login será a <strong>matrícula</strong> e a senha inicial é o seu <strong>CPF</strong>.
    </div>
    <a href="index.html" class="btn btn-outline btn-full mt-16">Voltar para início</a>
  `;
});
