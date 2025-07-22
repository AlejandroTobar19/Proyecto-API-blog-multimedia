import { Injectable } from '@nestjs/common';
import { Response } from 'express';
const PDFDocument = require('pdfkit');

import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class PdfService {
  generateCommentsReport(comments: Comment[], res: Response): void {
    const doc = new PDFDocument();

    // ✅ Forzar descarga del archivo PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="comments-report.pdf"');

    doc.pipe(res);

    // Título
    doc.fontSize(18).text('Reporte de Comentarios', { align: 'center' });
    doc.moveDown();

    if (comments.length === 0) {
      doc.fontSize(12).text('No hay comentarios disponibles.', { align: 'center' });
      doc.end();
      return;
    }

    comments.forEach((comment, index) => {
      doc
        .fontSize(14)
        .fillColor('black')
        .text(`Comentario #${index + 1}`, { underline: true });

      doc
        .fontSize(12)
        .fillColor('black')
        .text(`Autor: ${comment.author?.name ?? 'Anónimo'}`)
        .text(`Contenido: ${comment.content}`)
        .text(`Estado: ${comment.status}`)
        .text(`Moderado: ${comment.isModerated ? 'Sí' : 'No'}`)
        .text(`Creado: ${new Date(comment.createdAt).toLocaleString()}`)
        .moveDown();
    });

    doc.end();
  }
}
