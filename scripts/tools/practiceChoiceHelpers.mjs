export const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];
export const DEFAULT_ANSWER_ORDER = ['D', 'A', 'B', 'C'];

export const semanticKey = value => String(value ?? '')
  .trim()
  .replaceAll('$', '')
  .replace(/\\,|\\;/g, '')
  .replaceAll('{,}', '.')
  .replace(/\s+/g, '')
  .replaceAll(',', '.')
  .replaceAll('−', '-')
  .toLowerCase();

export const stripOptionPrefix = option => String(option ?? '').replace(/^[A-D]\.\s*/i, '').trim();

export const solutionText = solution => {
  if (!solution) return '';
  const steps = Array.isArray(solution.detailedSteps)
    ? solution.detailedSteps.map(step => `${step.title ?? ''} ${step.explanation ?? ''}`).join(' ')
    : '';
  return `${solution.recognition ?? ''} ${steps} ${solution.finalAnswer ?? ''}`;
};

export const extractNumbers = text => {
  const matches = String(text ?? '').match(/-?\d+(?:[.,]\{?,\}?\d+)?/g) ?? [];
  return matches
    .map(token => Number(token.replaceAll('{,}', '.').replace(',', '.')))
    .filter(value => Number.isFinite(value));
};

export const countDecimals = valueStr => {
  const cleaned = String(valueStr ?? '').trim().replaceAll(',', '.');
  if (!/^-?\d+(?:\.\d+)?$/.test(cleaned)) return 0;
  return cleaned.includes('.') ? cleaned.split('.')[1].length : 0;
};

export const formatNumber = (value, maxDecimals = 4) => {
  if (!Number.isFinite(value)) return null;
  if (Math.abs(value) < 1e-12) return '0';
  const factor = 10 ** maxDecimals;
  const rounded = Math.round((value + Number.EPSILON * Math.sign(value)) * factor) / factor;
  if (Object.is(rounded, -0) || Math.abs(rounded) < 1e-12) return '0';
  return String(Number(rounded.toFixed(maxDecimals)));
};

export const formatExactDecimalScale = (value, decimals = 6) => {
  if (!Number.isFinite(value)) return null;
  if (Math.abs(value) < 1e-12) return '0';
  const rounded = Number(value.toFixed(decimals));
  if (Object.is(rounded, -0) || rounded === 0) return '0';
  return String(rounded);
};

export const buildChoiceEntries = ({ questions, curatedMap = new Map(), generateDistractors, answerOrder = DEFAULT_ANSWER_ORDER }) => {
  const entries = questions.map((question, index) => {
    const targetLetter = curatedMap.get(question.id)?.correctAnswer
      ?? answerOrder[index % answerOrder.length];
    const curated = curatedMap.get(question.id);
    let correctDisplay;
    let distractors;

    if (curated) {
      correctDisplay = curated.correctDisplay;
      distractors = [...curated.distractors];
    } else {
      const built = generateDistractors(question);
      correctDisplay = built.correctDisplay;
      distractors = built.distractors;
    }

    if (distractors.length !== 3) {
      throw new Error(`${question.id}: cần đúng 3 phương án nhiễu, nhận được ${distractors.length}.`);
    }

    const slot = targetLetter.charCodeAt(0) - 65;
    const optionValues = [...distractors];
    optionValues.splice(slot, 0, correctDisplay);

    const uniqueKeys = new Set(optionValues.map(semanticKey));
    if (uniqueKeys.size !== 4) {
      throw new Error(`${question.id}: phương án bị trùng ngữ nghĩa: ${JSON.stringify(optionValues)}`);
    }

    return {
      id: question.id,
      correctAnswer: targetLetter,
      options: optionValues.map((value, idx) => `${ANSWER_LETTERS[idx]}. ${value}`),
    };
  });

  const keyCounts = Object.fromEntries(
    ANSWER_LETTERS.map(letter => [
      letter,
      entries.filter(entry => entry.correctAnswer === letter).length,
    ])
  );
  return { entries, keyCounts };
};

export const formatVietnameseNumber = (value, decimals = 0) => {
  const formatted = formatNumber(value, decimals);
  if (formatted === null) return null;
  if (decimals > 0 && /^-?\d+(?:\.\d+)?$/.test(formatted)) {
    const fixed = Number(formatted).toFixed(decimals);
    return Number(fixed) === 0 ? '0' : fixed.replace('.', ',');
  }
  return formatted.replace('.', ',');
};

/**
 * Sinh 3 phương án nhiễu cho câu hỏi số hóa học với ràng buộc dấu, phần trăm, pH và số nguyên.
 */
