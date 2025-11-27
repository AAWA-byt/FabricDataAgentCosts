const FABRIC_SKU_TO_CU = {
  F2: 2,
  F4: 4,
  F8: 8,
  F16: 16,
  F32: 32,
  F64: 64,
  F128: 128,
  F256: 256,
  F512: 512,
  F1024: 1024,
  F2048: 2048,
};

const defaults = {
  wordsPerPrompt: 150,
  promptsPerDay: 500,
  answerLength: 200,
  promptComplexity: 1,
  tableCount: 20,
  avgRows: 100000,
  dataVolumeGb: 50,
  dataComplexity: 1,
  fabricSku: "F64",
  pricePerCuHour: 0.2,
  regionFactor: 1,
  cuSecondsPerThousandWords: 10,
  cuSecondsPerTable: 2,
  cuSecondsPerGb: 0.5,
};

const formElements = {};

function cacheElements() {
  const ids = [
    "wordsPerPrompt",
    "promptsPerDay",
    "answerLength",
    "promptComplexity",
    "tableCount",
    "avgRows",
    "dataVolumeGb",
    "dataComplexity",
    "fabricSku",
    "pricePerCuHour",
    "regionFactor",
    "cuSecondsPerThousandWords",
    "cuSecondsPerTable",
    "cuSecondsPerGb",
  ];

  ids.forEach((id) => {
    formElements[id] = document.getElementById(id);
  });
}

function toNumber(element) {
  const raw = element.value.replace(",", ".");
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatEuro(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 4,
  }).format(value);
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function resetForm() {
  Object.entries(defaults).forEach(([key, value]) => {
    if (formElements[key]) {
      formElements[key].value = value;
    }
  });
  calculate();
}

function calculate(event) {
  if (event) {
    event.preventDefault();
  }

  const wordsPerPrompt = toNumber(formElements.wordsPerPrompt);
  const promptsPerDay = toNumber(formElements.promptsPerDay);
  const answerLength = toNumber(formElements.answerLength);
  const promptComplexity = toNumber(formElements.promptComplexity) || 1;
  const tableCount = toNumber(formElements.tableCount);
  const avgRows = toNumber(formElements.avgRows);
  const dataVolumeGb = toNumber(formElements.dataVolumeGb);
  const dataComplexity = toNumber(formElements.dataComplexity) || 1;
  const fabricSku = formElements.fabricSku.value;
  const pricePerCuHour = toNumber(formElements.pricePerCuHour);
  const regionFactor = toNumber(formElements.regionFactor) || 1;
  const cuSecondsPerThousandWords = toNumber(formElements.cuSecondsPerThousandWords);
  const cuSecondsPerTable = toNumber(formElements.cuSecondsPerTable);
  const cuSecondsPerGb = toNumber(formElements.cuSecondsPerGb);

  const wordsTotal = wordsPerPrompt + answerLength;
  const cuSecondsFromPrompt = (wordsTotal / 1000) * cuSecondsPerThousandWords * promptComplexity;
  const rowFactor = 1 + avgRows / 1_000_000;
  const dataSizeFactor =
    (1 + (tableCount * cuSecondsPerTable) / 100 + (dataVolumeGb * cuSecondsPerGb) / 100) * rowFactor;
  const cuSecondsPerPrompt = cuSecondsFromPrompt * dataSizeFactor * dataComplexity;

  const capacityCu = FABRIC_SKU_TO_CU[fabricSku] || 0;
  const euroPerCuSecond = capacityCu
    ? (pricePerCuHour * regionFactor) / (3600 * capacityCu)
    : 0;
  const euroPerPrompt = cuSecondsPerPrompt * euroPerCuSecond;
  const euroPerDay = euroPerPrompt * promptsPerDay;
  const euroPerMonth = euroPerDay * 30;

  const cuSecondsPerDay = cuSecondsPerPrompt * promptsPerDay;
  const availableCuSecondsPerDay = capacityCu * 24 * 3600;
  const utilizationPercent = availableCuSecondsPerDay
    ? (cuSecondsPerDay / availableCuSecondsPerDay) * 100
    : 0;

  renderSummary({
    euroPerPrompt,
    euroPerDay,
    euroPerMonth,
    cuSecondsPerPrompt,
    cuSecondsPerDay,
    utilizationPercent,
    capacityCu,
  });

  renderBreakdown({
    cuSecondsFromPrompt,
    cuSecondsPerPrompt,
    dataSizeFactor,
    rowFactor,
    euroPerCuSecond,
    pricePerCuHour,
    capacityCu,
    regionFactor,
  });
}

