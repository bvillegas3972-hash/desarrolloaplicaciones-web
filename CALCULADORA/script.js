const resultDisplay = document.querySelector("#resultDisplay");
const operationDisplay = document.querySelector("#operationDisplay");
const keys = document.querySelector(".keys");

const calculator = {
  currentValue: "0",
  previousValue: null,
  operator: null,
  waitingForNewValue: false,
  justCalculated: false,
};

const operators = {
  "+": { label: "+", calculate: (a, b) => a + b },
  "-": { label: "−", calculate: (a, b) => a - b },
  "*": { label: "×", calculate: (a, b) => a * b },
  "/": { label: "÷", calculate: (a, b) => b === 0 ? null : a / b },
};

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Error";
  }

  const rounded = Number.parseFloat(number.toFixed(10));
  return rounded.toLocaleString("es-EC", {
    maximumFractionDigits: 10,
  });
}

function updateDisplay(message = "") {
  resultDisplay.textContent = message || formatNumber(calculator.currentValue);

  if (calculator.operator && calculator.previousValue !== null) {
    operationDisplay.textContent = `${formatNumber(calculator.previousValue)} ${operators[calculator.operator].label}`;
    return;
  }

  operationDisplay.textContent = calculator.justCalculated ? "Resultado" : "Listo";
}

function inputNumber(number) {
  if (calculator.waitingForNewValue || calculator.justCalculated) {
    calculator.currentValue = number;
    calculator.waitingForNewValue = false;
    calculator.justCalculated = false;
    updateDisplay();
    return;
  }

  calculator.currentValue = calculator.currentValue === "0"
    ? number
    : calculator.currentValue + number;

  updateDisplay();
}

function inputDecimal() {
  if (calculator.waitingForNewValue || calculator.justCalculated) {
    calculator.currentValue = "0.";
    calculator.waitingForNewValue = false;
    calculator.justCalculated = false;
    resultDisplay.textContent = calculator.currentValue;
    return;
  }

  if (!calculator.currentValue.includes(".")) {
    calculator.currentValue += ".";
    resultDisplay.textContent = calculator.currentValue;
  }
}

function clearCalculator() {
  calculator.currentValue = "0";
  calculator.previousValue = null;
  calculator.operator = null;
  calculator.waitingForNewValue = false;
  calculator.justCalculated = false;
  updateDisplay();
}

function deleteLastDigit() {
  if (calculator.waitingForNewValue || calculator.justCalculated) {
    clearCalculator();
    return;
  }

  calculator.currentValue = calculator.currentValue.length > 1
    ? calculator.currentValue.slice(0, -1)
    : "0";

  updateDisplay();
}

function toggleSign() {
  if (calculator.currentValue === "0") {
    return;
  }

  calculator.currentValue = calculator.currentValue.startsWith("-")
    ? calculator.currentValue.slice(1)
    : `-${calculator.currentValue}`;

  updateDisplay();
}

function applyPercent() {
  calculator.currentValue = String(Number(calculator.currentValue) / 100);
  updateDisplay();
}

function performCalculation() {
  if (!calculator.operator || calculator.previousValue === null) {
    return;
  }

  const firstNumber = Number(calculator.previousValue);
  const secondNumber = Number(calculator.currentValue);
  const result = operators[calculator.operator].calculate(firstNumber, secondNumber);

  if (result === null) {
    clearCalculator();
    updateDisplay("No se puede dividir entre 0");
    return;
  }

  calculator.currentValue = String(result);
  calculator.previousValue = null;
  calculator.operator = null;
  calculator.waitingForNewValue = true;
  calculator.justCalculated = true;
  updateDisplay();
}

function chooseOperator(operator) {
  if (calculator.operator && !calculator.waitingForNewValue) {
    performCalculation();
  }

  calculator.previousValue = calculator.currentValue;
  calculator.operator = operator;
  calculator.waitingForNewValue = true;
  calculator.justCalculated = false;
  updateDisplay();
}

function animateKey(button) {
  if (!button) {
    return;
  }

  button.classList.add("is-pressed");
  window.setTimeout(() => button.classList.remove("is-pressed"), 120);
}

function handleAction(action, button) {
  const operator = button.dataset.operator;
  const number = button.dataset.number;

  if (number !== undefined) {
    inputNumber(number);
    return;
  }

  if (action === "operator") chooseOperator(operator);
  if (action === "equals") performCalculation();
  if (action === "decimal") inputDecimal();
  if (action === "clear") clearCalculator();
  if (action === "delete") deleteLastDigit();
  if (action === "sign") toggleSign();
  if (action === "percent") applyPercent();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  animateKey(button);
  handleAction(button.dataset.action, button);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;
  const keyboardMap = {
    Enter: "[data-action='equals']",
    "=": "[data-action='equals']",
    Escape: "[data-action='clear']",
    Backspace: "[data-action='delete']",
    ".": "[data-action='decimal']",
    ",": "[data-action='decimal']",
    "+": "[data-operator='+']",
    "-": "[data-operator='-']",
    "*": "[data-operator='*']",
    "/": "[data-operator='/']",
    "%": "[data-action='percent']",
  };

  const selector = /^\d$/.test(key)
    ? `[data-number='${key}']`
    : keyboardMap[key];

  if (!selector) {
    return;
  }

  event.preventDefault();
  const button = document.querySelector(selector);
  animateKey(button);
  handleAction(button.dataset.action, button);
});

updateDisplay();
