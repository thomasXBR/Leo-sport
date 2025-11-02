/**
 * Funções de validação de email
 */

// Lista de emails de demonstração/teste que devem ser bloqueados
const BLOCKED_EMAIL_DOMAINS = [
  'test.com',
  'teste.com',
  'demo.com',
  'demonstracao.com',
  'example.com',
  'exemplo.com',
  'fake.com',
  'mock.com',
  'sample.com',
  'admin.com',
  'leosport.com', // Bloquear emails da própria empresa para demonstração
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
];

const BLOCKED_EMAIL_PATTERNS = [
  /^usuario@/i,
  /^demo@/i,
  /^test@/i,
  /^teste@/i,
  /^admin@/i,
  /@leosport\.com$/i,
  /demonstracao/i,
  /demonstration/i,
  /demonstração/i,
  /usuario.*demonstracao/i,
  /user.*demo/i,
  /demo.*user/i,
];

/**
 * Valida o formato do email
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || email.trim() === '') {
    return false;
  }

  // Regex para validação de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Verifica se o email está na lista de bloqueados
 */
export function isBlockedEmail(email: string): boolean {
  if (!email) return true;

  const normalizedEmail = email.toLowerCase().trim();

  // Verificar domínios bloqueados
  const domain = normalizedEmail.split('@')[1];
  if (domain && BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return true;
  }

  // Verificar padrões bloqueados
  for (const pattern of BLOCKED_EMAIL_PATTERNS) {
    if (pattern.test(normalizedEmail)) {
      return true;
    }
  }

  return false;
}

/**
 * Validação completa do email
 * Retorna { valid: boolean, error?: string }
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email é obrigatório' };
  }

  if (!isValidEmailFormat(email)) {
    return { valid: false, error: 'Email inválido. Por favor, insira um email válido.' };
  }

  if (isBlockedEmail(email)) {
    return {
      valid: false,
      error: 'Este email não pode ser usado. Por favor, use um email pessoal válido.',
    };
  }

  return { valid: true };
}

