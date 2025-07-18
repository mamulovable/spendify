import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    FileSpreadsheet,
    FileImage,
    Scan,
    BarChart4,
    Sparkles
} from 'lucide-react';

// Define the processing stages
const PROCESSING_STAGES = [
    { id: 'upload', name: 'Upload', icon: Upload },
    { id: 'scanning', name: 'Scanning', icon: Scan },
    { id: 'processing', name: 'Processing', icon: FileSpreadsheet },
    { id: 'analysis', name: 'Analysis', icon: BarChart4 },
    { id: 'complete', name: 'Complete', icon: CheckCircle2 },
];

// Sample document types
const DOCUMENT_TYPES = [
    { id: 'receipt', name: 'Receipt', icon: FileText },
    { id: 'bank_statement', name: 'Bank Statement', icon: FileSpreadsheet },
    { id: 'invoice', name: 'Invoice', icon: FileImage },
];

// Sample document data
const SAMPLE_DOCUMENT = {
    type: 'receipt',
    name: 'Grocery_Receipt.jpg',
    date: '2025-07-15',
    size: '1.2 MB',
    preview: '/receipt-example.svg', // Using receipt example image
};
// Define types for extracted data
type Field = {
    name: string;
    value: string;
    confidence: number;
};

type Category = {
    name: string;
    amount: number;
    percentage: number;
};

type Summary = {
    totalItems: number;
    totalAmount: number;
    primaryCategory: string;
    budgetImpact: string;
};

type ScanningData = {
    progress: number;
    message: string;
    details: string;
};

type ProcessingData = ScanningData & {
    fields: Field[];
};

type AnalysisData = ScanningData & {
    categories: Category[];
};

type CompleteData = ScanningData & {
    summary: Summary;
};

type ExtractedDataType = {
    scanning: ScanningData;
    processing: ProcessingData;
    analysis: AnalysisData;
    complete: CompleteData;
};

// Sample extracted data based on stage
const EXTRACTED_DATA: ExtractedDataType = {
    scanning: {
        progress: 35,
        message: 'Scanning document...',
        details: 'Identifying document type and orientation',
    },
    processing: {
        progress: 65,
        message: 'Extracting data...',
        details: 'Reading text and identifying key fields',
        fields: [
            { name: 'Merchant', value: 'Whole Foods Market', confidence: 98 },
            { name: 'Date', value: '2025-07-15', confidence: 95 },
            { name: 'Total', value: '$87.42', confidence: 99 },
        ],
    },
    analysis: {
        progress: 85,
        message: 'Analyzing transactions...',
        details: 'Categorizing items and matching to budget',
        categories: [
            { name: 'Groceries', amount: 65.18, percentage: 74.6 },
            { name: 'Household', amount: 12.99, percentage: 14.9 },
            { name: 'Personal Care', amount: 9.25, percentage: 10.5 },
        ],
    },
    complete: {
        progress: 100,
        message: 'Processing complete!',
        details: 'All data extracted and categorized',
        summary: {
            totalItems: 14,
            totalAmount: 87.42,
            primaryCategory: 'Groceries',
            budgetImpact: 'Within monthly grocery budget (74% used)',
        },
    },
};

/**
 * DocumentProcessingDemo Component
 * 
 * An interactive simulation of the document processing feature
 * that demonstrates the multi-stage processing workflow.
 */
