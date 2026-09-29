import { InvoiceData } from '@stores/Appointment/types';
import lightColors from '@theme/light';

import { logger } from '@lib/logger';
/**
 * Sanitiza strings para prevenir injeção de HTML (XSS)
 */
const escapeHtml = (unsafe: string | number | undefined): string => {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const validateInvoiceData = (data: InvoiceData): boolean => {
  const requiredFields = [
    'invoiceNumber',
    'customerName',
    'customerCpf',
    'professionalName',
    'serviceName',
    'total',
  ];

  return requiredFields.every(
    (field) =>
      data[field as keyof InvoiceData] !== undefined &&
      data[field as keyof InvoiceData] !== null,
  );
};

const getStyles = () => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Helvetica', 'Arial', sans-serif;
    line-height: 1.6;
    color: ${lightColors.primaryBlack};
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    background-color: ${lightColors.primaryWhite};
  }
  .header {
    text-align: center;
    border-bottom: 3px solid ${lightColors.primaryBlue};
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .logo {
    font-size: 32px;
    font-weight: bold;
    color: ${lightColors.primaryBlue};
    margin-bottom: 5px;
    letter-spacing: -1px;
  }
  .invoice-title {
    font-size: 24px;
    color: ${lightColors.primaryBlack};
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .invoice-number {
    font-size: 14px;
    color: ${lightColors.textSecondary};
    font-weight: bold;
  }
  .section {
    margin-bottom: 25px;
    padding: 20px;
    border: 1px solid ${lightColors.borderColor};
    border-radius: 8px;
    background-color: ${lightColors.inputBackground};
  }
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: ${lightColors.primaryBlue};
    margin-bottom: 15px;
    border-bottom: 1px solid ${lightColors.borderColor};
    padding-bottom: 5px;
    text-transform: uppercase;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 5px 0;
    font-size: 14px;
  }
  .info-label {
    font-weight: bold;
    color: ${lightColors.textSecondary};
    width: 40%;
  }
  .info-value {
    color: ${lightColors.primaryBlack};
    width: 60%;
    text-align: right;
    font-weight: 500;
  }
  .service-details {
    background-color: #F0F7FC;
    border: 1px solid ${lightColors.primaryBlue};
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }
  .total-section {
    background-color: ${lightColors.primaryBlue};
    color: white;
    text-align: center;
    padding: 25px;
    border-radius: 8px;
    margin-top: 30px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .total-label { font-size: 18px; opacity: 0.9; }
  .total-amount {
    font-size: 36px;
    font-weight: bold;
    margin-top: 5px;
  }
  .footer {
    text-align: center;
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid ${lightColors.borderColor};
    color: ${lightColors.textTertiary};
    font-size: 12px;
  }
  .datetime {
    text-align: right;
    color: ${lightColors.textSecondary};
    font-size: 12px;
    margin-bottom: 20px;
  }
  @media print {
    body { margin: 0; padding: 20px; }
    .section, .service-details, .total-section { break-inside: avoid; }
  }
`;

const InvoiceTemplate = (invoiceData: InvoiceData): string => {
  if (!validateInvoiceData(invoiceData)) {
    logger.error('Dados inválidos para geração de NF:', invoiceData);
    throw new Error('Dados obrigatórios da nota fiscal estão ausentes');
  }

  const safeData = {
    invoiceNumber: escapeHtml(invoiceData.invoiceNumber),
    customerName: escapeHtml(invoiceData.customerName),
    customerCpf: escapeHtml(invoiceData.customerCpf),
    customerAddress: escapeHtml(invoiceData.customerAddress),
    professionalName: escapeHtml(invoiceData.professionalName),
    professionalCpf: escapeHtml(invoiceData.professionalCpf),
    serviceName: escapeHtml(invoiceData.serviceName),
    serviceDescription: escapeHtml(invoiceData.serviceDescription),
    serviceDate: escapeHtml(invoiceData.serviceDate),
    serviceTime: escapeHtml(invoiceData.serviceTime),
  };

  return `
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nota Fiscal - DelBicos</title>
        <style>${getStyles()}</style>
      </head>
      <body>
        <div class="datetime">
          Emitido em: ${new Date().toLocaleString('pt-BR')}
        </div>
        
        <div class="header">
          <div class="logo">del<span style="color:${lightColors.primaryOrange}">Bicos</span></div>
          <div class="invoice-title">Nota Fiscal de Serviço</div>
          <div class="invoice-number">Nº ${safeData.invoiceNumber}</div>
        </div>

        <div class="section">
          <div class="section-title">Dados do Cliente</div>
          <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value">${safeData.customerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">CPF:</span>
            <span class="info-value">${safeData.customerCpf}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Endereço:</span>
            <span class="info-value">${safeData.customerAddress || 'Não informado'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Dados do Prestador</div>
          <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value">${safeData.professionalName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">CPF/CNPJ:</span>
            <span class="info-value">${safeData.professionalCpf}</span>
          </div>
        </div>

        <div class="service-details">
          <div class="section-title">Detalhes do Serviço</div>
          <div class="info-row">
            <span class="info-label">Serviço:</span>
            <span class="info-value">${safeData.serviceName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Descrição:</span>
            <span class="info-value">${safeData.serviceDescription || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data:</span>
            <span class="info-value">${safeData.serviceDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Horário:</span>
            <span class="info-value">${safeData.serviceTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Valor Unitário:</span>
            <span class="info-value">${formatCurrency(invoiceData.servicePrice)}</span>
          </div>
        </div>

        <div class="total-section">
          <div class="total-label">Valor Total a Pagar</div>
          <div class="total-amount">${formatCurrency(invoiceData.total)}</div>
        </div>

        <div class="footer">
          <p>Este documento é uma representação de recibo gerado pela plataforma DelBicos.</p>
          <p>DelBicos - Delivery de Serviços Profissionais</p>
          <p>www.delbicos.com.br</p>
        </div>
      </body>
    </html>
  `;
};

export default InvoiceTemplate;
