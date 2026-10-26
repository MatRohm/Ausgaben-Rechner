export interface ExpenseIcon {
  icon: string;
  label: string;
}

interface ExpenseIconRule extends ExpenseIcon {
  pattern: RegExp;
}

// Rules are hardcoded for now. Add more entries here as needed.
const RULES: ExpenseIconRule[] = [
  {
    pattern: /supermarkt|lebensmittel|aldi|lidl|rewe|billa|hofer|penny|interspar|mpreis|\bspar\b/i,
    icon: '🛒',
    label: 'Supermarkt',
  },
  {
    pattern: /amazon|amzn/i,
    icon: '📦',
    label: 'Shopping',
  },
  {
    pattern: /h\s*&\s*m|c\s*&\s*a|primark/i,
    icon: '👕',
    label: 'Kleidung',
  },
];

export function findExpenseIcon(description: string): ExpenseIcon | null {
  const text = description.trim();
  if (!text) return null;

  const rule = RULES.find(({ pattern }) => pattern.test(text));
  return rule ? { icon: rule.icon, label: rule.label } : null;
}
