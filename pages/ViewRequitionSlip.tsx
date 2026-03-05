import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Info,
  List,
  Loader,
  Printer,
  XCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Requisition, requisitionService } from '../src/services/requisitionService';
import { Language, useLanguage } from '../src/contexts/LanguageContext';

type SlipTranslation = {
  noRequisitionId: string;
  fetchFailed: string;
  pdfFailed: string;
  errorTitle: string;
  backToRequisitions: string;
  backToRequisition: string;
  documentPreview: string;
  printSlip: string;
  exporting: string;
  downloadPdf: string;
  officialRecord: string;
  refNo: string;
  date: string;
  generalInformation: string;
  subject: string;
  purpose: string;
  owner: string;
  requestor: string;
  description: string;
  materialsList: string;
  materialName: string;
  quantity: string;
  unit: string;
  noMaterialRows: string;
  unknownMaterial: string;
  authorizationStatus: string;
  authorizer: string;
  pendingAuthorization: string;
  evaluationDate: string;
  requestedDate: string;
  preparedBy: string;
  requestingOfficer: string;
  authorizedBy: string;
  warehouseDeptHead: string;
  created: string;
  updated: string;
  systemId: string;
  generatedFromSystem: string;
  materialRequisitionSlip: string;
  printHint: string;
  na: string;
  statusApproved: string;
  statusRejected: string;
  statusPending: string;
};

const slipTranslations: Record<Language, SlipTranslation> = {
  en: {
    noRequisitionId: 'No requisition ID provided.',
    fetchFailed: 'Failed to fetch requisition slip.',
    pdfFailed: 'Failed to generate PDF. Please try again.',
    errorTitle: 'Error',
    backToRequisitions: 'Back to Requisitions',
    backToRequisition: 'Back to Requisition',
    documentPreview: 'Document Preview',
    printSlip: 'PRINT SLIP',
    exporting: 'EXPORTING...',
    downloadPdf: 'DOWNLOAD PDF',
    officialRecord: 'OFFICIAL MATERIAL REQUEST RECORD',
    refNo: 'Ref No',
    date: 'Date',
    generalInformation: 'GENERAL INFORMATION',
    subject: 'Subject',
    purpose: 'Purpose',
    owner: 'Owner',
    requestor: 'Requestor',
    description: 'DESCRIPTION',
    materialsList: 'MATERIALS LIST',
    materialName: 'Material Name',
    quantity: 'Quantity',
    unit: 'Unit',
    noMaterialRows: 'No material rows found.',
    unknownMaterial: 'Unknown material',
    authorizationStatus: 'Authorization Status',
    authorizer: 'Authorizer',
    pendingAuthorization: 'Pending Authorization',
    evaluationDate: 'Evaluation Date',
    requestedDate: 'Requested Date',
    preparedBy: 'Prepared By',
    requestingOfficer: 'Requesting Officer',
    authorizedBy: 'Authorized By',
    warehouseDeptHead: 'Warehouse / Dept Head',
    created: 'Created',
    updated: 'Updated',
    systemId: 'System ID',
    generatedFromSystem: 'Generated from internal management system',
    materialRequisitionSlip: 'Material requisition slip',
    printHint: 'Standard A4 layout with multi-page material overflow support',
    na: 'N/A',
    statusApproved: 'APPROVED',
    statusRejected: 'REJECTED',
    statusPending: 'PENDING',
  },
  th: {
    noRequisitionId: 'ไม่พบรหัสใบขอวัสดุ',
    fetchFailed: 'ไม่สามารถโหลดใบส่งออกวัสดุได้',
    pdfFailed: 'ไม่สามารถสร้างไฟล์ PDF ได้ โปรดลองอีกครั้ง',
    errorTitle: 'ข้อผิดพลาด',
    backToRequisitions: 'กลับไปหน้ารายการใบขอวัสดุ',
    backToRequisition: 'กลับไปหน้าใบขอวัสดุ',
    documentPreview: 'ตัวอย่างเอกสาร',
    printSlip: 'พิมพ์เอกสาร',
    exporting: 'กำลังส่งออก...',
    downloadPdf: 'ดาวน์โหลด PDF',
    officialRecord: 'เอกสารคำขอวัสดุอย่างเป็นทางการ',
    refNo: 'เลขที่อ้างอิง',
    date: 'วันที่',
    generalInformation: 'ข้อมูลทั่วไป',
    subject: 'หัวข้อ',
    purpose: 'วัตถุประสงค์',
    owner: 'ผู้รับผิดชอบ',
    requestor: 'ผู้ขอ',
    description: 'รายละเอียด',
    materialsList: 'รายการวัสดุ',
    materialName: 'ชื่อวัสดุ',
    quantity: 'จำนวน',
    unit: 'หน่วย',
    noMaterialRows: 'ไม่พบรายการวัสดุ',
    unknownMaterial: 'ไม่ทราบชื่อวัสดุ',
    authorizationStatus: 'สถานะการอนุมัติ',
    authorizer: 'ผู้อนุมัติ',
    pendingAuthorization: 'รอการอนุมัติ',
    evaluationDate: 'วันที่อนุมัติ',
    requestedDate: 'วันที่ร้องขอ',
    preparedBy: 'จัดทำโดย',
    requestingOfficer: 'ผู้ยื่นคำขอ',
    authorizedBy: 'อนุมัติโดย',
    warehouseDeptHead: 'คลัง / หัวหน้าแผนก',
    created: 'สร้างเมื่อ',
    updated: 'อัปเดตเมื่อ',
    systemId: 'รหัสระบบ',
    generatedFromSystem: 'สร้างจากระบบจัดการภายใน',
    materialRequisitionSlip: 'ใบขอวัสดุ',
    printHint: 'รองรับกระดาษ A4 และการพิมพ์หลายหน้าสำหรับรายการที่ล้น',
    na: 'ไม่ระบุ',
    statusApproved: 'อนุมัติแล้ว',
    statusRejected: 'ไม่อนุมัติ',
    statusPending: 'รออนุมัติ',
  },
};

