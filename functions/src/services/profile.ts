import { db } from "../config.js";
import { fetchWithTimeout, recordAuxiliaryAiUsage } from './aiControl.js';

const PROFILE_MODEL = 'gemini-3.1-flash-lite';
const boundedProfileItems = (value: unknown): string[] => Array.isArray(value)
  ? value.map(item => String(item).trim().slice(0, 160)).filter(Boolean).slice(-50)
  : [];

export async function updateStudentProfile(
  uid: string,
  subjectId: string,
  userMessage: string,
  assistantMessage: string,
  currentProfile: any,
  apiKey: string
): Promise<void> {
  const subProfile = currentProfile?.[subjectId] || {};
  let oldStrengths = boundedProfileItems(subProfile.strengths);
  let oldWeaknesses = boundedProfileItems(subProfile.weaknesses);
  let oldSummary: string = String(subProfile.learningSummary || '').slice(0, 1000);

  // Tự động di trú dữ liệu cũ từ cấu trúc phẳng sang cấu trúc môn học mới
  if (!currentProfile?.[subjectId] && subjectId === "math") {
    if (currentProfile?.strengths) oldStrengths = boundedProfileItems(currentProfile.strengths);
    if (currentProfile?.weaknesses) oldWeaknesses = boundedProfileItems(currentProfile.weaknesses);
    if (currentProfile?.learningSummary) oldSummary = String(currentProfile.learningSummary).slice(0, 1000);
  }

  const subjectNameMap: Record<string, string> = {
    math: "Toán",
    english: "Tiếng Anh",
    chemistry: "Hóa học",
    biology: "Sinh học",
    physics: "Vật lý",
  };
  const subjectName = subjectNameMap[subjectId] || subjectId;

  const prompt = `Bạn là một chuyên gia tâm lý giáo dục và chẩn đoán năng lực học sinh ôn thi lớp 10 môn ${subjectName}.
Nhiệm vụ của bạn là: Đọc lượt hội thoại cuối cùng dưới đây giữa Học sinh và Gia sư AI, đối chiếu với Hồ sơ cũ của học sinh, và trích xuất thêm các điểm mạnh mới, điểm yếu/lỗi sai mới, cũng như cập nhật lại câu tóm tắt tiến trình học tập của học sinh.

Hội thoại cuối cùng:
- Học sinh: "${userMessage}"
- Gia sư AI: "${assistantMessage}"

Hồ sơ cũ của học sinh môn ${subjectName}:
- Điểm mạnh cũ: ${oldStrengths.length > 0 ? JSON.stringify(oldStrengths) : "(Không có)"}
- Điểm yếu/Lỗi sai cũ: ${oldWeaknesses.length > 0 ? JSON.stringify(oldWeaknesses) : "(Không có)"}
- Tóm tắt cũ: "${oldSummary || "(Không có)"}"

Yêu cầu trích xuất:
1. Điểm mạnh mới (newStrengths): Chỉ ghi nhận khi học sinh tự giải đúng bài tập, hiểu bài nhanh, áp dụng đúng công thức, hoặc biết liên kết các kiến thức khó.
2. Điểm yếu mới (newWeaknesses): Ghi nhận khi học sinh tính toán sai số học, quên điều kiện áp dụng, áp dụng sai công thức, nhầm lẫn khái niệm, hoặc thể hiện sự lúng túng ở một phần kiến thức cụ thể.
3. Tóm tắt mới (learningSummary): Viết lại 1 câu duy nhất (dưới 30 từ) tóm tắt toàn bộ tiến trình năng lực hiện tại của học sinh sau lượt hội thoại này.
4. Chỉ ghi nhận các điểm mạnh/yếu THỰC SỰ NỔI BẬT và MỚI (không trùng lặp ngữ nghĩa với Hồ sơ cũ). Mỗi ý chỉ viết từ 3-7 từ ngắn gọn (ví dụ: "Quên đk delta >= 0", "Nhầm dấu công thức Vi-ét").
5. Trả về kết quả dưới dạng cấu trúc JSON sạch, không bọc trong markdown (không dùng \`\`\`json ... \`\`\`), có dạng:
{
  "newStrengths": ["...", "..."],
  "newWeaknesses": ["...", "..."],
  "learningSummary": "..."
}

Kết quả JSON:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
  try {
    const startedAt = Date.now();
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }, 15_000);

    if (!response.ok) {
      console.warn("LLM updateStudentProfile trả về lỗi HTTP:", response.status);
      return;
    }

    const data = (await response.json()) as any;
    if (data?.usageMetadata) {
      await recordAuxiliaryAiUsage(`profile-${uid}-${Date.now()}`, uid, 'diagnose', 'gemini', PROFILE_MODEL, data.usageMetadata, Date.now() - startedAt);
    }
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Clean JSON wrappers if any
    if (rawText.startsWith("```")) {
      rawText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
    }

    const parsed = JSON.parse(rawText);
    const { newStrengths = [], newWeaknesses = [], learningSummary = "" } = parsed;

    // Merge strengths and weaknesses (remove duplicates and empty values)
    const mergeAndUnique = (oldArr: string[], newArr: any[]) => {
      const combined = [...oldArr, ...newArr.map((s) => String(s).trim().slice(0, 160))].filter(Boolean);
      return [...new Set(combined)].slice(-50);
    };

    const updatedStrengths = mergeAndUnique(oldStrengths, newStrengths);
    const updatedWeaknesses = mergeAndUnique(oldWeaknesses, newWeaknesses);
    const finalSummary = String(learningSummary || oldSummary).slice(0, 1000);

    // Cập nhật lên Firestore
    await db.collection("student_profiles").doc(uid).set(
      {
        [subjectId]: {
          strengths: updatedStrengths,
          weaknesses: updatedWeaknesses,
          learningSummary: finalSummary,
          lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    console.log(
      `[Memory] Updated student profile (${subjectId}) for uid: ${uid}. Added strengths: ${JSON.stringify(
        newStrengths
      )}, weaknesses: ${JSON.stringify(newWeaknesses)}`
    );
  } catch (err) {
    console.error("Lỗi khi cập nhật hồ sơ học sinh:", err);
  }
}

export async function updateStudentProfileFromSession(
  uid: string,
  subjectId: string,
  chatHistory: Array<{ role: "user" | "model"; text: string }>,
  apiKey: string,
  parentRequestId: string
): Promise<void> {
  try {
    const profileDoc = await db.collection("student_profiles").doc(uid).get();
    const currentProfile = profileDoc.exists ? profileDoc.data() : null;

    const subProfile = currentProfile?.[subjectId] || {};
    let oldStrengths = boundedProfileItems(subProfile.strengths);
    let oldWeaknesses = boundedProfileItems(subProfile.weaknesses);
    let oldSummary: string = String(subProfile.learningSummary || '').slice(0, 1000);

    // Tự động di trú dữ liệu cũ từ cấu trúc phẳng sang cấu trúc môn học mới
    if (!currentProfile?.[subjectId] && subjectId === "math") {
      if (currentProfile?.strengths) oldStrengths = boundedProfileItems(currentProfile.strengths);
      if (currentProfile?.weaknesses) oldWeaknesses = boundedProfileItems(currentProfile.weaknesses);
      if (currentProfile?.learningSummary) oldSummary = String(currentProfile.learningSummary).slice(0, 1000);
    }

    // Định dạng lịch sử chat thành văn bản đọc được
    const historyText = chatHistory
      .map((m) => {
        const roleName = m.role === "user" ? "Học sinh" : "Gia sư AI";
        return `${roleName}: ${m.text}`;
      })
      .join("\n");

    const subjectNameMap: Record<string, string> = {
      math: "Toán",
      english: "Tiếng Anh",
      chemistry: "Hóa học",
      biology: "Sinh học",
      physics: "Vật lý",
    };
    const subjectName = subjectNameMap[subjectId] || subjectId;

    const prompt = `Bạn là một chuyên gia tâm lý giáo dục và chẩn đoán năng lực học sinh ôn thi lớp 10 môn ${subjectName}.
Nhiệm vụ của bạn là: Đọc toàn bộ cuộc hội thoại dưới đây giữa Học sinh và Gia sư AI trong một phiên làm bài tập môn ${subjectName}, đối chiếu với Hồ sơ cũ của học sinh, và trích xuất các điểm mạnh mới, điểm yếu/lỗi sai mới thực sự nổi bật và lặp lại, đồng thời cập nhật lại câu tóm tắt tiến trình học tập của học sinh.

Cuộc hội thoại trong phiên học:
${historyText}

Hồ sơ cũ của học sinh môn ${subjectName}:
- Điểm mạnh cũ: ${oldStrengths.length > 0 ? JSON.stringify(oldStrengths) : "(Không có)"}
- Điểm yếu/Lỗi sai cũ: ${oldWeaknesses.length > 0 ? JSON.stringify(oldWeaknesses) : "(Không có)"}
- Tóm tắt cũ: "${oldSummary || "(Không có)"}"

Yêu cầu trích xuất:
1. Phân tích cả quá trình: Đừng ghi nhận những lỗi sai nhất thời mà học sinh đã tự sửa được ở các câu sau. Chỉ ghi nhận Điểm yếu mới (newWeaknesses) khi học sinh liên tục tính toán sai, quên điều kiện áp dụng, hoặc lúng túng bền vững ở một phần kiến thức.
2. Điểm mạnh mới (newStrengths): Chỉ ghi nhận khi học sinh tự giải đúng bài tập, hiểu bài nhanh, hoặc áp dụng tốt các gợi ý để tự tìm ra đáp số.
3. Tóm tắt mới (learningSummary): Viết lại 1 câu duy nhất (dưới 30 từ) tóm tắt tiến trình năng lực học sinh sau phiên hội thoại này.
4. Mỗi ý điểm mạnh/yếu chỉ viết từ 3-7 từ ngắn gọn (ví dụ: "Quên đk delta >= 0", "Nhầm dấu công thức Vi-ét").
5. Trả về kết quả dưới dạng cấu trúc JSON sạch, không bọc trong markdown (không dùng \`\`\`json ... \`\`\`), có dạng:
{
  "newStrengths": ["...", "..."],
  "newWeaknesses": ["...", "..."],
  "learningSummary": "..."
}

Kết quả JSON:`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
    const startedAt = Date.now();
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }, 15_000);

    if (!response.ok) {
      console.warn("LLM updateStudentProfileFromSession trả về lỗi HTTP:", response.status);
      throw new Error(`Gemini diagnose HTTP ${response.status}`);
    }

    const data = (await response.json()) as any;
    const usage = data?.usageMetadata;
    if (usage) {
      await recordAuxiliaryAiUsage(parentRequestId, uid, 'diagnose', 'gemini', PROFILE_MODEL, usage, Date.now() - startedAt);
    }

    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (rawText.startsWith("```")) {
      rawText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
    }

    const parsed = JSON.parse(rawText);
    const { newStrengths = [], newWeaknesses = [], learningSummary = "" } = parsed;

    const mergeAndUnique = (oldArr: string[], newArr: any[]) => {
      const combined = [...oldArr, ...newArr.map((s) => String(s).trim().slice(0, 160))].filter(Boolean);
      return [...new Set(combined)].slice(-50);
    };

    const updatedStrengths = mergeAndUnique(oldStrengths, newStrengths);
    const updatedWeaknesses = mergeAndUnique(oldWeaknesses, newWeaknesses);
    const finalSummary = String(learningSummary || oldSummary).slice(0, 1000);

    await db.collection("student_profiles").doc(uid).set(
      {
        [subjectId]: {
          strengths: updatedStrengths,
          weaknesses: updatedWeaknesses,
          learningSummary: finalSummary,
          lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    console.log(
      `[Memory] Session diagnosed and updated student profile (${subjectId}) for uid: ${uid}. Added strengths: ${JSON.stringify(
        newStrengths
      )}, weaknesses: ${JSON.stringify(newWeaknesses)}`
    );
  } catch (err) {
    console.error("Lỗi khi cập nhật hồ sơ học sinh từ phiên hội thoại:", err);
    throw err;
  }
}

export async function consolidateProfile(
  uid: string,
  subjectId: string,
  apiKey: string,
  parentRequestId: string
): Promise<void> {
  try {
    // 1. Tải hồ sơ học sinh hiện tại
    const profileDoc = await db.collection("student_profiles").doc(uid).get();
    if (!profileDoc.exists) {
      console.log(`[Consolidation] Không tìm thấy hồ sơ học sinh cho uid: ${uid}. Bỏ qua dọn dẹp.`);
      return;
    }

    const currentProfile = profileDoc.data();
    const subProfile = currentProfile?.[subjectId] || {};
    const strengths = boundedProfileItems(subProfile.strengths);
    const weaknesses = boundedProfileItems(subProfile.weaknesses);
    const learningSummary: string = String(subProfile.learningSummary || '').slice(0, 1000);

    if (strengths.length === 0 && weaknesses.length === 0) {
      console.log(`[Consolidation] Hồ sơ trống cho uid: ${uid}. Bỏ qua.`);
      return;
    }

    // 2. Tải các attempts của học sinh từ Firestore subcollection
    const attemptsSnap = await db.collection("users").doc(uid).collection("learning_attempts")
      .orderBy('createdAt', 'desc').limit(500).get();

    // Gom nhóm attempts theo questionTypeId
    const attemptsMap: Record<string, any[]> = {};
    attemptsSnap.forEach(docSnap => {
      const attempt = docSnap.data();
      if (attempt.questionTypeId) {
        if (!attemptsMap[attempt.questionTypeId]) {
          attemptsMap[attempt.questionTypeId] = [];
        }
        attemptsMap[attempt.questionTypeId].push(attempt);
      }
    });

    // 3. Tìm các dạng bài đã làm đúng 3 câu liên tiếp gần nhất
    const masteredQuestionTypeIds: string[] = [];

    for (const [qtId, list] of Object.entries(attemptsMap)) {
      const sorted = [...list].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      const recent = sorted.slice(0, 3);
      if (recent.length === 3 && recent.every(a => a.isCorrect === true)) {
        masteredQuestionTypeIds.push(qtId);
      }
    }

    // 4. Tra cứu tên các dạng bài từ collection knowledge_base
    const qTypesSnap = await db.collection("knowledge_base")
      .where("subjectId", "==", subjectId)
      .where("chunkType", "==", "overview")
      .get();

    const qTypeMap: Record<string, string> = {};
    qTypesSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.parentId && data.parentTitle) {
        qTypeMap[data.parentId] = data.parentTitle;
      }
    });

    const masteredTopics = masteredQuestionTypeIds
      .map(id => qTypeMap[id])
      .filter(Boolean);

    console.log(`[Consolidation] uid: ${uid}, mastered topics: ${JSON.stringify(masteredTopics)}`);

    const subjectNameMap: Record<string, string> = {
      math: "Toán",
      english: "Tiếng Anh",
      chemistry: "Hóa học",
      biology: "Sinh học",
      physics: "Vật lý",
    };
    const subjectName = subjectNameMap[subjectId] || subjectId;

    // 5. Gọi Gemini để tối ưu hóa, làm sạch và loại bỏ điểm yếu
    const prompt = `Bạn là một chuyên gia tâm lý giáo dục và chẩn đoán năng lực học sinh ôn thi lớp 10 môn ${subjectName}.
Nhiệm vụ của bạn là: Hãy tinh gọn hồ sơ học sinh và thực hiện dọn dẹp các điểm yếu đã khắc phục.

Thông tin hồ sơ hiện tại môn ${subjectName}:
- Điểm mạnh hiện tại: ${JSON.stringify(strengths)}
- Điểm yếu/Lỗi sai hiện tại: ${JSON.stringify(weaknesses)}
- Tóm tắt học lực hiện tại: "${learningSummary}"

Dữ liệu thực tế luyện tập:
Học sinh đã giải đúng 100% (3/3 câu liên tiếp gần đây nhất) thuộc các dạng bài sau: ${masteredTopics.length > 0 ? JSON.stringify(masteredTopics) : "(Không có)"}

Yêu cầu thực hiện:
1. Nhóm/gộp các điểm mạnh hoặc điểm yếu trùng lặp ngữ nghĩa hoặc quá giống nhau (ví dụ: "Nhầm dấu Vi-ét" và "Sai dấu khi dùng Vi-ét" gộp thành "Nhầm dấu Vi-ét").
2. Đối chiếu điểm yếu hiện tại với "Dữ liệu thực tế luyện tập": Nếu học sinh đã làm đúng 100% các câu gần đây của một dạng bài (ví dụ: "Hệ thức Vi-ét"), hãy loại bỏ các lỗi sai liên quan đến dạng bài đó khỏi danh sách điểm yếu, và chuyển nó thành một điểm mạnh mới (ví dụ: "Đã khắc phục lỗi dấu Vi-ét" hoặc "Nắm chắc hệ thức Vi-ét").
3. Tinh gọn lại từ ngữ cho các điểm mạnh/yếu, mỗi ý chỉ từ 3-7 từ ngắn gọn và súc tích.
4. Cập nhật lại câu tóm tắt tiến trình học tập của học sinh môn này (dưới 30 từ).
5. Trả về kết quả dưới dạng cấu trúc JSON sạch, không bọc trong markdown (không dùng \`\`\`json ... \`\`\`), có dạng:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "learningSummary": "..."
}

Kết quả JSON:`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
    const startedAt = Date.now();
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }, 15_000);

    if (!response.ok) {
      console.warn("[Consolidation] LLM consolidation trả về lỗi HTTP:", response.status);
      throw new Error(`Gemini consolidate HTTP ${response.status}`);
    }

    const data = (await response.json()) as any;
    const usage = data?.usageMetadata;
    if (usage) {
      await recordAuxiliaryAiUsage(parentRequestId, uid, 'consolidate', 'gemini', PROFILE_MODEL, usage, Date.now() - startedAt);
    }

    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (rawText.startsWith("```")) {
      rawText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
    }

    const parsed = JSON.parse(rawText);
    const { strengths: newStrengths = [], weaknesses: newWeaknesses = [], learningSummary: newSummary = "" } = parsed;

    // Cập nhật lại Firestore
    await db.collection("student_profiles").doc(uid).set(
      {
        [subjectId]: {
          strengths: boundedProfileItems(newStrengths),
          weaknesses: boundedProfileItems(newWeaknesses),
          learningSummary: String(newSummary || learningSummary).slice(0, 1000),
          lastUpdated: new Date(),
        },
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    console.log(`[Consolidation] Success for uid: ${uid}. strengths: ${newStrengths.length}, weaknesses: ${newWeaknesses.length}`);

  } catch (err) {
    console.error("[Consolidation] Lỗi khi làm sạch bộ nhớ học sinh:", err);
    throw err;
  }
}
