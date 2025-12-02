#!/usr/bin/env node

/**
 * Script para validar e configurar webhooks do Mercado Pago
 * 
 * Uso:
 * npx ts-node scripts/webhook-setup.ts --check
 * npx ts-node scripts/webhook-setup.ts --generate-token
 * npx ts-node scripts/webhook-setup.ts --test
 */

import * as fs from 'fs';
import * as path from 'path';

interface WebhookSetupConfig {
  webhookUrl: string;
  secretToken: string;
  events: string[];
}

class WebhookSetup {
  private projectRoot: string;
  private envLocalPath: string;
  private envProdPath: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.envLocalPath = path.join(this.projectRoot, '.env.local');
    this.envProdPath = path.join(this.projectRoot, '.env.production');
  }

  /**
   * Verificar configuração atual de webhooks
   */
  async checkConfiguration(): Promise<void> {
    console.log('\n🔍 Verificando configuração de webhooks...\n');

    // Verificar .env.local
    this.checkEnvFile(this.envLocalPath, 'Desenvolvimento (Local)');

    // Verificar .env.production
    if (fs.existsSync(this.envProdPath)) {
      this.checkEnvFile(this.envProdPath, 'Produção (Vercel)');
    }

    // Verificar arquivo de configuração
    this.checkWebhookConfigFile();

    // Verificar rota de webhook
    this.checkWebhookRoute();

    console.log('\n✅ Verificação concluída!\n');
  }

  /**
   * Verificar variáveis em arquivo .env
   */
  private checkEnvFile(filePath: string, label: string): void {
    console.log(`📄 Arquivo: ${label}`);
    console.log(`   Caminho: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log('   ❌ Arquivo não encontrado\n');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const webhookUrl = this.extractEnvValue(content, 'MERCADO_PAGO_WEBHOOK_URL');
    const webhookToken = this.extractEnvValue(content, 'WEBHOOK_SECRET_TOKEN');
    const webhookEvents = this.extractEnvValue(content, 'WEBHOOK_EVENTS');

    console.log(`   ✓ URL: ${webhookUrl ? '✅ Configurada' : '❌ Não configurada'}`);
    if (webhookUrl) {
      console.log(`     → ${webhookUrl}`);
    }
    console.log(`   ✓ Token: ${webhookToken ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`   ✓ Eventos: ${webhookEvents ? '✅ Configurados' : '❌ Não configurados'}`);
    if (webhookEvents) {
      console.log(`     → ${webhookEvents}`);
    }
    console.log('');
  }

  /**
   * Verificar arquivo de configuração de webhooks
   */
  private checkWebhookConfigFile(): void {
    console.log('📋 Arquivo de Configuração');
    const configPath = path.join(this.projectRoot, 'lib', 'webhookConfig.ts');

    if (fs.existsSync(configPath)) {
      console.log(`   ✅ Arquivo exists: ${configPath}\n`);
    } else {
      console.log(`   ❌ Arquivo não encontrado: ${configPath}\n`);
    }
  }

  /**
   * Verificar rota de webhook
   */
  private checkWebhookRoute(): void {
    console.log('🚀 Rota de Webhook');
    const routePath = path.join(
      this.projectRoot,
      'app',
      'api',
      'payments',
      'webhook',
      'route.ts'
    );

    if (fs.existsSync(routePath)) {
      console.log(`   ✅ Rota implementada: /api/payments/webhook\n`);
    } else {
      console.log(`   ❌ Rota não encontrada\n`);
    }
  }

  /**
   * Gerar novo token de segurança
   */
  async generateSecretToken(): Promise<void> {
    console.log('\n🔐 Gerando novo token de segurança...\n');

    const token = this.generateRandomToken(32);
    console.log(`Novo token: ${token}\n`);
    console.log('📝 Adicione a seguinte linha ao .env.local e .env.production:\n');
    console.log(`WEBHOOK_SECRET_TOKEN=${token}\n`);

    // Opcionalmente adicionar ao arquivo
    const response = await this.promptUser('Deseja adicionar ao .env.local? (s/n): ');
    if (response.toLowerCase() === 's') {
      this.addToEnvFile(this.envLocalPath, 'WEBHOOK_SECRET_TOKEN', token);
      console.log('✅ Token adicionado ao .env.local\n');
    }
  }

  /**
   * Testar webhook
   */
  async testWebhook(): Promise<void> {
    console.log('\n🧪 Testando webhook...\n');

    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      console.log('❌ URL do webhook não configurada\n');
      return;
    }

    console.log(`URL: ${webhookUrl}`);
    console.log('Enviando notificação de teste...\n');

    try {
      const testNotification = {
        id: `test_${Date.now()}`,
        live_mode: false,
        type: 'payment.updated',
        date_created: new Date().toISOString(),
        user_id: 0,
        topic: 'payment',
        resource: { id: '12345678' },
        data: { id: '12345678' },
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Test': 'true',
        },
        body: JSON.stringify(testNotification),
      });

      if (response.ok) {
        console.log(`✅ Webhook respondeu com status ${response.status}`);
        console.log('✅ Webhook está funcionando!\n');
      } else {
        console.log(
          `⚠️  Webhook respondeu com status ${response.status}`
        );
        console.log('Isso pode ser normal dependendo da implementação.\n');
      }
    } catch (error: any) {
      console.log(
        `❌ Erro ao testar webhook: ${error.message}\n`
      );
      console.log('Dicas:');
      console.log('- Verifique se o servidor está rodando (npm run dev)');
      console.log('- Verifique se a URL está correta em .env.local');
      console.log('- Verifique se há firewall bloqueando a conexão\n');
    }
  }

  /**
   * Extrair valor de variável de ambiente
   */
  private extractEnvValue(content: string, key: string): string | null {
    const regex = new RegExp(`^${key}=(.*)$`, 'm');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Obter URL do webhook
   */
  private getWebhookUrl(): string | null {
    let url = null;

    if (fs.existsSync(this.envLocalPath)) {
      const content = fs.readFileSync(this.envLocalPath, 'utf-8');
      url = this.extractEnvValue(content, 'MERCADO_PAGO_WEBHOOK_URL');
    }

    if (!url && fs.existsSync(this.envProdPath)) {
      const content = fs.readFileSync(this.envProdPath, 'utf-8');
      url = this.extractEnvValue(content, 'MERCADO_PAGO_WEBHOOK_URL');
    }

    return url;
  }

  /**
   * Adicionar valor ao arquivo .env
   */
  private addToEnvFile(filePath: string, key: string, value: string): void {
    let content = '';
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
    }

    // Remover linha existente se houver
    content = content.replace(new RegExp(`^${key}=.*$`, 'm'), '');

    // Adicionar nova linha
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    content += `${key}=${value}\n`;

    fs.writeFileSync(filePath, content);
  }

  /**
   * Gerar token aleatório
   */
  private generateRandomToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Perguntar ao usuário
   */
  private async promptUser(question: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(question);
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }
}

/**
 * Main
 */
async function main() {
  const setup = new WebhookSetup();
  const command = process.argv[2];

  console.log('\n🔔 Webhook Setup - Mercado Pago\n');

  switch (command) {
    case '--check':
      await setup.checkConfiguration();
      break;
    case '--generate-token':
      await setup.generateSecretToken();
      break;
    case '--test':
      await setup.testWebhook();
      break;
    default:
      console.log('Comandos disponíveis:\n');
      console.log('  --check           Verificar configuração de webhooks');
      console.log('  --generate-token  Gerar novo token de segurança');
      console.log('  --test            Testar webhook\n');
      console.log('Exemplo: npm run webhook:setup -- --check\n');
  }
}

main().catch(console.error);