function renderSummary({
  euroPerPrompt,
  euroPerDay,
  euroPerMonth,
  cuSecondsPerPrompt,
  cuSecondsPerDay,
  utilizationPercent,
  capacityCu,
}) {
  const summaryEl = document.getElementById("summary");
  const utilizationEl = document.getElementById("utilization");
  const summaryTextEl = document.getElementById("summaryText");

  const cards = [
    { label: "Kosten pro Prompt", value: formatEuro(euroPerPrompt) },
    { label: "Kosten pro Tag", value: formatEuro(euroPerDay) },
    { label: "Kosten pro Monat (30 Tage)", value: formatEuro(euroPerMonth) },
    { label: "CU-Sekunden je Prompt", value: `${formatNumber(cuSecondsPerPrompt)} s` },
    { label: "CU-Sekunden je Tag", value: `${formatNumber(cuSecondsPerDay)} s` },
  ];

  summaryEl.innerHTML = cards
    .map(
      (item) => `
      <div class="stat">
        <small>${item.label}</small>
        <strong>${item.value}</strong>
      </div>
    `
    )
    .join("");

  const badgeClass = utilizationPercent > 80 ? "badge-high" : utilizationPercent > 50 ? "badge-mid" : "badge-low";
  utilizationEl.className = `utilization ${badgeClass}`;
  utilizationEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div>
        <div style="font-size:13px;color:var(--muted);">Auslastung der gewählten Kapazität</div>
        <div style="font-size:22px;font-weight:700;">${formatNumber(utilizationPercent)}%</div>
      </div>
      <div style="text-align:right;font-size:13px;color:var(--muted);">
        ${capacityCu} CUs · 1 CU ≈ ~2 Spark vCores
      </div>
    </div>
  `;

  const utilizationText =
    utilizationPercent > 90
      ? "Die Auslastung liegt über 90 %. Reduziere Workload oder wähle eine größere SKU."
      : utilizationPercent > 75
      ? "Die Auslastung ist hoch. Prüfe Puffer für Spitzenlasten oder optimiere Abfragen."
      : "Die Auslastung liegt im grünen Bereich. Mehr Prompts passen noch auf die gewählte Kapazität.";

  summaryTextEl.textContent = `Bei ${formatNumber(cuSecondsPerPrompt)} CU-Sekunden pro Prompt fallen etwa ${formatEuro(
    euroPerPrompt
  )} an. Pro Tag summiert sich das auf ${formatEuro(euroPerDay)} und auf ${formatEuro(
    euroPerMonth
  )} im Monat. ${utilizationText}`;
}

function renderBreakdown({
  cuSecondsFromPrompt,
  cuSecondsPerPrompt,
  dataSizeFactor,
  rowFactor,
  euroPerCuSecond,
  pricePerCuHour,
  capacityCu,
  regionFactor,
}) {
  const breakdownEl = document.getElementById("costTable");
  const rows = [
    { label: "CU-Sekunden vom Prompt", value: `${formatNumber(cuSecondsFromPrompt)} s` },
    { label: "Zeilenfaktor (Ø Zeilen pro Tabelle)", value: `${formatNumber(rowFactor, 3)}x` },
    { label: "Multiplikator Datenkomplexität", value: `${formatNumber(dataSizeFactor, 3)}x` },
    { label: "CU-Sekunden gesamt / Prompt", value: `${formatNumber(cuSecondsPerPrompt)} s` },
    { label: "Preis je CU-Sekunde", value: `${formatEuro(euroPerCuSecond)}` },
    { label: "Preis je CU-Stunde", value: `${formatEuro(pricePerCuHour)} (Region ×${formatNumber(regionFactor, 2)})` },
    { label: "Gewählte Kapazität", value: `${capacityCu} CUs` },
  ];

  breakdownEl.innerHTML = rows
    .map(
      (row) => `
      <tr>
        <td>${row.label}</td>
        <td>${row.value}</td>
      </tr>
    `
    )
    .join("");
}

function init() {
  cacheElements();
  resetForm();
  document.getElementById("calculatorForm").addEventListener("submit", calculate);
  document.getElementById("calculateBtn").addEventListener("click", calculate);
  document.getElementById("resetBtn").addEventListener("click", resetForm);
}

document.addEventListener("DOMContentLoaded", init);
