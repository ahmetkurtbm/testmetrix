import { ANSWER_OPTIONS, type AnswerOption, type ExamData } from "./types";

const VALID = new Set<string>(ANSWER_OPTIONS);

/**
 * Herhangi bir hücre değerini geçerli bir seçeneğe çevirir.
 *
 * İki eski hatayı birden kapatır:
 *
 * 1. `calculateOptionsCount` hücrede `response[i]?.trim()` çağırıyordu. Optional chaining
 *    `null`/`undefined` için koruyor ama hücre sayı ise (Excel'de "1" yazılmış bir yanıt,
 *    ya da tamamen sayısal bir sütun) `.trim` bulunamayıp TypeError ile çöküyordu.
 * 2. Puanlama tarafı (`calculateScores`) hiç normalize etmiyordu: hücrede `"A "` yazıyorsa
 *    `"A" === "A "` false döndüğü için yanlış sayılıyor, ama aynı hücre seçenek analizinde
 *    trim'lendiği için A olarak sayılıyordu. Aynı rapor içinde iki farklı sonuç.
 */
export function normalizeAnswer(cell: unknown): AnswerOption {
  if (cell === null || cell === undefined) return "BOS";
  const text = String(cell).trim().toUpperCase();
  if (text === "") return "BOS";
  // Türkçe klavyede boş bırakılan hücreler için sık kullanılan işaretler
  if (text === "-" || text === "BOŞ") return "BOS";
  return VALID.has(text) ? (text as AnswerOption) : "BOS";
}

/**
 * Yüklenen Excel matrisini analiz edilebilir hale getirir.
 *
 * Beklenen biçim (örnek dosyayla aynı):
 *   satır 0: [etiket, doğru1, doğru2, ...]   ← cevap anahtarı
 *   satır i: [öğrenciAdı, yanıt1, yanıt2, ...]
 *
 * Cevap anahtarından kısa satırlar `BOS` ile doldurulur, uzun satırlar kırpılır —
 * böylece matris her zaman tam n × k olur ve aşağı akıştaki tüm indeks erişimleri güvenli.
 */
export function parseExamMatrix(matrix: unknown[][]): ExamData {
  if (!Array.isArray(matrix) || matrix.length < 2) {
    return { answerKey: [], studentNames: [], responses: [] };
  }

  const [keyRow, ...studentRows] = matrix;
  const answerKey = (keyRow ?? []).slice(1).map(normalizeAnswer);
  const k = answerKey.length;

  const studentNames: string[] = [];
  const responses: AnswerOption[][] = [];

  for (const row of studentRows) {
    if (!Array.isArray(row) || row.length === 0) continue;
    const name = row[0];
    // Tamamen boş satırlar (Excel'in dosya sonuna eklediği artıklar) atlanır
    if (name === null || name === undefined || String(name).trim() === "") continue;

    studentNames.push(String(name).trim());

    const answers: AnswerOption[] = [];
    for (let j = 0; j < k; j++) {
      answers.push(normalizeAnswer(row[j + 1]));
    }
    responses.push(answers);
  }

  return { answerKey, studentNames, responses };
}
