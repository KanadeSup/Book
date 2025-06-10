import * as pdfjs from 'pdfjs-dist';
import workerSrc from '@/assets/pdfjs/pdf.worker.min.mjs?url';


pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export  { pdfjs }