export const buildChemistryNumericDistractors = ({
  question,
  solution,
  correctAnswerStr,
  unitSuffix = '',
}) => {
  const numeric = Number(String(correctAnswerStr).trim().replace(',', '.'));
  if (!Number.isFinite(numeric)) {
    throw new Error(`${question.id}: không thể phân tích giá trị số "${correctAnswerStr}"`);
  }

  const decimals = countDecimals(correctAnswerStr);
  const lower = question.content.toLocaleLowerCase('vi');
  const isPercent = unitSuffix === '%' || /phần trăm|hiệu suất|nồng độ phần trăm/i.test(lower);
  const isPh = /\btính ph\b|giá trị ph/i.test(lower);
  const isPeriod = /chu kì nào/i.test(lower);
  const isBondEnergy = /năng lượng.*liên kết|tìm e\(/i.test(lower);
  const isEnthalpy = !isBondEnergy && /\\delta\s*h|δh|nhiệt trao đổi/i.test(question.content);
  const isOxidation = /^(?:xác định )?số oxi hóa của .* (?:là|bằng|\.)/i.test(lower) || /trong .* số oxi hóa của .* (?:là|bằng)/i.test(lower);
  const isIntegerCount =
    decimals === 0
    && (
      /(?:số|bao nhiêu)\s+(?:electron|proton|neutron|orbital|đồng phân|sản phẩm|liên kết|hạt|lần)|tổng số hạt|hệ số|tổng hệ số|số khối|z bằng|số hiệu nguyên tử|giá trị của x|giá trị a là|nhường bao nhiêu|nhận bao nhiêu|nhân quá trình|đồng phân cấu tạo/i.test(lower)
      || isPeriod
    );
  const mustPositiveStrict = !isOxidation && numeric > 0;
  const allowNegative = numeric < 0 || isEnthalpy || isOxidation;

  const formatCandidate = val => {
    if (!Number.isFinite(val)) return null;
    if (!allowNegative && val < 0) return null;
    if (mustPositiveStrict && val <= 0) return null;
    if (isPercent && (val <= 0 || val > 100)) return null;
    if (isPh && (val < 0 || val > 14)) return null;
    if (isPeriod && (val < 1 || val > 7)) return null;
    if (decimals === 0 && !Number.isInteger(val)) return null;
    if (isIntegerCount && !Number.isInteger(val)) return null;

    const absVal = Math.abs(val);
    let targetDec = decimals;
    if (!isIntegerCount && absVal > 0 && absVal < 1) {
      const candidateStr = formatNumber(val, 4);
      targetDec = Math.max(decimals, countDecimals(candidateStr));
      targetDec = Math.min(targetDec, 3);
      if (decimals >= 4) targetDec = decimals;
    } else if (!isIntegerCount && !Number.isInteger(val)) {
      const candidateStr = formatNumber(val, Math.max(decimals, 2));
      targetDec = Math.min(Math.max(decimals, 1), countDecimals(candidateStr));
    }
    const text = (isIntegerCount || (decimals === 0 && Number.isInteger(val)))
      ? String(Math.trunc(val))
      : formatNumber(val, targetDec)?.replace('.', ',');
    if (!text) return null;
    return `${text}${unitSuffix}`;
  };

  const candidates = [];
  const pushVal = val => {
    const formatted = formatCandidate(val);
    if (formatted) candidates.push(formatted);
  };

  if (isPeriod) {
    [numeric - 1, numeric + 1, numeric - 2, numeric + 2].forEach(pushVal);
  } else if (isPh) {
    [14 - numeric, numeric - 1, numeric + 1, numeric - 0.3, numeric - 2, numeric + 2].forEach(pushVal);
  } else if (isPercent) {
    [100 - numeric, numeric / 2, numeric + 5, numeric - 5, numeric + 10, numeric - 10, numeric + 4, numeric - 4].forEach(pushVal);
  } else if (isOxidation) {
    [0, -1, 1, -2, 2, 3, -3, 4, 5, 6, 7].forEach(pushVal);
  } else {
    const absNum = Math.abs(numeric);
    const step = decimals > 0
      ? Math.max(10 ** (-decimals), absNum >= 10 ? 1 : 0)
      : absNum >= 200
        ? 20
        : absNum >= 50
          ? 10
          : absNum >= 15
            ? 2
            : 1;

    if (/24[.,]79/.test(question.content) || /đkc|25\s*°c,\s*1\s*bar/i.test(lower)) {
      pushVal(numeric * (22.4 / 24.79));
    }

    if (allowNegative && numeric !== 0) {
      pushVal(-numeric);
    }

    pushVal(numeric * 2);
    if (numeric !== 0 && (!isIntegerCount || numeric % 2 === 0)) {
      pushVal(numeric / 2);
    }

    if (decimals === 0 && absNum <= 10) {
      [numeric + 1, numeric + 2, numeric - 1, numeric + 3, numeric - 2].forEach(pushVal);
    } else {
      [
        numeric + step,
        numeric - step,
        numeric + 2 * step,
        numeric - 2 * step,
        numeric * 1.5,
        numeric * 0.25,
        numeric * 10,
        numeric / 10,
      ].forEach(pushVal);
    }
  }

  const preserveZeroPad = decimals > 0 && /0$/.test(String(correctAnswerStr).trim());
  const baseDisplay = preserveZeroPad
    ? `${Number(String(correctAnswerStr).trim().replace(',', '.')).toFixed(decimals).replace('.', ',')}${unitSuffix}`
    : `${String(correctAnswerStr).trim().replace('.', ',')}${unitSuffix}`;

  const protectedKeys = new Set([
    semanticKey(baseDisplay),
    ...(question.acceptedAnswers ?? []).map(semanticKey),
  ]);
  const distractors = [];
  const seen = new Set(protectedKeys);

  for (const item of candidates) {
    const key = semanticKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    distractors.push(item);
    if (distractors.length === 3) break;
  }

  if (distractors.length !== 3) {
    let offset = decimals > 0 ? 10 ** (-decimals) : 1;
    while (distractors.length < 3) {
      for (const candidate of [numeric + offset, numeric - offset]) {
        const formatted = formatCandidate(candidate);
        if (!formatted) continue;
        const key = semanticKey(formatted);
        if (!seen.has(key)) {
          seen.add(key);
          distractors.push(formatted);
          if (distractors.length === 3) break;
        }
      }
      offset += decimals > 0 ? 10 ** (-decimals) : 1;
    }
  }

  return {
    correctDisplay: baseDisplay,
    distractors,
  };
};
