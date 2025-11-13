import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

export const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const prev = parseFloat(previousValue);
      const result = calculate(prev, current, operation);
      setDisplay(result.toString());
      setPreviousValue(result.toString());
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const prev = parseFloat(previousValue);
      const current = parseFloat(display);
      const result = calculate(prev, current, operation);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display */}
          <div className="bg-card border-2 border-border rounded-lg p-6 text-right">
            <div className="text-sm text-muted-foreground h-6">
              {previousValue && operation && `${previousValue} ${operation}`}
            </div>
            <div className="text-4xl font-bold mt-2 break-all">{display}</div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-14 text-lg font-semibold"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={handleBackspace}
                className="h-14 text-lg font-semibold"
              >
                <Delete className="h-5 w-5" />
              </Button>
            </div>
            
            {buttons.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                {row.map((btn) => (
                  <Button
                    key={btn}
                    variant={['÷', '×', '-', '+', '='].includes(btn) ? 'default' : 'outline'}
                    onClick={() => {
                      if (btn === '=') handleEquals();
                      else if (btn === '.') handleDecimal();
                      else if (['÷', '×', '-', '+'].includes(btn)) handleOperation(btn);
                      else handleNumber(btn);
                    }}
                    className="h-14 text-lg font-semibold"
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