const DocumentProcessingDemo = () => {
    const [stage, setStage] = useState('upload');
    const [documentType, setDocumentType] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [autoProgress, setAutoProgress] = useState(false);

    // Handle stage transition animations
    useEffect(() => {
        if (stage !== 'upload') {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    // Auto-progress through stages for demo purposes
    useEffect(() => {
        if (autoProgress && stage !== 'complete') {
            const nextStageIndex = PROCESSING_STAGES.findIndex(s => s.id === stage) + 1;

            if (nextStageIndex < PROCESSING_STAGES.length) {
                const timer = setTimeout(() => {
                    setStage(PROCESSING_STAGES[nextStageIndex].id);
                }, 3000); // Progress every 3 seconds

                return () => clearTimeout(timer);
            }
        }
    }, [stage, autoProgress]);

    // Handle document selection
    const handleSelectDocument = (type: string) => {
        setDocumentType(type);
        // Start auto-progress after document selection
        setTimeout(() => {
            setStage('scanning');
            setAutoProgress(true);
        }, 500);
    };

    // Handle manual stage change
    const handleStageChange = (newStage: string) => {
        setAutoProgress(false);
        setStage(newStage);
    };

    // Get current stage data
    const currentStageIndex = PROCESSING_STAGES.findIndex(s => s.id === stage);
    const currentStage = PROCESSING_STAGES[currentStageIndex];
    const extractedData = EXTRACTED_DATA[stage as keyof typeof EXTRACTED_DATA];

    // Determine if we can show the document preview
    const showPreview = stage !== 'upload' || documentType !== null;

    return (
        <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium">Document Processing</h3>

                    {stage !== 'upload' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-xs text-primary font-medium">Premium</span>
                        </div>
                    )}
                </div>

                {/* Processing Stages Indicator */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        {PROCESSING_STAGES.map((s, index) => (
                            <div
                                key={s.id}
                                className={cn(
                                    "flex flex-col items-center relative",
                                    index <= currentStageIndex ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <div
                                    className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300",
                                        index < currentStageIndex ? "bg-primary text-primary-foreground" :
                                            index === currentStageIndex ? "bg-primary/20 text-primary border border-primary" :
                                                "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {index < currentStageIndex ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <s.icon className="h-4 w-4" />
                                    )}
                                </div>
                                <span className="text-xs font-medium">{s.name}</span>

                                {/* Connector line between stages */}
                                {index < PROCESSING_STAGES.length - 1 && (
                                    <div
                                        className={cn(
                                            "absolute top-4 left-[calc(100%_-_8px)] h-[2px] w-[calc(100%_-_8px)]",
                                            index < currentStageIndex ? "bg-primary" : "bg-muted"
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {stage !== 'upload' && (
                        <Progress
                            value={extractedData?.progress || 0}
                            className="h-1 mt-2"
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document Preview Section */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Document Preview</h4>

                        {showPreview ? (
                            <div
                                className={cn(
                                    "border border-border rounded-lg overflow-hidden transition-all duration-300",
                                    isAnimating ? "opacity-50" : "opacity-100"
                                )}
                            >
                                <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-sm font-medium">{SAMPLE_DOCUMENT.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{SAMPLE_DOCUMENT.size}</span>
                                </div>

                                <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center p-4">
                                    <img
                                        src={SAMPLE_DOCUMENT.preview}
                                        alt="Document preview"
                                        className={cn(
                                            "max-h-full max-w-full object-contain transition-all duration-500",
                                            stage === 'scanning' ? "filter blur-sm" : "",
                                            stage === 'processing' ? "filter brightness-110" : "",
                                            stage === 'analysis' || stage === 'complete' ? "filter contrast-105 brightness-105" : ""
                                        )}
                                    />

                                    {stage === 'scanning' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <div className="animate-pulse">
                                                <Scan className="h-8 w-8 text-primary" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-muted/50 p-3 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-xs text-muted-foreground mr-2">Date:</span>
                                            <span className="text-xs">{SAMPLE_DOCUMENT.date}</span>
                                        </div>

                                        {stage !== 'upload' && stage !== 'scanning' && (
                                            <div className="flex items-center">
                                                <span className="text-xs text-muted-foreground mr-2">Status:</span>
                                                <span className="text-xs flex items-center">
                                                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                                                    Verified
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h5 className="text-sm font-medium mb-1">Upload a document</h5>
                                <p className="text-xs text-muted-foreground mb-4">Select a document type to begin</p>

                                <div className="grid grid-cols-3 gap-2 w-full">
                                    {DOCUMENT_TYPES.map((type) => (
                                        <Button
                                            key={type.id}
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "flex flex-col h-auto py-3",
                                                documentType === type.id && "border-primary bg-primary/5"
                                            )}
                                            onClick={() => handleSelectDocument(type.id)}
                                        >
                                            <type.icon className="h-4 w-4 mb-1" />
                                            <span className="text-xs">{type.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Processing Results Section */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Processing Results</h4>

                        <div
                            className={cn(
                                "border border-border rounded-lg overflow-hidden transition-all duration-300",
                                isAnimating ? "opacity-50 transform translate-y-2" : "opacity-100 transform translate-y-0"
                            )}
                        >
                            {stage === 'upload' ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                    <h5 className="text-sm font-medium mb-1">No document processed</h5>
                                    <p className="text-xs text-muted-foreground">
                                        Select a document type from the left panel to start processing
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-muted/50 p-3 border-b border-border">
                                        <h5 className="font-medium text-sm">{extractedData.message}</h5>
                                        <p className="text-xs text-muted-foreground">{extractedData.details}</p>
                                    </div>

                                    <div className="p-4">
                                        {stage === 'scanning' && (
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <div className="animate-spin mb-4">
                                                    <Scan className="h-8 w-8 text-primary" />
                                                </div>
                                                <p className="text-sm">Scanning document contents...</p>
                                            </div>
                                        )}

                                        {stage === 'processing' && (
                                            <div className="space-y-3">
                                                <p className="text-xs font-medium">Extracted Fields:</p>
                                                {extractedData.fields?.map((field, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                                                <ChevronRight className="h-3 w-3 text-primary" />
                                                            </div>
                                                            <span className="text-sm">{field.name}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-sm font-medium mr-2">{field.value}</span>
                                                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                                                {field.confidence}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {stage === 'analysis' && (
                                            <div className="space-y-3">
                                                <p className="text-xs font-medium">Category Breakdown:</p>
                                                {extractedData.categories?.map((category, index) => (
                                                    <div key={index} className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">{category.name}</span>
                                                            <span className="text-sm font-medium">${category.amount.toFixed(2)}</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary rounded-full"
                                                                style={{ width: `${category.percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <span className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {stage === 'complete' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Total Items:</span>
                                                        <span className="text-sm font-medium">{extractedData.summary?.totalItems}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Total Amount:</span>
                                                        <span className="text-sm font-medium">${extractedData.summary?.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Primary Category:</span>
                                                        <span className="text-sm font-medium">{extractedData.summary?.primaryCategory}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Budget Impact:</span>
                                                        <span className="text-sm font-medium text-green-600">{extractedData.summary?.budgetImpact}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2 flex justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs"
                                                        onClick={() => {
                                                            setStage('upload');
                                                            setDocumentType(null);
                                                            setAutoProgress(false);
                                                        }}
                                                    >
                                                        Process Another Document
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default DocumentProcessingDemo;