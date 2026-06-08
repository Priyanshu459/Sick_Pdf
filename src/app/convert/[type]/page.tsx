import { Metadata } from 'next';
import ConvertClient from './ConvertClient';

const TYPE_CONFIG = {
  'word-to-pdf': { title: 'Word to PDF - Convert DOC to PDF online', description: 'Make DOC and DOCX files easy to read by converting them to PDF.' },
  'excel-to-pdf': { title: 'Excel to PDF - Convert XLS to PDF online', description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.' },
  'ppt-to-pdf': { title: 'PowerPoint to PDF - Convert PPT to PDF online', description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.' },
  'pdf-to-word': { title: 'PDF to Word - Convert PDF to DOC online', description: 'Convert your PDF to WORD documents with incredible accuracy.' },
  'pdf-to-excel': { title: 'PDF to Excel - Convert PDF to XLS online', description: 'Convert PDF Data to EXCEL Spreadsheets.' },
  'pdf-to-ppt': { title: 'PDF to PowerPoint - Convert PDF to PPT online', description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.' },
  'pdf-to-jpg': { title: 'PDF to JPG - Convert PDF to images online', description: 'Extract pages from your PDF file and save them as high-quality JPG images.' },
};

type Props = {
  params: Promise<{ type: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || {
    title: 'Convert PDF Online',
    description: 'Convert files to and from PDF.',
  };

  return {
    title: config.title,
    description: config.description,
  };
}

export default function GenericConvertPage() {
  return <ConvertClient />;
}
