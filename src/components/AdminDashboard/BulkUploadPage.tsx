'use client';

import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notification';

interface BulkUploadPageProps {
  onUpdate: () => void;
}

interface UploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

const BulkUploadPage: React.FC<BulkUploadPageProps> = ({ onUpdate }) => {
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      addNotification('error', 'Invalid File Type', 'Please select an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addNotification('error', 'File Too Large', 'Please select a file smaller than 10MB');
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const downloadDemoExcel = async () => {
    try {
      const response = await fetch('/api/admin/download-demo-excel');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'endpoint_users_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addNotification('success', 'Download Complete', 'Demo Excel template downloaded successfully');
      } else {
        throw new Error('Failed to download demo file');
      }
    } catch (error) {
      console.error('Error downloading demo file:', error);
      addNotification('error', 'Download Failed', 'Failed to download demo Excel template');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      
      const adminData = localStorage.getItem('adminUser');
      if (!adminData) {
        throw new Error('Admin user not found');
      }
      
      const admin = JSON.parse(adminData);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('organizationId', admin.organization_id);

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: UploadResult = await response.json();
        setUploadResult(result);
        
        if (result.success) {
          addNotification('success', 'Upload Complete', 
            `Successfully uploaded ${result.successCount} endpoint users`);
          onUpdate(); // Update dashboard counts
          setSelectedFile(null);
        } else {
          addNotification('warning', 'Upload Completed with Errors', 
            `${result.successCount} successful, ${result.errorCount} failed`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      addNotification('error', 'Upload Failed', 
        error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold text-white">Bulk Upload</h1>
        <p className="text-gray-400">Upload multiple endpoint users via Excel or CSV file</p>
        <div className='flex justify-end -mt-11'>
        <Button
            onClick={downloadDemoExcel}
            className="flex items-center gap-2 px-6 py-3 text-green-300 border bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/30"
          >
            <Download className="w-5 h-5" />
            Download Demo Excel
          </Button>
        </div>
      </div>
      {/* <div className="p-6 border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Demo Excel Template</h3>
            <p className="text-gray-400">Download a sample Excel file with the correct format and example data</p>
          </div>
          <Button
            onClick={downloadDemoExcel}
            className="flex items-center gap-2 px-6 py-3 text-green-300 border bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/30"
          >
            <Download className="w-5 h-5" />
            Download Demo Excel
          </Button>
        </div>
      </div> */}

      {/* Instructions */}
      <div className="p-6 border bg-blue-500/10 backdrop-blur-sm border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Upload Instructions</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Download the demo Excel template to see the required format</li>
              <li>• Required columns: full_name, email, phone_number, operating_system, os_version, ip_address, mac_address</li>
              <li>• All uploaded users will be automatically approved</li>
              <li>• Supported formats: .xlsx, .xls, .csv (max 10MB)</li>
              <li>• Duplicate emails will be skipped</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Download */}

      {/* File Upload */}
      <div className="p-6 border bg-white/5 backdrop-blur-sm border-white/10 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">Upload Excel File</h3>
        
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragOver
              ? 'border-purple-500/50 bg-purple-500/5'
              : 'border-white/20 hover:border-white/30'
          }`}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <FileSpreadsheet className="w-16 h-16 mx-auto text-green-400" />
              <div>
                <p className="text-lg font-medium text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-2 text-purple-300 border bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 hover:border-purple-500/30 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload File
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="px-4 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 disabled:opacity-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-16 h-16 mx-auto text-gray-400" />
              <div>
                <p className="mb-2 text-lg font-medium text-white">
                  Drop your Excel file here or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Supports .xlsx, .xls, and .csv files up to 10MB
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 text-white border bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30"
              >
                Select File
              </Button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className={`backdrop-blur-sm border rounded-xl p-6 ${
          uploadResult.success 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-yellow-500/10 border-yellow-500/20'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${
              uploadResult.success ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              {uploadResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                uploadResult.success ? 'text-green-300' : 'text-yellow-300'
              }`}>
                Upload {uploadResult.success ? 'Completed' : 'Completed with Issues'}
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                <div className="p-3 text-center rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-white">{uploadResult.totalRows}</div>
                  <div className="text-sm text-gray-400">Total Rows</div>
                </div>
                <div className="p-3 text-center rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-300">{uploadResult.successCount}</div>
                  <div className="text-sm text-gray-400">Successful</div>
                </div>
                <div className="p-3 text-center rounded-lg bg-red-500/10">
                  <div className="text-2xl font-bold text-red-300">{uploadResult.errorCount}</div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-white">Errors:</h4>
                  <div className="space-y-1 overflow-y-auto max-h-40">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="p-2 text-sm text-red-300 rounded bg-red-500/10">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadPage;
