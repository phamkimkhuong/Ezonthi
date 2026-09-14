import type { AnswerField, AnswerSchema, Question, StructuredAnswer, ValidatorType } from '../types';

export type { ValidatorType } from '../types';

const NUMBER_TOLERANCE = 1e-6;

const normalizeAnswerText = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\\\(|\\\)|\$/g, '')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)')
    .replace(/√\s*\{([^{}]+)\}/g, 'sqrt($1)')
    .replace(/√\s*\(([^()]+)\)/g, 'sqrt($1)')
    .replace(/√\s*([a-z0-9]+)/g, 'sqrt($1)')
    .replace(/\bcan\s*\(([^()]+)\)/g, 'sqrt($1)')
    .replace(/\bcan\s+([a-z0-9]+)/g, 'sqrt($1)')
    .replace(/[–—−]/g, '-')
    .replace(/\\cup|∪/g, 'u')
    .replace(/\\cap|∩/g, 'n')
    .replace(/\\setminus|\\|∖/g, 'setminus')
    .replace(/\\infty|∞/g, 'infty')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, '');
};

const normalizeChoiceAnswer = (value: string): string => {
  const normalized = normalizeAnswerText(value);
  const optionLetter = normalized.match(/^[a-z]/)?.[0];
  return optionLetter ?? normalized;
};

const answerCandidates = (question: Question): string[] => [
  question.correctAnswer,
  ...(question.acceptedAnswers ?? [])
].filter(Boolean);

export type AnswerInput = string | StructuredAnswer;

export interface AnswerPartScore {
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
}

export interface AnswerScore {
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
  correctParts: number;
  totalParts: number;
  partResults?: Record<string, AnswerPartScore>;
}

export const isStructuredAnswer = (value: AnswerInput): value is StructuredAnswer => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const matchesNormalizedCandidate = (question: Question, userAnswer: string): boolean => {
  const normalizedUser = normalizeAnswerText(userAnswer);
  if (!normalizedUser) return false;

  return answerCandidates(question).some(candidate => normalizeAnswerText(candidate) === normalizedUser);
};

