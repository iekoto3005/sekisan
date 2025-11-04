import { GoogleGenAI, Type } from "@google/genai";
import { PlanData } from '../types';

// Tell TypeScript that pdfjsLib is a global variable loaded from the script tag.
declare const pdfjsLib: any;

// This function ensures the PDF.js worker is configured.
// It is called lazily, just before it's needed, to avoid race conditions
// with the script that loads pdf.js.
const setupPdfJsWorker = () => {
    // Check if the library is loaded and the worker is not already configured.
    // It's safe to re-set the workerSrc property.
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
    }
};


/**
 * Converts the first page of a PDF file to a base64 encoded JPEG image.
 * @param file The PDF file to convert.
 * @returns A promise that resolves to an object containing the base64 data and mime type.
 */
const convertPdfToImageBase64 = async (file: File, onProgress: (p: number) => void): Promise<{ base64Data: string; mimeType: string; }> => {
  setupPdfJsWorker(); // Attempt to configure the worker.
  
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.jsライブラリが読み込まれていません。');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  onProgress(10);
  const page = await pdf.getPage(1); // Get the first page
  onProgress(15);

  const viewport = page.getViewport({ scale: 1.5 }); // Use a moderate scale to balance quality and size

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (!context) {
    throw new Error('Canvasコンテキストの取得に失敗しました。');
  }

  await page.render({ canvasContext: context, viewport: viewport }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92); // Use JPEG with high quality, slightly reduced to manage size

  return {
    base64Data: dataUrl.split(',')[1],
    mimeType: 'image/jpeg',
  };
};

export const generatePdfPreviewUrl = async (file: File): Promise<string> => {
    setupPdfJsWorker(); // Attempt to configure the worker.

    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.jsライブラリが読み込まれていません。');
    }
  
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
  
    const viewport = page.getViewport({ scale: 1.5 }); // Keep consistent with API conversion
  
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
  
    if (!context) {
      throw new Error('Canvasコンテキストの取得に失敗しました。');
    }
  
    await page.render({ canvasContext: context, viewport: viewport }).promise;
  
    return canvas.toDataURL('image/jpeg', 0.92); // Keep consistent with API conversion
  };


export const analyzeImage = async (planFile: File, onProgress: (p: number) => void): Promise<PlanData> => {
  // FIX: Per coding guidelines, use process.env.API_KEY instead of import.meta.env.VITE_API_KEY. This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
  if (!process.env.API_KEY) {
    throw new Error("API_KEY 環境変数が設定されていません。設定を確認してください。");
  }

  if (planFile.type !== 'application/pdf') {
    throw new Error('PDFファイルを選択してください。');
  }

  onProgress(5);
  // FIX: Per coding guidelines, use process.env.API_KEY to initialize GoogleGenAI.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema = {
    type: Type.OBJECT,
    properties: {
      物件名: { type: Type.STRING, description: "物件の名称" },
      階数: { type: Type.STRING, description: "建物の階数（例：地上2階、地下1階）" },
      階高: { type: Type.STRING, description: "3階建て以上の場合の各階の高さ(単位:㎜)。2階建て以下の場合は不要。（例：1階:3000㎜, 2階:2850㎜, 3階:2850㎜）" },
      建築面積: { type: Type.STRING, description: "建築面積（単位を含む, 例: 100㎡）" },
      延床面積: { type: Type.STRING, description: "延床面積（単位を含む, 例: 150㎡）" },
      外壁面積: { type: Type.STRING, description: "平面図の外周と立面図の高さから計算した外壁の総面積（単位を含む, 例: 200㎡）" },
      キッチン数: { type: Type.STRING, description: "キッチンの数（例: 1）" },
      洗面台数: { type: Type.STRING, description: "洗面台の数（例: 2）" },
      トイレ数: { type: Type.STRING, description: "トイレの数（例: 2）" },
    },
    required: ["物件名", "階数", "建築面積", "延床面積", "外壁面積", "キッチン数", "洗面台数", "トイレ数"]
  };

  let progressInterval: ReturnType<typeof setInterval> | undefined;

  try {
    // PDF conversion will take up the progress from 5% to 20%
    const { base64Data, mimeType } = await convertPdfToImageBase64(planFile, onProgress);
    onProgress(20);

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: `この建築図面から以下の情報を抽出し、指定されたJSON形式で回答してください。
情報が見つからない場合は「不明」と記入してください。

計算ルール:
- 外壁面積: 平面図の外周長さと立面図を基に階高を計測または推定して計算してください。
- 階高の基準(単位は㎜):
  - 平屋: 3000㎜
  - 2階建て: 1階は3000㎜, 2階は2850㎜
- 上記を基準とし、図面に階高の記載があればそちらを優先してください。単位は㎜で回答してください。

出力項目:
- 3階建て以上の場合のみ、「階高」の項目を追加し、図面から読み取れる情報を記載してください。`,
    };
    
    // Simulate progress during the API call, which is the longest part
    let progress = 20;
    progressInterval = setInterval(() => {
        if (progress < 98) {
            progress += 1;
            onProgress(progress);
        } else {
            if (progressInterval) clearInterval(progressInterval);
        }
    }, 400); // Increment every 400ms (even slower to better match API time)

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [imagePart, textPart] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0,
        },
    });
    
    if (progressInterval) clearInterval(progressInterval);
    onProgress(99);

    const jsonString = response.text.trim();
    const cleanedJsonString = jsonString.replace(/^` + "```" + `json\s*|` + "```" + `$/g, '');
    const parsedResult = JSON.parse(cleanedJsonString);
    onProgress(100);
    return parsedResult as PlanData;

  } catch (error) {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    console.error("Error in PDF processing or Gemini API call:", error);
    if (error instanceof Error) {
        if (error.name === 'SyntaxError') {
          throw new Error(`Gemini APIから無効なJSON応答がありました。`);
        }
        throw new Error(`プランの処理中にエラーが発生しました: ${error.message}`);
    }
    throw new Error("プランの処理中に不明なエラーが発生しました。");
  }
};