import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (ordem respeitando foreign keys)
  await prisma.extra_payroll_items.deleteMany();
  await prisma.extra_payroll.deleteMany();
  await prisma.overtime_config.deleteMany();
  await prisma.payroll_benefits.deleteMany();
  await prisma.payrolls.deleteMany();
  await prisma.payroll_periods.deleteMany();
  await prisma.time_sheets.deleteMany();
  await prisma.time_clock_adjustments.deleteMany();
  await prisma.time_clocks.deleteMany();
  await prisma.assignments.deleteMany();
  await prisma.post_schedules.deleteMany();
  await prisma.generated_schedules.deleteMany();
  await prisma.employees.deleteMany();
  await prisma.work_posts.deleteMany();
  await prisma.contracts.deleteMany();
  await prisma.clients.deleteMany();
  await prisma.users.deleteMany();
  await prisma.companies.deleteMany();
  console.log('🗑️  Dados anteriores limpos');

  // Senha padrão: 123456
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Empresa
  const company = await prisma.companies.create({
    data: {
      name: 'Spark Vigilância e Segurança',
      cnpj: '12.345.678/0001-90',
      phone: '(27) 3000-0000',
      email: 'contato@sparkvigilancia.com.br',
    },
  });
  console.log('✅ Empresa criada:', company.name);

  // 2. Cliente
  const client = await prisma.clients.create({
    data: {
      name: 'Cliente Teste LTDA',
      cnpj_cpf: '98.765.432/0001-10',
      contact_name: 'Admin Cliente',
      contact_phone: '(27) 99999-0000',
      contact_email: 'admin@clienteteste.com.br',
    },
  });
  console.log('✅ Cliente criado:', client.name);

  // 3. Contrato
  const contract = await prisma.contracts.create({
    data: {
      client_id: client.id,
      company_id: company.id,
      contract_number: 'CTR-2026-001',
      description: 'Contrato de vigilância patrimonial',
      start_date: new Date('2026-01-01'),
      end_date: new Date('2026-12-31'),
      total_value: 15000.0,
      status: 'ATIVO',
    },
  });
  console.log('✅ Contrato criado:', contract.contract_number);

  // 4. Posto de Trabalho
  const post = await prisma.work_posts.create({
    data: {
      contract_id: contract.id,
      name: 'Edifício Central - Portaria',
      post_type: 'PORTARIA',
      address: 'Rua Castelo Branco, 1012 - Vila Velha/ES',
      latitude: -20.3367,
      longitude: -40.3367,
      gps_radius: 100,
      schedule_type: 'ROTATIVO',
      required_vacancies: 2,
      status: 'ATIVO',
    },
  });
  console.log('✅ Posto criado:', post.name);

  const post2 = await prisma.work_posts.create({
    data: {
      contract_id: contract.id,
      name: 'Shopping Vila Velha - Vigilância',
      post_type: 'VIGILANCIA',
      address: 'Av. Nossa Senhora da Penha, 2000 - Vila Velha/ES',
      latitude: -20.3400,
      longitude: -40.3300,
      gps_radius: 100,
      schedule_type: 'FIXO',
      required_vacancies: 4,
      status: 'ATIVO',
    },
  });
  console.log('✅ Posto 2 criado:', post2.name);

  // 5. Colaborador Admin (DP/RH)
  const adminEmployee = await prisma.employees.create({
    data: {
      registration_number: '2026SPK0001',
      cpf: '000.000.000-00',
      full_name: 'Administrador do Sistema',
      birth_date: new Date('1990-01-01'),
      gender: 'MASCULINO',
      marital_status: 'SOLTEIRO',
      email: 'admin@spark.com.br',
      phone: '(27) 99999-0001',
      admission_date: new Date('2026-01-01'),
      status: 'ATIVO',
    },
  });

  // Usuário Admin
  await prisma.users.create({
    data: {
      cpf: '00000000000',
      password_hash: passwordHash,
      employee_id: adminEmployee.id,
      role: 'ADMIN',
      is_active: true,
      is_first_access: false,
    },
  });
  console.log('✅ Admin criado: CPF 000.000.000-00 / Senha: 123456');

  // 6. Colaborador DP/RH
  const dpEmployee = await prisma.employees.create({
    data: {
      registration_number: '2026SPK0002',
      cpf: '111.111.111-11',
      full_name: 'Maria Silva - DP/RH',
      birth_date: new Date('1985-05-15'),
      gender: 'FEMININO',
      marital_status: 'CASADO',
      email: 'maria.silva@spark.com.br',
      phone: '(27) 99999-0002',
      admission_date: new Date('2026-01-01'),
      status: 'ATIVO',
    },
  });

  await prisma.users.create({
    data: {
      cpf: '11111111111',
      password_hash: passwordHash,
      employee_id: dpEmployee.id,
      role: 'DP_RH',
      is_active: true,
      is_first_access: false,
    },
  });
  console.log('✅ DP/RH criado: CPF 111.111.111-11 / Senha: 123456');

  // 7. Porteiros
  const porteiro1 = await prisma.employees.create({
    data: {
      registration_number: '2026SPK0003',
      cpf: '222.222.222-22',
      full_name: 'João da Silva - Porteiro',
      birth_date: new Date('1980-08-20'),
      gender: 'MASCULINO',
      marital_status: 'CASADO',
      email: 'joao.silva@email.com',
      phone: '(27) 99999-0003',
      bank_name: 'Banco do Brasil',
      bank_agency: '1234-5',
      bank_account: '67890-1',
      admission_date: new Date('2026-03-01'),
      status: 'ATIVO',
    },
  });

  await prisma.users.create({
    data: {
      cpf: '22222222222',
      password_hash: passwordHash,
      employee_id: porteiro1.id,
      role: 'EMPLOYEE',
      is_active: true,
      is_first_access: false,
    },
  });

  // Alocação do porteiro
  await prisma.assignments.create({
    data: {
      employee_id: porteiro1.id,
      post_id: post.id,
      start_date: new Date('2026-03-01'),
      shift: 'NOITE',
      position: 'Porteiro',
      base_salary: 2800.0,
      status: 'ATIVA',
    },
  });
  console.log('✅ Porteiro 1 criado: CPF 222.222.222-22 / Senha: 123456');

  // 8. Vigilantes
  const vigilante1 = await prisma.employees.create({
    data: {
      registration_number: '2026SPK0004',
      cpf: '333.333.333-33',
      full_name: 'Pedro Oliveira - Vigilante',
      birth_date: new Date('1975-12-10'),
      gender: 'MASCULINO',
      marital_status: 'DIVORCIADO',
      email: 'pedro.oliveira@email.com',
      phone: '(27) 99999-0004',
      bank_name: 'Itaú',
      bank_agency: '5678-9',
      bank_account: '12345-6',
      admission_date: new Date('2026-02-01'),
      status: 'ATIVO',
    },
  });

  await prisma.users.create({
    data: {
      cpf: '33333333333',
      password_hash: passwordHash,
      employee_id: vigilante1.id,
      role: 'EMPLOYEE',
      is_active: true,
      is_first_access: false,
    },
  });

  await prisma.assignments.create({
    data: {
      employee_id: vigilante1.id,
      post_id: post2.id,
      start_date: new Date('2026-02-01'),
      shift: 'MANHA',
      position: 'Vigilante',
      base_salary: 3200.0,
      additional: 960.0, // Periculosidade 30%
      status: 'ATIVA',
    },
  });
  console.log('✅ Vigilante 1 criado: CPF 333.333.333-33 / Senha: 123456');

  // 9. Configuração de HE Separado (Porteiros)
  await prisma.overtime_config.create({
    data: {
      post_id: post.id,
      fixed_value: 150.0,
      max_per_month: 99,
      payment_type: 'SEPARATE',
      is_active: true,
    },
  });
  console.log('✅ Config HE Porteiros criada: R$ 150,00 por escala extra');

  // 10. Configuração de HE Vigilantes
  await prisma.overtime_config.create({
    data: {
      post_id: post2.id,
      fixed_value: 180.0,
      max_per_month: 3,
      payment_type: 'PAYSLIP',
      is_active: true,
    },
  });
  console.log('✅ Config HE Vigilantes criada: R$ 180,00 por escala extra (limite 3/mês)');

  console.log('\n📋 Resumo do Seed:');
  console.log('==================');
  console.log('Admin:     CPF 000.000.000-00 / Senha: 123456');
  console.log('DP/RH:     CPF 111.111.111-11 / Senha: 123456');
  console.log('Porteiro:  CPF 222.222.222-22 / Senha: 123456');
  console.log('Vigilante: CPF 333.333.333-33 / Senha: 123456');
  console.log('\n✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
