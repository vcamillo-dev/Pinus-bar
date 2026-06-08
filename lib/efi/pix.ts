import type { CobrancaPixResult } from '@/types';

// A biblioteca efipay usa require (CJS)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EfiPay = require('sdk-node-apis-efi');

function getEfi() {
  return new EfiPay({
    client_id:     process.env.EFI_CLIENT_ID!,
    client_secret: process.env.EFI_CLIENT_SECRET!,
    sandbox:       process.env.EFI_SANDBOX === 'true',
    certificate:   process.env.EFI_CERT_PATH!,
  });
}

interface GerarParams {
  valor:     number;   // em reais, ex: 28.90
  nome:      string;
  cpf?:      string;   // opcional — usar '00000000000' se não coletar
  descricao: string;
}

/**
 * Cria uma cobrança Pix imediata na Efí Bank e retorna
 * o txid, location, código copia-e-cola e imagem base64 do QR Code.
 */
export async function gerarCobrancaPix(p: GerarParams): Promise<CobrancaPixResult> {
  const efi = getEfi();

  const body = {
    calendario:   { expiracao: 3600 }, // 1h para pagar
    devedor:      { nome: p.nome, cpf: p.cpf ?? '00000000000' },
    valor:        { original: p.valor.toFixed(2) },
    chave:        process.env.EFI_PIX_KEY!,
    infoAdicionais: [{ nome: 'Pedido', valor: p.descricao }],
  };

  const cob = await efi.pixCreateImmediateCharge({}, body);
  const qr  = await efi.pixGenerateQRCode({ id: cob.loc.id });

  return {
    txid:          cob.txid          as string,
    location:      cob.location      as string,
    pixCopiaECola: qr.qrcode         as string,
    imagemQrCode:  qr.imagemQrcode   as string, // PNG base64
  };
}

/**
 * Registra a URL do webhook na Efí Bank.
 * Executar UMA vez via script: `npx ts-node scripts/registrar-webhook.ts`
 */
export async function registrarWebhook() {
  const efi = getEfi();
  await efi.pixConfigWebhook(
    { chave: process.env.EFI_PIX_KEY! },
    { webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/pix` }
  );
  console.log('✅ Webhook Pix registrado com sucesso.');
}

/**
 * Consulta o status de uma cobrança (uso opcional — prefira o webhook).
 */
export async function consultarCobranca(txid: string) {
  const efi = getEfi();
  return efi.pixDetailCharge({ txid });
}
