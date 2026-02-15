import { useState } from "react";

export function Calculator() {
    const [display, setDisplay] = useState("0");
    const [operator, HV] = useState<string | null>(null);
    const [firstValue, setFirstValue] = useState<number | null>(null);
    const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);

    const inputDigit = (digit: string) => {
        if (waitingForSecondValue) {
            setDisplay(digit);
            setWaitingForSecondValue(false);
        } else {
            setDisplay(display === "0" ? digit : display + digit);
        }
    };

    const inputDot = () => {
        if (waitingForSecondValue) {
            setDisplay("0.");
            setWaitingForSecondValue(false);
            return;
        }
        if (!display.includes(".")) {
            setDisplay(display + ".");
        }
    };

    const clear = () => {
        setDisplay("0");
        setFirstValue(null);
        HV(null);
        setWaitingForSecondValue(false);
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (firstValue === null) {
            setFirstValue(inputValue);
        } else if (operator) {
            const result = calculate(firstValue, inputValue, operator);
            setDisplay(String(result));
            setFirstValue(result);
        }

        setWaitingForSecondValue(true);
        HV(nextOperator);
    };

    const calculate = (first: number, second: number, op: string) => {
        switch (op) {
            case "+": return first + second;
            case "-": return first - second;
            case "*": return first * second;
            case "/": return first / second;
            default: return second;
        }
    };

    return (
        <div className="calculator-app">
            <div className="calc-display">{display}</div>
            <div className="calc-keypad">
                <button onClick={clear} className="calc-btn function">AC</button>
                <button onClick={() => performOperation("/")} className="calc-btn operator">÷</button>
                <button onClick={() => performOperation("*")} className="calc-btn operator">×</button>
                <button onClick={() => performOperation("-")} className="calc-btn operator">-</button>

                <button onClick={() => inputDigit("7")} className="calc-btn">7</button>
                <button onClick={() => inputDigit("8")} className="calc-btn">8</button>
                <button onClick={() => inputDigit("9")} className="calc-btn">9</button>
                <button onClick={() => performOperation("+")} className="calc-btn operator">+</button>

                <button onClick={() => inputDigit("4")} className="calc-btn">4</button>
                <button onClick={() => inputDigit("5")} className="calc-btn">5</button>
                <button onClick={() => inputDigit("6")} className="calc-btn">6</button>

                <button onClick={() => inputDigit("1")} className="calc-btn">1</button>
                <button onClick={() => inputDigit("2")} className="calc-btn">2</button>
                <button onClick={() => inputDigit("3")} className="calc-btn">3</button>
                <button onClick={() => performOperation("=")} className="calc-btn operator equals">=</button>

                <button onClick={() => inputDigit("0")} className="calc-btn zero">0</button>
                <button onClick={inputDot} className="calc-btn">.</button>
            </div>

            <style>{`
        .calculator-app {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1e293b;
          color: white;
          padding: 1rem;
        }
        .calc-display {
          background: #0f172a;
          color: #f8fafc;
          font-size: 2rem;
          padding: 1rem;
          text-align: right;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .calc-keypad {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          flex: 1;
        }
        .calc-btn {
          background: #334155;
          border: none;
          border-radius: 6px;
          font-size: 1.25rem;
          color: white;
          cursor: pointer;
          transition: background 0.1s;
        }
        .calc-btn:hover {
          background: #475569;
        }
        .calc-btn.function {
          background: #ef4444; 
          grid-column: span 1;
        }
        .calc-btn.operator {
          background: #f59e0b;
        }
        .calc-btn.equals {
          grid-row: span 2;
          background: #3b82f6;
        }
        .calc-btn.zero {
          grid-column: span 2;
        }
      `}</style>
        </div>
    );
}
