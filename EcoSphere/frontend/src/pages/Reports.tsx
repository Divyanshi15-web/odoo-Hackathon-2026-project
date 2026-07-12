import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, FileSpreadsheet, FileBarChart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

const Reports = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      if (reportType === 'carbon') {
        const res = await api.get('/carbon/transactions');
        setData(res.data);
      } else if (reportType === 'csr') {
        const res = await api.get('/csr/activities');
        setData(res.data);
      } else if (reportType === 'audits') {
        const res = await api.get('/audits');
        setData(res.data);
      } else {
        // Summary
        const [carbon, csr, audits] = await Promise.all([
          api.get('/carbon/transactions'),
          api.get('/csr/activities'),
          api.get('/audits')
        ]);
        setData({ carbon: carbon.data, csr: csr.data, audits: audits.data });
      }
    } catch (error) {
      toast.error('Failed to load report data');
    }
  };

  const getTableData = () => {
    if (!data) return { head: [], body: [] };
    
    if (reportType === 'carbon') {
      return {
        head: [['Date', 'Source', 'Department', 'Amount', 'CO2 (kg)']],
        body: data.map((t: any) => [
          new Date(t.date).toLocaleDateString(),
          t.emissionFactor.source,
          t.department.name,
          t.amount,
          (t.amount * t.emissionFactor.co2Equivalent).toFixed(2)
        ])
      };
    } else if (reportType === 'csr') {
      return {
        head: [['Date', 'Activity', 'Category', 'Participants']],
        body: data.map((a: any) => [
          new Date(a.date).toLocaleDateString(),
          a.title,
          a.category,
          a.participations?.length || 0
        ])
      };
    } else if (reportType === 'audits') {
      return {
        head: [['Date', 'Title', 'Auditor', 'Status']],
        body: data.map((a: any) => [
          new Date(a.auditDate).toLocaleDateString(),
          a.title,
          `${a.auditor.firstName} ${a.auditor.lastName}`,
          a.status
        ])
      };
    } else {
      // Summary - simple stats table
      return {
        head: [['Metric', 'Value']],
        body: [
          ['Total Carbon Records', data.carbon.length],
          ['Total CSR Activities', data.csr.length],
          ['Total Audits', data.audits.length]
        ]
      };
    }
  };

  const exportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.text(`EcoSphere - ${reportType.toUpperCase()} Report`, 14, 15);
      const { head, body } = getTableData();
      
      (doc as any).autoTable({
        startY: 25,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] } // emerald-500
      });

      doc.save(`ecosphere_${reportType}_report.pdf`);
      toast.success('PDF Exported Successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = () => {
    setIsExporting(true);
    try {
      const { head, body } = getTableData();
      const ws = XLSX.utils.aoa_to_sheet([...head, ...body]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `ecosphere_${reportType}_report.xlsx`);
      toast.success('Excel Exported Successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = () => {
    setIsExporting(true);
    try {
      const { head, body } = getTableData();
      const csvContent = "data:text/csv;charset=utf-8," 
        + head[0].join(",") + "\n"
        + body.map((row: any) => row.join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ecosphere_${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV Exported Successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reporting Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Select Report</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setReportType('summary')}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${reportType === 'summary' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}`}
              >
                <FileBarChart size={20} /> <span className="font-medium">ESG Summary</span>
              </button>
              <button 
                onClick={() => setReportType('carbon')}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${reportType === 'carbon' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}`}
              >
                <FileText size={20} /> <span className="font-medium">Carbon Emissions</span>
              </button>
              <button 
                onClick={() => setReportType('csr')}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${reportType === 'csr' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}`}
              >
                <FileText size={20} /> <span className="font-medium">Social & CSR</span>
              </button>
              <button 
                onClick={() => setReportType('audits')}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${reportType === 'audits' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}`}
              >
                <FileText size={20} /> <span className="font-medium">Governance Audits</span>
              </button>
            </div>
          </div>
        </div>

        {/* Export Panel */}
        <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
          {!data ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="animate-spin text-emerald-500" size={48} />
              <p className="text-gray-500">Preparing Report Data...</p>
            </div>
          ) : (
            <div className="text-center space-y-8 w-full max-w-lg">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-full inline-block">
                <FileText size={64} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{reportType} Report Ready</h2>
                <p className="text-gray-500 mt-2">Your report contains {getTableData().body.length} records. Select an export format below.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={exportPDF} 
                  disabled={isExporting}
                  className="flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <Download size={20} /> <span>PDF</span>
                </button>
                <button 
                  onClick={exportExcel} 
                  disabled={isExporting}
                  className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <FileSpreadsheet size={20} /> <span>Excel</span>
                </button>
                <button 
                  onClick={exportCSV} 
                  disabled={isExporting}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <FileText size={20} /> <span>CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Reports;
