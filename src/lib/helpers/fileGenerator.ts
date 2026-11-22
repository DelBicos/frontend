import {
  cacheDirectory,
  writeAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import { printToFileAsync, FilePrintOptions } from 'expo-print';
import { Platform } from 'react-native';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { logger } from '@lib/logger';
type BlobType = 'text/csv' | 'application/octet-stream';

export async function generateFileURI(
  content: string,
  filename: string,
  type: BlobType,
  encoding: EncodingType = EncodingType.UTF8,
): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      let blob: Blob;

      if (encoding === 'base64') {
        const binario = atob(content);
        const array = new Uint8Array(binario.length);
        for (let i = 0; i < binario.length; i++) {
          array[i] = binario.charCodeAt(i);
        }
        blob = new Blob([array], { type });
      } else {
        blob = new Blob([content], { type });
      }

      const url = URL.createObjectURL(blob);

      return url;
    }

    const fileUri = `${cacheDirectory}${filename}`;

    await writeAsStringAsync(fileUri, content, {
      encoding,
    });

    return fileUri;
  } catch (error) {
    logger.error('Erro ao compartilhar:', error);
    return null;
  }
}

/**
 * Gera um arquivo PDF a partir de conteúdo HTML
 * @param htmlContent - String contendo o HTML que será convertido para PDF
 * @param filename - Nome do arquivo (opcional, padrão: 'invoice')
 * @param customOptions - Opções customizadas para geração do PDF
 * @returns Promise<string> - URI do arquivo PDF gerado
 */
export const generatePDF = async (
  htmlContent: string,
  filename: string = 'invoice',
  customOptions?: Partial<FilePrintOptions>,
): Promise<string> => {
  try {
    if (!htmlContent || htmlContent.trim().length === 0) {
      throw new Error('Conteúdo HTML não pode estar vazio');
    }

    // Tratamento especial para web
    if (Platform.OS === 'web') {
      // Create a blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // Open the blob URL in a new window
      const newWindow = window.open(url, '_blank');

      if (!newWindow) {
        throw new Error(
          'Não foi possível abrir uma nova janela. Verifique se os pop-ups estão permitidos.',
        );
      }

      // Print after content is loaded
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          // Clean up the object URL
          URL.revokeObjectURL(url);
        }, 300);
      };

      return 'web-pdf-printed';
    }

    // Configurações padrão para o PDF (plataformas nativas)
    const defaultOptions: FilePrintOptions = {
      html: htmlContent,
      width: 612, // Largura em pontos (equivale a uma página A4: 8.5 x 11 polegadas)
      height: 792, // Altura em pontos
      base64: false, // Retorna URI ao invés de base64
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    };

    const options: FilePrintOptions = { ...defaultOptions, ...customOptions };

    // Gera o PDF usando expo-print
    const { uri } = await printToFileAsync(options);

    if (!uri) {
      throw new Error('Falha ao gerar o arquivo PDF');
    }

    return uri;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw new Error(`Falha ao gerar PDF: ${error}`);
  }
};

// =============================================================
// EXPORTA CSV
// =============================================================
export const generateCSV = async (
  dados: Record<string, unknown>[] | (string | number)[][],
): Promise<string | undefined> => {
  if (!dados || dados.length === 0) {
    logger.error('Erro', 'Nenhum dado para exportar');
    return;
  }
  const csv = Papa.unparse(dados as Record<string, unknown>[]);
  return csv;
};

// =============================================================
// EXPORTA EXCEL (múltiplas abas)
// =============================================================
export const generateXLSX = async (
  tabs: { title: string; sheetData: unknown[][] }[],
): Promise<string | undefined> => {
  if (!tabs || tabs.length === 0) {
    logger.error('Erro', 'Nenhuma aba para exportar');
    return;
  }

  const workbook = XLSX.utils.book_new();
  tabs.forEach(({ title, sheetData }) => {
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31));
  });

  const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
  return base64;
};