export const parseStrictNumber = (rawValue: string): number | null => {
  const value = normalizeAnswerText(rawValue).replace(',', '.');
  const atom = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
  const fractionMatch = value.match(new RegExp(`^(${atom})\/(${atom})$`, 'i'));

  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return numerator / denominator;
  }

  if (!new RegExp(`^${atom}$`, 'i').test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractNumericValues = (value: string): number[] => {
  const normalized = normalizeAnswerText(value);
  const values: number[] = [];
  const consumedRanges: Array<[number, number]> = [];

  const fractionPattern = /-?\d+(?:[.,]\d+)?\/-?\d+(?:[.,]\d+)?/g;
  for (const match of normalized.matchAll(fractionPattern)) {
    const numeric = parseStrictNumber(match[0]);
    if (numeric !== null) {
      values.push(numeric);
      consumedRanges.push([match.index ?? 0, (match.index ?? 0) + match[0].length]);
    }
  }

  const isInsideConsumedRange = (index: number): boolean => {
    return consumedRanges.some(([start, end]) => index >= start && index < end);
  };

  const numberPattern = /-?\d+(?:[.,]\d+)?/g;
  for (const match of normalized.matchAll(numberPattern)) {
    const index = match.index ?? 0;
    if (isInsideConsumedRange(index)) continue;

    const numeric = parseStrictNumber(match[0]);
    if (numeric !== null) {
      values.push(numeric);
    }
  }

  return values;
};

const numbersEqual = (left: number, right: number): boolean => {
  return Math.abs(left - right) <= NUMBER_TOLERANCE;
};

const extractSingleNumber = (value: string): number | null => {
  return parseStrictNumber(value);
};

const validateNumberAnswer = (question: Question, userAnswer: string): boolean => {
  if (matchesNormalizedCandidate(question, userAnswer)) return true;

  const userNumber = extractSingleNumber(userAnswer);
  if (userNumber === null) return false;
  return answerCandidates(question).some(candidate => {
    const number = extractSingleNumber(candidate);
    return number !== null && numbersEqual(userNumber, number);
  });
};

const validateMultiNumberAnswer = (question: Question, userAnswer: string): boolean => {
  const numericLexemes = (value: string): string[] => value.match(/[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?(?:\/[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?)?/gi) ?? [];
  const exactCandidate = answerCandidates(question).some(candidate => {
    if (normalizeAnswerText(candidate) !== normalizeAnswerText(userAnswer)) return false;
    const expected = numericLexemes(candidate);
    const actual = numericLexemes(userAnswer);
    return expected.length === actual.length && expected.every((item, index) => parseStrictNumber(item) === parseStrictNumber(actual[index]));
  });
  if (exactCandidate) return true;

  // Numeric lists may contain numbers and separators only. This prevents an
  // expression such as "sqrt(2)" or "2+3" from being accepted by extraction.
  const strictList = normalizeAnswerText(userAnswer);
  if (/(?:\d|\.)[+-](?:\d|\.)/.test(strictList)) return false;
  const token = /[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?(?:\/[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?)?/gi;
  const remainder = strictList.replace(token, '').replace(/[;|,]/g, '');
  if (remainder.length > 0) return false;

  const userNumbers = extractNumericValues(userAnswer);
  if (userNumbers.length === 0) return false;

  const candidateNumbers = extractNumericValues(question.correctAnswer);
  if (candidateNumbers.length !== userNumbers.length) return false;

  return candidateNumbers.every((candidateNumber, index) => {
    return numbersEqual(candidateNumber, userNumbers[index]);
  });
};

const structuredAnswerCandidates = (question: Question, schema: AnswerSchema): StructuredAnswer[] => {
  const directCandidates = [
    question.correctFinalAnswer,
    ...(question.acceptedFinalAnswers ?? [])
  ].filter((candidate): candidate is StructuredAnswer => candidate !== undefined);

  if (directCandidates.length > 0) {
    return directCandidates;
  }

  if (schema.fields.length === 1) {
    const [field] = schema.fields;
    return answerCandidates(question).map(candidate => ({
      [field.key]: candidate
    }));
  }

  return [];
};

const fieldHasValue = (value: string | undefined): boolean => {
  return Boolean(value?.trim());
};

export const isAnswerComplete = (question: Question, answer: AnswerInput): boolean => {
  if (!question.answerSchema) {
    return isStructuredAnswer(answer)
      ? Object.values(answer).some(fieldHasValue)
      : fieldHasValue(answer);
  }

  if (!isStructuredAnswer(answer)) {
    return fieldHasValue(answer);
  }

  return question.answerSchema.fields
    .filter(field => field.required !== false)
    .every(field => fieldHasValue(answer[field.key]));
};

export const formatAnswerForDisplay = (question: Question, answer: AnswerInput): string => {
  if (!isStructuredAnswer(answer)) {
    return answer;
  }

  const schema = question.answerSchema;
  if (!schema) {
    return Object.entries(answer)
      .filter(([, value]) => fieldHasValue(value))
      .map(([key, value]) => `${key}: ${value.trim()}`)
      .join(', ');
  }

  return schema.fields
    .map(field => {
      const value = answer[field.key]?.trim();
      if (!value) return null;
      return `${field.label} ${value}`.replace(/\s+/g, ' ').trim();
    })
    .filter((value): value is string => value !== null)
    .join(', ');
};

const normalizeStructuredFieldText = (field: AnswerField, value: string): string => {
  const normalized = normalizeAnswerText(value);
  const aliases = [field.key, field.label.replace(/[=:]/g, '')]
    .map(alias => normalizeAnswerText(alias))
    .filter(Boolean);

  for (const alias of aliases) {
    if (normalized.startsWith(`${alias}=`)) {
      return normalized.slice(alias.length + 1);
    }
  }

  return normalized;
};

const compareTextValue = (field: AnswerField, userValue: string, candidateValue: string): boolean => {
  const normalizedUser = normalizeStructuredFieldText(field, userValue);
  const normalizedCandidate = normalizeStructuredFieldText(field, candidateValue);
  return normalizedUser.length > 0 && normalizedCandidate.length > 0 && normalizedUser === normalizedCandidate;
};

const compareChoiceValue = (userValue: string, candidateValue: string): boolean => {
  const normalizedUser = normalizeChoiceAnswer(userValue);
  const normalizedCandidate = normalizeChoiceAnswer(candidateValue);
  return normalizedUser.length > 0 && normalizedCandidate.length > 0 && normalizedUser === normalizedCandidate;
};

const compareNumericValue = (userValue: string, candidateValue: string): boolean => {
  const userNumber = extractSingleNumber(userValue);
  const candidateNumber = extractSingleNumber(candidateValue);
  return userNumber !== null && candidateNumber !== null && numbersEqual(userNumber, candidateNumber);
};

const compareFieldValue = (
  field: AnswerField,
  userValue: string,
  candidateValue: string,
  mode: AnswerSchema['autoCheckMode']
): boolean => {
  // Trường lựa chọn phải được so sánh như nhãn lựa chọn trước khi xét chế độ
  // số. Điều này đặc biệt quan trọng với cụm Đúng/Sai dùng các giá trị Đ/S.
  if (field.valueType === 'choice') {
    return compareChoiceValue(userValue, candidateValue);
  }

  if (mode === 'numeric' || field.valueType === 'number' || field.valueType === 'fraction') {
    return compareNumericValue(normalizeStructuredFieldText(field, userValue), normalizeStructuredFieldText(field, candidateValue));
  }

  return compareTextValue(field, userValue, candidateValue);
};

const compareStructuredByField = (
  schema: AnswerSchema,
  userAnswer: StructuredAnswer,
  candidate: StructuredAnswer
): boolean => {
  return schema.fields
    .filter(field => field.required !== false)
    .every(field => {
      const userValue = userAnswer[field.key];
      const candidateValue = candidate[field.key];

      if (!fieldHasValue(userValue) || !fieldHasValue(candidateValue)) {
        return false;
      }

      return compareFieldValue(field, userValue, candidateValue, schema.autoCheckMode);
    });
};

const compareStructuredUnorderedNumbers = (
  schema: AnswerSchema,
  userAnswer: StructuredAnswer,
  candidate: StructuredAnswer
): boolean => {
  const requiredFields = schema.fields.filter(field => field.required !== false);
  const toSortedNumbers = (source: StructuredAnswer): number[] | null => {
    const values = requiredFields.map(field => extractSingleNumber(source[field.key] ?? ''));
    if (values.some(value => value === null)) return null;

    return (values as number[]).sort((a, b) => a - b);
  };

  const userNumbers = toSortedNumbers(userAnswer);
  const candidateNumbers = toSortedNumbers(candidate);

  if (!userNumbers || !candidateNumbers || userNumbers.length !== candidateNumbers.length) {
    return false;
  }

  return userNumbers.every((value, index) => numbersEqual(value, candidateNumbers[index]));
};

const validateStructuredAnswer = (question: Question, userAnswer: StructuredAnswer): boolean => {
  const schema = question.answerSchema;
  if (!schema || !isAnswerComplete(question, userAnswer)) return false;

  const candidates = structuredAnswerCandidates(question, schema);
  if (candidates.length === 0) return false;

  switch (schema.autoCheckMode) {
    case 'unordered-numeric':
      return candidates.some(candidate => compareStructuredUnorderedNumbers(schema, userAnswer, candidate));
    case 'manual':
      return candidates.some(candidate => compareStructuredByField(schema, userAnswer, candidate));
    case 'exact':
    case 'numeric':
    case 'keyed-numeric':
    case 'expression-loose':
    default:
      return candidates.some(candidate => compareStructuredByField(schema, userAnswer, candidate));
  }
};

const parseCoordinates = (text: string): Array<[number, number]> => {
  const matches = text.match(/\(([^)]+)\)/g);
  if (!matches) return [];
  const coords: Array<[number, number]> = [];
  for (const match of matches) {
    const content = match.slice(1, -1).trim();
    let parts: string[];
    if (content.includes(';')) {
      parts = content.split(';').map(p => p.trim());
    } else if (content.includes(',')) {
      const commaParts = content.split(',');
      if (commaParts.length === 2) {
        parts = commaParts.map(p => p.trim());
      } else {
        parts = content.split(/\s+/).map(p => p.trim());
      }
    } else {
      parts = content.split(/\s+/).map(p => p.trim());
    }

    const numbers = parts.map(p => {
      const clean = p.replace(',', '.');
      return Number(clean);
    });

    if (numbers.length === 2 && !numbers.some(isNaN)) {
      coords.push([numbers[0], numbers[1]]);
    }
  }
  return coords;
};

const compareCoordinates = (userAnswer: string, correctAnswer: string): boolean => {
  const userCoords = parseCoordinates(userAnswer);
  const correctCoords = parseCoordinates(correctAnswer);
  if (userCoords.length === 0 || correctCoords.length === 0) return false;
  if (userCoords.length !== correctCoords.length) return false;

  return correctCoords.every(([cx, cy]) => {
    return userCoords.some(([ux, uy]) => {
      return Math.abs(ux - cx) < 1e-5 && Math.abs(uy - cy) < 1e-5;
    });
  });
};

export function validateAnswer(question: Question, userAnswer: AnswerInput): boolean {
  if (isStructuredAnswer(userAnswer)) {
    return validateStructuredAnswer(question, userAnswer);
  }

  const validatorType: ValidatorType = question.validatorType ?? (question.options ? 'choice' : 'exact');

  switch (validatorType) {
    case 'coordinates':
      return answerCandidates(question).some(candidate => compareCoordinates(userAnswer, candidate));
    case 'choice': {
      const normalizedUser = normalizeChoiceAnswer(userAnswer);
      if (!normalizedUser) return false;

      return answerCandidates(question).some(candidate => {
        return normalizeChoiceAnswer(candidate) === normalizedUser;
      });
    }
    case 'number':
      return validateNumberAnswer(question, userAnswer);
    case 'multi-number':
      return validateMultiNumberAnswer(question, userAnswer);
    case 'text-includes': {
      const normalizedUser = normalizeAnswerText(userAnswer);
      if (!normalizedUser) return false;

      return answerCandidates(question).some(candidate => {
        const normalizedCandidate = normalizeAnswerText(candidate);
        return normalizedCandidate.length > 0 && normalizedUser.includes(normalizedCandidate);
      });
    }
    case 'manual':
      return (question.acceptedAnswers?.length ?? 0) > 0 && matchesNormalizedCandidate(question, userAnswer);
    case 'exact':
    default:
      return matchesNormalizedCandidate(question, userAnswer);
  }
}

const roundPoints = (value: number): number => Math.round(value * 10000) / 10000;

/**
 * Chấm điểm một câu hỏi theo số điểm thực tế của câu.
 * Cụm Đúng/Sai mặc định được chấm từng ý; có thể ép về toàn-câu bằng
 * `answerSchema.scoringMode = 'all_or_nothing'`.
 */
export function scoreAnswer(
  question: Question,
  userAnswer: AnswerInput,
  maxPoints: number = question.points ?? 1
): AnswerScore {
  const schema = question.answerSchema;
  const shouldScoreByField = schema?.type === 'true-false-cluster'
    && schema.scoringMode !== 'all_or_nothing'
    && isStructuredAnswer(userAnswer);

  if (!schema || !shouldScoreByField) {
    const isCorrect = validateAnswer(question, userAnswer);
    return {
      isCorrect,
      earnedPoints: isCorrect ? maxPoints : 0,
      maxPoints,
      correctParts: isCorrect ? 1 : 0,
      totalParts: 1
    };
  }

  const fields = schema.fields.filter(field => field.required !== false);
  const candidates = structuredAnswerCandidates(question, schema);
  if (fields.length === 0 || candidates.length === 0) {
    return {
      isCorrect: false,
      earnedPoints: 0,
      maxPoints,
      correctParts: 0,
      totalParts: fields.length || 1
    };
  }

  const fieldWeights = fields.map(field => {
    const configuredWeight = schema.fieldWeights?.[field.key];
    return Number.isFinite(configuredWeight) && (configuredWeight ?? 0) > 0
      ? configuredWeight as number
      : 1;
  });
  const totalWeight = fieldWeights.reduce((sum, weight) => sum + weight, 0);

  const evaluatedCandidates = candidates.map(candidate => {
    const partResults: Record<string, AnswerPartScore> = {};
    let earnedPoints = 0;
    let correctParts = 0;

    fields.forEach((field, index) => {
      const userValue = userAnswer[field.key] ?? '';
      const candidateValue = candidate[field.key] ?? '';
      const isCorrect = fieldHasValue(userValue)
        && fieldHasValue(candidateValue)
        && compareFieldValue(field, userValue, candidateValue, schema.autoCheckMode);
      const partMaxPoints = roundPoints((maxPoints * fieldWeights[index]) / totalWeight);
      const partEarnedPoints = isCorrect ? partMaxPoints : 0;

      if (isCorrect) {
        correctParts += 1;
        earnedPoints += partEarnedPoints;
      }
      partResults[field.key] = {
        isCorrect,
        earnedPoints: partEarnedPoints,
        maxPoints: partMaxPoints
      };
    });

    return {
      earnedPoints: roundPoints(earnedPoints),
      correctParts,
      partResults
    };
  });

  const best = evaluatedCandidates.reduce((currentBest, candidate) => (
    candidate.earnedPoints > currentBest.earnedPoints ? candidate : currentBest
  ));

  return {
    isCorrect: best.correctParts === fields.length,
    earnedPoints: best.correctParts === fields.length ? maxPoints : best.earnedPoints,
    maxPoints,
    correctParts: best.correctParts,
    totalParts: fields.length,
    partResults: best.partResults
  };
}
