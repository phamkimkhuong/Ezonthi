import React from 'react';
import { Text, TextStyle } from 'react-native';

interface MathRendererProps {
  content: string;
  style?: TextStyle;
  className?: string;
}

const SUB_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ'
};

const SUP_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ'
};

const toSub = (str: string) => str.split('').map(c => SUB_MAP[c] || c).join('');
const toSup = (str: string) => str.split('').map(c => SUP_MAP[c] || c).join('');

/**
 * MathRenderer: Chuyển đổi công thức LaTeX thông dụng sang định dạng ký tự Unicode / Toán học
 * mượt mà 120 FPS trên React Native mà không cần tốn chi phí WebView.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, style, className }) => {
  if (!content) return null;

  const formatMathText = (text: string): string => {
    return text
      // Thay thế công thức bọc bởi $...$
      .replace(/\$([^$]+)\$/g, (_, math) => {
        return math
          // Set theory & logic
          .replace(/\\cap/g, '∩')
          .replace(/\\cup/g, '∪')
          .replace(/\\setminus/g, '∖')
          .replace(/\\neq/g, '≠')
          .replace(/\\le(q)?/g, '≤')
          .replace(/\\ge(q)?/g, '≥')
          .replace(/\\subset(eq)?/g, '⊆')
          .replace(/\\in/g, '∈')
          .replace(/\\notin/g, '∉')
          .replace(/\\varnothing|\\emptyset/g, '∅')
          .replace(/\\forall/g, '∀')
          .replace(/\\exists/g, '∃')

          // Greek letters
          .replace(/\\Delta/g, 'Δ')
          .replace(/\\pi/g, 'π')
          .replace(/\\alpha/g, 'α')
          .replace(/\\beta/g, 'β')
          .replace(/\\gamma/g, 'γ')
          .replace(/\\theta/g, 'θ')
          .replace(/\\lambda/g, 'λ')
          .replace(/\\omega/g, 'ω')
          .replace(/\\Omega/g, 'Ω')
          .replace(/\\rho/g, 'ρ')
          .replace(/\\sigma/g, 'σ')
          .replace(/\\mu/g, 'μ')
          .replace(/\\tau/g, 'τ')
          .replace(/\\phi/g, 'φ')

          // Math symbols & operations
          .replace(/\\circ/g, '°')
          .replace(/\\times/g, '×')
          .replace(/\\cdot/g, '·')
          .replace(/\\div/g, '÷')
          .replace(/\\pm/g, '±')
          .replace(/\\mp/g, '∓')
          .replace(/\\approx/g, '≈')
          .replace(/\\equiv/g, '≡')
          .replace(/\\infty/g, '∞')
          .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
          .replace(/\\sqrt/g, '√')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')

          // Chemistry & Physics arrows
          .replace(/\\rightleftharpoons/g, '⇌')
          .replace(/\\to|\\rightarrow/g, '→')
          .replace(/\\leftarrow/g, '←')
          .replace(/\\downarrow/g, '↓')
          .replace(/\\uparrow/g, '↑')
          .replace(/\\vec\s*([a-zA-Z])/g, '$1⃗')

          // Text labels inside formulas: \text{...} or \mathrm{...}
          .replace(/\\(text|mathrm)\{([^}]+)\}/g, '$2')

          // Subscripts with braces: _{298}, _{max}, etc.
          .replace(/_\{([^}]+)\}/g, (_: string, sub: string) => toSub(sub))
          // Subscripts without braces: _2, _3, _0, etc.
          .replace(/_([0-9a-zA-Z+-])/g, (_: string, char: string) => toSub(char))

          // Superscripts with braces: ^{2}, ^{-19}, etc.
          .replace(/\^\{([^}]+)\}/g, (_: string, sup: string) => toSup(sup))
          // Superscripts without braces: ^2, ^3, ^+, ^-, etc.
          .replace(/\^([0-9a-zA-Z+-])/g, (_: string, char: string) => toSup(char));
      })
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sqrt/g, '√')
      .replace(/\\circ/g, '°');
  };

  return (
    <Text style={style} className={className}>
      {formatMathText(content)}
    </Text>
  );
};

export default MathRenderer;