const getLocale = (language: Language) => (language === 'th' ? 'th-TH' : 'en-US');

const formatDate = (value: string | undefined, language: Language, fallback: string, withTime = false) => {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  if (withTime) {
    return date.toLocaleString(getLocale(language), {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString(getLocale(language), {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const getStatusMeta = (status: '-1' | '0' | '1', text: SlipTranslation) => {
  const normalized = String(status);

  if (normalized === '1') {
    return {
      label: text.statusApproved,
      toneClass: 'border-green-500 bg-green-50 text-green-700',
      icon: <CheckCircle2 size={18} />,
    };
  }

  if (normalized === '-1') {
    return {
      label: text.statusRejected,
      toneClass: 'border-red-500 bg-red-50 text-red-700',
      icon: <XCircle size={18} />,
    };
  }

  return {
    label: text.statusPending,
    toneClass: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    icon: <Clock3 size={18} />,
  };
};

const ViewRequitionSlip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const text = slipTranslations[language];

  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const slipRef = useRef<HTMLDivElement | null>(null);
  const finalChunkRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchRequisition = async () => {
      if (!id) {
        setError(text.noRequisitionId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await requisitionService.getRequisitionById(Number(id));
        setRequisition(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || text.fetchFailed);
      } finally {
        setLoading(false);
      }
    };

    fetchRequisition();
  }, [id]);

  const statusMeta = useMemo(() => {
    if (!requisition) return getStatusMeta('0', text);
    return getStatusMeta(requisition.status, text);
  }, [requisition, text]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!requisition || isExporting || !slipRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: slipRef.current.scrollWidth,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const pxToPdfRatio = imageHeight / canvas.height;
      const chunkStart = finalChunkRef.current ? finalChunkRef.current.offsetTop * pxToPdfRatio : null;
      const chunkHeight = finalChunkRef.current ? finalChunkRef.current.offsetHeight * pxToPdfRatio : null;
      const chunkEnd = chunkStart !== null && chunkHeight !== null ? chunkStart + chunkHeight : null;
      const chunkFitsOnOnePage = chunkHeight !== null ? chunkHeight <= pageHeight : false;

      let pageStart = 0;
      let pageIndex = 0;
      const epsilon = 0.5;

      while (pageStart < imageHeight - epsilon) {
        if (pageIndex > 0) {
          doc.addPage();
        }

        doc.addImage(image, 'PNG', 0, -pageStart, imageWidth, imageHeight, undefined, 'FAST');

        let nextPageStart = pageStart + pageHeight;

        if (
          chunkFitsOnOnePage &&
          chunkStart !== null &&
          chunkEnd !== null &&
          pageStart < chunkStart &&
          nextPageStart > chunkStart &&
          nextPageStart < chunkEnd
        ) {
          nextPageStart = chunkStart;
        }

        if (nextPageStart <= pageStart + epsilon) {
          nextPageStart = pageStart + pageHeight;
        }

        pageStart = nextPageStart;
        pageIndex += 1;
      }

      const safeRef = requisition.ref_no ? requisition.ref_no.replace(/[^a-zA-Z0-9-_]/g, '_') : 'requisition-slip';
      doc.save(`${safeRef}.pdf`);
    } catch (err) {
      setError(text.pdfFailed);
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error && !requisition) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-4 flex flex-col items-center gap-3">
          <AlertCircle size={40} />
          <h3 className="text-xl font-bold">{text.errorTitle}</h3>
          <span>{error}</span>
          <button
            onClick={() => navigate('/requisitions')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
          >
            {text.backToRequisitions}
          </button>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return null;
  }

  return (
    <div className="max-w-[980px] mx-auto flex flex-col gap-6 pb-14">
      <style>{`
        .wrap-overflow {
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 11mm;
          }

          aside,
          main > header {
            display: none !important;
          }

          main,
          main > div,
          .h-screen,
          .h-full,
          .overflow-hidden,
          .overflow-y-auto {
            height: auto !important;
            overflow: visible !important;
          }

          main > div {
            padding: 0 !important;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .avoid-break,
          .material-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .final-chunk {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .material-table thead {
            display: table-header-group !important;
          }

          .material-table tfoot {
            display: table-footer-group !important;
          }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/requisitions/view/${requisition.id}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-white hover:border-slate-500 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">{text.backToRequisition}</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-primary">
            <FileText size={17} />
            <h2 className="text-slate-100 text-sm font-bold uppercase tracking-wider">{text.documentPreview}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex cursor-pointer items-center justify-center rounded-lg h-9 bg-primary text-white gap-2 text-xs font-bold px-4 hover:bg-primary/90 transition-colors"
            onClick={handlePrint}
          >
            <Printer size={16} />
            {text.printSlip}
          </button>
          <button
            className="inline-flex cursor-pointer items-center justify-center rounded-lg h-9 bg-slate-200 text-slate-800 gap-2 text-xs font-bold px-3 hover:bg-slate-300 transition-colors disabled:opacity-60"
            onClick={handleDownloadPdf}
            disabled={isExporting}
          >
            {isExporting ? <Loader className="animate-spin" size={15} /> : <Download size={15} />}
            {isExporting ? text.exporting : text.downloadPdf}
          </button>
        </div>
      </div>

      <div ref={slipRef} className="print-container bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 pr-8 md:p-10 md:pr-14 lg:p-12 lg:pr-16 text-slate-900">
          <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-primary pb-6 mb-8 gap-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary p-2 rounded">
                  <svg className="size-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary wrap-overflow">MATERIAL EXPORT SLIP</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium tracking-wide wrap-overflow">{text.officialRecord}</p>
            </div>

            <div className="text-left md:text-right mt-2 md:mt-0">
              <div className="text-sm font-bold text-slate-900 wrap-overflow">
                {text.refNo}: <span className="text-primary">{requisition.ref_no}</span>
              </div>
              <div className="text-sm text-slate-500">{text.date}: {formatDate(requisition.form_date, language, text.na)}</div>
            </div>
          </div>

          <section className="mb-8">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info size={14} /> {text.generalInformation}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
              <div className="bg-white p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{text.subject}</p>
                <p className="text-sm font-semibold wrap-overflow">{requisition.subject || text.na}</p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{text.purpose}</p>
                <p className="text-sm font-semibold wrap-overflow">{requisition.purpose || text.na}</p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{text.owner}</p>
                <p className="text-sm font-semibold wrap-overflow">{requisition.owner?.fullname || text.na}</p>
              </div>
              <div className="bg-white p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{text.requestor}</p>
                <p className="text-sm font-semibold wrap-overflow">{requisition.creator?.fullname || text.na}</p>
                <p className="text-xs text-slate-500 mt-0.5 wrap-overflow">{requisition.creator?.position || text.na}</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText size={14} /> {text.description}
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded">
              <p className="text-sm leading-relaxed text-slate-700 italic whitespace-pre-wrap wrap-overflow">
                {requisition.description?.trim() || text.na}
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <List size={14} /> {text.materialsList}
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg pr-2">
              <table className="material-table w-full text-left text-sm border-collapse min-w-[560px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-200 w-12 text-center">#</th>
                    <th className="px-4 py-3 border-b border-slate-200">{text.materialName}</th>
                    <th className="px-4 py-3 border-b border-slate-200 text-right">{text.quantity}</th>
                    <th className="px-4 py-3 border-b border-slate-200">{text.unit}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requisition.mr_form_materials?.length > 0 ? (
                    requisition.mr_form_materials.map((item, index) => (
                      <tr key={item.id} className="material-row hover:bg-slate-50">
                        <td className="px-4 py-3 text-center text-slate-400">{String(index + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 wrap-overflow">{item.material?.title || text.unknownMaterial}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-slate-700 wrap-overflow">{item.material?.unit || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-4 text-center text-slate-500" colSpan={4}>
                        {text.noMaterialRows}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div ref={finalChunkRef} className="final-chunk">
            <section className="mb-10 avoid-break">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                    {statusMeta.icon}
                    {text.authorizationStatus}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusMeta.toneClass}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{text.authorizer}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1 wrap-overflow">
                        {requisition.authorizer?.fullname || text.pendingAuthorization}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{text.evaluationDate}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1 wrap-overflow">
                        {formatDate(requisition.evaluated_at, language, text.na, true)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{text.requestedDate}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1 wrap-overflow">
                        {formatDate(requisition.form_date, language, text.na)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-14 pt-8 border-t border-slate-100 avoid-break">
              <div className="text-center">
                <div className="border-t border-slate-900 pt-2 mt-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{text.preparedBy}</p>
                  <p className="text-[10px] text-slate-500 mt-1 wrap-overflow">{requisition.creator?.fullname || text.requestingOfficer}</p>
                </div>
              </div>

              <div className="text-center">
                <div className="border-t border-slate-900 pt-2 mt-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{text.authorizedBy}</p>
                  <p className="text-[10px] text-slate-500 mt-1 wrap-overflow">
                    {requisition.authorizer?.fullname || text.warehouseDeptHead}
                  </p>
                </div>
              </div>
            </section>

            <footer className="mt-12 pt-6 border-t border-slate-200 avoid-break">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 sm:px-5 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-600">
                    <div className="wrap-overflow">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 font-bold">{text.created}</p>
                      <p className="mt-1 font-semibold text-slate-700">{formatDate(requisition.created_at, language, text.na, true)}</p>
                    </div>
                    <div className="wrap-overflow">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 font-bold">{text.updated}</p>
                      <p className="mt-1 font-semibold text-slate-700">{formatDate(requisition.updated_at, language, text.na, true)}</p>
                    </div>
                  </div>

                  <div className="sm:text-right wrap-overflow">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 font-bold">{text.systemId}</p>
                    <p className="mt-1 text-xs font-black text-primary">{requisition.ref_no || `MR-${requisition.id}`}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[9px] uppercase tracking-[0.12em] text-slate-500">
                  <span className="wrap-overflow">{text.generatedFromSystem}</span>
                  <span className="wrap-overflow">{text.materialRequisitionSlip}</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <div className="no-print text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Printer size={14} />
        {text.printHint}
      </div>

      {error && requisition ? (
        <div className="no-print bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      ) : null}
    </div>
  );
};

export default ViewRequitionSlip;
