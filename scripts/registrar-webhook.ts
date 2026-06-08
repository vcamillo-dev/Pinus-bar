/**
 * Execute UMA vez após o deploy para registrar a URL
 * do webhook de Pix na Efí Bank:
 *
 *   npx ts-node --project tsconfig.json scripts/registrar-webhook.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { registrarWebhook } from '../lib/efi/pix';

(async () => {
  try {
    console.log('🔗 Registrando webhook Pix na Efí Bank...');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/pix`);
    console.log(`   Chave Pix: ${process.env.EFI_PIX_KEY}`);
    console.log(`   Sandbox: ${process.env.EFI_SANDBOX}`);
    await registrarWebhook();
    console.log('✅ Webhook registrado com sucesso!');
  } catch (err) {
    console.error('❌ Falha ao registrar webhook:', err);
    process.exit(1);
  }
})();
