import { GoogleGenAI } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('ファイルのBase64文字列への読み込みに失敗しました。'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeImage = async (imageFile: File, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY 環境変数が設定されていません。設定を確認してください。");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const base64Data = await fileToBase64(imageFile);
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: imageFile.type,
      },
    };

    const textPart = {
      text: prompt,
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;

  } catch (error) {
    console.error("Error in Gemini API call:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini APIエラー: ${error.message}`);
    }
    throw new Error("Gemini APIの呼び出し中に不明なエラーが発生しました。");
  }
};