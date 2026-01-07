import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは「損保GPT」です。車を売却したユーザーの保険・手続きを整理してサポートするアシスタントです。

【重要な姿勢】
- 売り込みは一切しない
- 「整理」と「代行」に徹する
- ユーザーの不安を解消することが最優先
- 専門用語は避け、分かりやすく説明する

【対応範囲】
- 自動車保険の解約・切替の整理
- 必要な手続きの案内
- 次の車の保険について
- 事故対応中の場合のサポート

【返答スタイル】
- 簡潔で分かりやすく
- 具体的な次のステップを提示
- 不明点は確認を求める`;

export async function POST(request: NextRequest) {
  try {
    const { messages, surveyData } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "APIキーが設定されていません" },
        { status: 500 }
      );
    }

    // Build context from survey data
    let contextMessage = "";
    if (surveyData) {
      const answersText = Object.entries(surveyData.answers || {})
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n");

      const userType = surveyData.type === "seller" ? "車売却完了者" : "お問い合わせ";
      contextMessage = `\n【ユーザー情報（アンケート回答）】\n${userType}\n${answersText}`;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://sonpo-gpt.vercel.app",
          "X-Title": "SonpoGPT",
        },
        body: JSON.stringify({
          model: "xiaomi/mimo-v2-flash:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + contextMessage },
            ...messages,
          ],
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return NextResponse.json(
        { error: "AIとの通信に失敗しました" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      message: data.choices[0]?.message?.content || "応答がありませんでした",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
