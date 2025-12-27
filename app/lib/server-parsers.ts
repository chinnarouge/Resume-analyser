import 'server-only';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

export async function parsePDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true); // true = don't combine text items

        pdfParser.on('pdfParser_dataError', (errData: any) => {
            console.error('Error parsing PDF:', errData.parserError);
            reject(new Error('Failed to parse PDF file'));
        });

        pdfParser.on('pdfParser_dataReady', () => {
            try {
                // Use pdf2json's built-in text extraction
                const rawText = pdfParser.getRawTextContent();
                resolve(rawText);
            } catch (error) {
                console.error('Text extraction error:', error);
                // Fallback: return empty string rather than failing
                resolve('');
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}

export async function parseDocx(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse Word document');
    }
}
