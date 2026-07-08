// ===========================================================
// WuWa Pull Estimator
// ===========================================================


// ===================== DOM =====================
const form = document.getElementById("inputsForm");
const incomeForm = document.getElementById("incomeForm");

let inputs;

function refreshInputs() {
    inputs = document.querySelectorAll(
        "#inputsForm input, #incomeForm input, #pullPlanContainer input"
    );
}

const tableBody = document.getElementById("dataTableBody");
const incomeContainer = document.getElementById("incomeContainer");


// ===================== STORAGE =====================
const STORAGE_PREFIX = "wuwa_";

function storageKey(input) {

    const prefix = input.closest("#inputsForm")
        ? "inputs"
        : input.closest("#incomeForm")
        ? "income"
        : "misc";

    return `wuwa_${prefix}_${input.id}`;
}

const loadValue = input =>
    localStorage.getItem(storageKey(input));

const saveValue = (input, value) =>
    localStorage.setItem(storageKey(input), value);


// ===================== STATE =====================
const state = {};

function syncState() {
    inputs.forEach(input => {
        const raw = loadValue(input);

        state[input.id] =
            input.type === "checkbox"
                ? raw === "true"
                : Number(raw) || 0;
    });
}


// ===================== INPUT HANDLING =====================
function initInputs() {
    inputs.forEach(input => {
        const saved = loadValue(input);

        // Load
        if (saved !== null) {
            if (input.type === "checkbox") {
                input.checked = saved === "true";
            } else {
                input.value = saved;
            }
        }

        // Save
        const handler = () => {
            const value =
                input.type === "checkbox"
                    ? input.checked
                    : input.value;

            saveValue(input, value);
            update();
        };

        input.addEventListener("input", handler);
        input.addEventListener("change", handler);
    });
}

function enforceMax(input) {
    if (Number(input.value) > Number(input.max)) {
        input.value = input.max;
    }
    if (Number(input.value) < Number(input.min)) {
        input.value = input.min;
    }
}

// ===================== Daily and Weekly Calculations =====================

function getInputElement(id) {
    return document.getElementById(id);
}

function calculateDailies() {

    const dateValue = loadValue(getInputElement("date"));
    const luniteSub = loadValue(getInputElement("luniteSub")) === "true";

    if (!dateValue) return 0;

    const today = new Date();
    const endDate = new Date(dateValue);

    const diffTime = endDate - today;
    const daysRemaining = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);

    const dailyValue = luniteSub ? 150 : 60;

    return daysRemaining * dailyValue;
}

function calculateWeeklies() {

    const dateValue = loadValue(getInputElement("date"));
    if (!dateValue) return 0;

    const today = new Date();
    const endDate = new Date(dateValue);

    today.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);

    let current = new Date(today);

    // Move to first Monday
    while (current.getDay() !== 1) {
        current.setDate(current.getDate() + 1);
    }

    let mondayCount = 0;

    // Count Mondays
    while (current <= endDate) {
        mondayCount++;
        current.setDate(current.getDate() + 7);
    }

    return mondayCount * 160;
}

// ===================== INCOME CONFIG =====================
const incomeSections = [
    {
        title: "Endgame",
        items:
        [
            {
                id: "dailyWeekly",
                name: "Passive Income",
                fields: 
                [
                    {label: "Dailies", key: "daily"},
                    {label: "Weeklies", key: "weekly"}
                ],
                layout: "display"
            },
            {
                id: "toa",
                name: "Tower of Adversity",
                reward: { amount: 800, type: "astrites" },
                options: ["1st Reset (7/20)", "2nd Reset (8/17)"],
                layout: "stacked"
            },
            {
                id: "wiwa",
                name: "Whimpering Wastes",
                reward: { amount: 800, type: "astrites" },
                options: ["1st Reset (7/6)", "2nd Reset (8/3)"],
                layout: "stacked"
            },
            {
                id: "matrix",
                name: "End State Matrix",
                reward: { amount: 400, type: "astrites" },
                options:[],
                layout: "header-inline"
            },
            {
                id:"holograms",
                name: "Holograms - Denia",
                reward: { amount: 120, type: "astrites" },
                options:[],
                layout: "header-inline"
            }
        ]
    },
    {
        title: "Quest Rewards",
        items:
        [
            {
                id: "mainStory",
                name: "Main Story Quests",
                options: [
                    {label: "Ch.4 Act 1: The Wind Before the Storm", amount: 200, type: "astrites"},
                    {label: "Ch.4 Act 2: Xuanling Sings, Storm Quelled", amount: 200, type: "astrites"},
                    {label: "Ch.4 Segue: The Chant of Unseen Ties", amount: 100, type: "astrites"}
                ],
                layout: "stacked"
            },
            {
                id: "sideQuests",
                name: "Side Quests",
                reward: { amount: 100, type: "astrites" },
                options: ["Autopuppets in Fog Veiled Chambers","Faithful Heart Tested at Skyfall"],
                layout: "stacked"
            },
            {
                id:"exploration",
                name: "World Exploration",
                reward: { amount: 2500, type: "astrites" },
                options:[],
                layout: "header-inline"
            },
            {
                id: "explorationStory",
                name: "Exploration Quests",
                reward: { amount: 800, type: "astrites" },
                options: ["Place Holder A","Place Holder B"],
                layout: "stacked"
            }
        ]
    },
    {
        title: "Stable Astrite Sources",
        items: 
        [
            {
                id: "versionUpdate",
                name: "Version Update Claims",
                reward: { amount: 300, type: "astrites" },
                options: ["3.5 Live Stream","Version Compensation", "Bug Fixes", "3.6 Live Stream"],
                layout: "stacked"
            },
            {
                id: "drops",
                name: "Web Drops",
                options: [
                    {label: "Discord", amount: 100, type: "astrites"},
                    {label: "Twitch", amount: 50, type: "astrites"}
                ],
                layout: "stacked"
            },
            {
                id: "trials",
                name: "Trials (May include 1.X reruns)",
                reward: { amount: 20, type: "astrites" },
                options: ["Yang-Yang","Luuk","Lynae","Suisui","Aemeath"],
                layout: "stacked"
            }
        ]
    },
    {
        title: "Events",
        items: 
        [
            {
                id: "coralShop",
                name: "Coral Shop Reset",
                reward: [
                    { amount: 7, type: "tides" },
                    { amount: 7, type: "weapons"}
                ],
                options: [],
                layout: "header-inline"
            },
            {
                id: "giftEvent",
                name: "Gift Event",
                reward: { amount: 5, type: "tides" },
                options: [],
                layout: "header-inline"
            },
            {
                id: "limitedEvents",
                name: "Limited Events",
                options:[
                    {label: "Shape of Yesterday", amount: 180, type: "astrites"},
                    {label: "Matrix Reform", amount: 400, type: "astrites"},
                    {label: "Lollo Campaign", amount: 400, type: "astrites"},
                    {label: "Virtual Crisis", amount: 500, type: "astrites"},
                    {label: "Lament Recon", amount: 400, type: "astrites"},
                    {label: "Action Highlights", amount: 400, type: "astrites"},
                    {label: "A Glimpse of Xuanfang", amount: 500, type: "astrites"},
                    {label: "In Search of Lost Jade", amount: 200, type: "astrites"},
                ],
                layout: "stacked"
            },
        ]
    }
];


// ===================== INCOME RENDER =====================
function renderIncomeSections(){
    const container = document.getElementById("incomeContainer");

    incomeContainer.innerHTML = "";

    incomeSections.forEach(section => {

        //create card container
        const card = document.createElement("div");
            card.className = "card";

            //title
            card.innerHTML = `<h3>${section.title}</h3>`;

            //subgrid
            const subgrid = document.createElement("div");
                subgrid.className = "subgrid";

                //items
                section.items.forEach((item, i) => {
                    subgrid.insertAdjacentHTML("beforeend",

                        createIncomeCard(item, item.id)

                    );
                });

            // attach subgrid to card
            card.appendChild(subgrid);

            //attach card to page
            container.appendChild(card);

    });
}

function createIncomeCard(item, baseId) {

    let header;

    // Display Layout
    if (item.layout === "display") {

        const values = item.fields.map(field => `
            <div>
                <span>${field.label}:</span>
                <span id="${field.key}">--</span>
            </div>
        `).join("");

        header = `
            <span class="income-title">${item.name}</span>
            <div class="income-display-group">
                ${values}
            </div>
        `;
    }

    // In-Line Layout
    else if (item.layout === "header-inline") {
        header = `
            <label class="income-header-row">
                <input type="checkbox" id="${baseId}-0">
                <span class="income-title">${item.name}</span>
            </label>
        `;
    } 
    
    // Stacked Layout
    else {
        const checkboxes = item.options.map((option, i) => {

            const labelText =
                typeof option === "string"
                    ? option
                    : option.label;

            return `
                <label>
                    <input type="checkbox" id="${baseId}-${i}">
                    ${labelText}
                </label>
            `;
        }).join("");

        header = `
            <span class="income-title">${item.name}</span>
            <div class="checkbox-group">
                ${checkboxes}
            </div>
        `;
    }

    return `
        <div class="subcard">
            ${header}
        </div>
    `;
}


// ===================== Input CALCULATIONS =====================
function calculateIncomeTotals() {

    const totals = {
        astrites: 0,
        tides: 0,
        lunites: 0,
        weapons: 0
    };

    incomeSections.forEach(section => {
        section.items.forEach(item => {

            // Skip display-only items for now
            if (item.layout === "display") return;

            // HEADER-INLINE (single checkbox)
            if (item.layout === "header-inline") {

                const input = document.getElementById(`${item.id}-0`);
                if (!input) return;

                const checked = loadValue(input) === "true";

                if (!checked && item.reward) {
                    // Check if there are multiple rewards in an array
                    if (Array.isArray(item.reward)) {
                        item.reward.forEach(r => {
                            if (totals.hasOwnProperty(r.type)) {
                                totals[r.type] += r.amount;
                            }
                        });
                    } else {
                        // Single reward object fallback
                        if (totals.hasOwnProperty(item.reward.type)) {
                            totals[item.reward.type] += item.reward.amount;
                        }
                    }
                }
            }

            // STACKED (multiple options)
            else {
                item.options.forEach((option, i) => {

                    const input = document.getElementById(`${item.id}-${i}`);
                    if (!input) return;

                    const checked = loadValue(input) === "true";
                    if (checked) return;

                    // Hybrid handling
                    if (typeof option === "object") {
                        if (totals.hasOwnProperty(option.type)) {
                            totals[option.type] += option.amount;
                        }
                    } else {
                        if (item.reward && totals.hasOwnProperty(item.reward.type)) {
                            totals[item.reward.type] += item.reward.amount;
                        }
                    }
                });
            }

        });
    });

    // INPUT-BASED BONUSES
    const battlePassInput = document.getElementById("battlePass");

    if (battlePassInput) {
        const isActive = loadValue(battlePassInput) === "true";

        if (isActive) {
            totals.tides += 5;
            totals.astrites += 800;
        }
    }

    return totals;
}


// ===================== Input CALCULATIONS =====================
function calculate() {
    const astrites = state.startingAstrites || 0;
    const lunites = state.startingLunites || 0;
    const tides = state.startingTides || 0;
    const weapons = state.startingWeapons || 0;
    const incAstrites = state.totals?.astrites || 0;
    const incLunites = state.totals?.lunites || 0;
    const incTides = state.totals?.tides || 0;
    const incWeapons = state.totals?.weapons || 0;
    const dailies = state.daily || 0;
    const weeklies = state.weekly || 0;

    return {
        pity: state.pity || 0,
        startingAstrites: astrites,
        startingLunites: lunites,
        startingTides: tides,
        startingWeapons: weapons,
        pulls: Math.floor((astrites + lunites) / 160 + tides),
        projectedTides: Math.floor((tides + incTides)),
        projectedAstrites: Math.floor((astrites + incAstrites + weeklies + dailies)),
        projectedLunites: Math.floor((lunites + incLunites)),
        projectedPulls: Math.floor((astrites + incAstrites + weeklies + dailies + lunites + incLunites) / 160 + tides + incTides),
        initialProjectedPulls: Math.floor((astrites + incAstrites + weeklies + dailies + lunites + incLunites) / 160 + tides + incTides),
        projectedWeapons: Math.floor((weapons + incWeapons)),
        irlCost: "—"
    };
}


// ===================== TABLE LOGIC =====================
function computeRowResources(index, calculated) {
    const pullsPerRow = 10;
    const pullsUsed = index * pullsPerRow;

    const tidesRemaining = Math.max(
        calculated.startingTides - pullsUsed,
        0
    );

    const tideDeficit = Math.max(
        pullsUsed - calculated.startingTides,
        0
    );

    const astriteCost = tideDeficit * 160;

    const astritesRemaining = Math.max(
        calculated.startingAstrites - astriteCost,
        0
    );

    const astriteDeficit = Math.max(
        astriteCost - calculated.startingAstrites,
        0
    );

    const lunitesRemaining = Math.max(
        calculated.startingLunites - astriteDeficit,
        0
    );

    const incTidesRemaining = Math.max(
        calculated.projectedTides - pullsUsed,
        0
    );

    const incTideDeficit = Math.max(
        pullsUsed - calculated.projectedTides,
        0
    );

    const incAstriteCost = incTideDeficit * 160;

    const incAstritesRemaining = Math.max(
        calculated.projectedAstrites - incAstriteCost,
        0
    );

    const incAstriteDeficit = Math.max(
        incAstriteCost - calculated.projectedAstrites,
        0
    );

    const incLunitesRemaining = Math.max(
        calculated.projectedLunites - incAstriteDeficit,
        0
    );

    return {
        tidesRemaining,
        astritesRemaining,
        lunitesRemaining,
        incTidesRemaining,
        incAstritesRemaining,
        incLunitesRemaining
    };
}

function createRow(index, calculated) {
    const pullsPerRow = 10;

    const {
        tidesRemaining,
        astritesRemaining,
        lunitesRemaining,
        incTidesRemaining,
        incAstritesRemaining,
        incLunitesRemaining
    } = computeRowResources(index, calculated);

    // Logic: Do they have enough for 10 pulls? (1600 total "value")
    const totalValue = tidesRemaining * 160 + astritesRemaining + lunitesRemaining;
    const isDeficit = totalValue < 1600;

    const rowClass = isDeficit ? 'class="insufficient-funds"' : '';

    return `
        <tr ${rowClass}>
            <td>${calculated.pity + index * pullsPerRow}</td>
            <td>${Math.max(calculated.pulls - index * pullsPerRow, 0)}</td>

            <td>${tidesRemaining}</td>
            <td>${astritesRemaining}</td>
            <td>${lunitesRemaining}</td>

            <td>${Math.max(calculated.projectedPulls - index * pullsPerRow, 0)}</td>

            <td>${incTidesRemaining}</td>
            <td>${incAstritesRemaining}</td>
            <td>${incLunitesRemaining}</td>

            <td>${calculated.irlCost}</td>
        </tr>
    `;
}

function renderTable(calculated) {
    tableBody.innerHTML = "";

    const rows = Math.ceil(calculated.projectedPulls / 10);

    for (let i = 0; i < rows; i++) {
        tableBody.insertAdjacentHTML(
            "beforeend",
            createRow(i, calculated)
        );
    }
}


// ===================== Probability Generator =====================

const bannerData = {
    pityCap: 160,
    baseRate: 0.008,
    softPity: 65,
    conversionCap: 80
};

// Calculate BOTH Cumulative Distribution Functions (CDF)
function calculateCDFs() {
    // 1. Calculate the raw probability (PDF) of pulling ANY 5-star at exactly pull 'i'
    let pdf = new Array(bannerData.conversionCap + 1).fill(0);
    let survivalRate = 1.0;

    for (let i = 1; i <= bannerData.conversionCap; i++) {
        let rate = bannerData.baseRate;
        
        // Ramps up linearly to 100% from soft pity to hard pity
        if (i > bannerData.softPity) {
            const step = (1.0 - bannerData.baseRate) / (bannerData.conversionCap - bannerData.softPity);
            rate += step * (i - bannerData.softPity);
        }
        
        rate = Math.min(rate, 1.0); // Cap at 100%
        pdf[i] = survivalRate * rate;
        survivalRate *= (1.0 - rate);
    }

    // 2. Convolute the probabilities for the Limited 50/50 system
    let limitedPdf = new Array(bannerData.pityCap + 1).fill(0);
    for (let i = 1; i <= bannerData.conversionCap; i++) {
        limitedPdf[i] += pdf[i] * 0.5; // Win the 50/50 directly
        
        for (let j = 1; j <= bannerData.conversionCap; j++) {
            if (i + j <= bannerData.pityCap) {
                limitedPdf[i + j] += (pdf[i] * 0.5) * pdf[j]; // Lose 50/50, get guarantee later
            }
        }
    }

    // 3. Convert to Cumulative Probabilities (CDFs)
    let cdfAny = [];
    let cumulativeAny = 0;

    let cdfLimited = [];
    let cumulativeLimited = 0;
    
    for (let i = 1; i <= bannerData.pityCap; i++) {
        // Any 5-Star (Caps out at 80 pulls, then flatlines at 100%)
        if (i <= bannerData.conversionCap) {
            cumulativeAny += pdf[i];
        } else {
            cumulativeAny = 1.0;
        }
        cdfAny.push(cumulativeAny);

        // Limited 5-Star (Caps out at 160 pulls)
        cumulativeLimited += limitedPdf[i];
        cdfLimited.push(cumulativeLimited);
    }
    
    return { cdfLimited, cdfAny };
}

// ===================== Chart Rendering =====================

let probChartInstance = null;

// Custom Chart.js Plugin to draw vertical dashed lines and labels
const verticalLinePlugin = {
    id: 'verticalLines',
    afterDatasetsDraw: (chart) => { 
        const opts = chart.config.options.plugins.verticalLines;
        if (!opts) return;

        const { currentX, projectedX } = opts;
        const { ctx, chartArea, scales: { x } } = chart;
        
        if (!chartArea) return;

        // Updated drawLine function for verticalLinePlugin
        function drawLine(xValue, color, label) {
            if (xValue < 1 || xValue > bannerData.pityCap) return;
            const xPos = x.getPixelForValue(xValue - 1); 
            
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xPos, chartArea.top);
            ctx.lineTo(xPos, chartArea.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.setLineDash([5, 5]);
            ctx.stroke();

            // --- Label Collision Logic ---
            const labelWidth = 60;
            let labelX = xPos;

            // If label is too close to the right edge, shift it left
            if (xPos + (labelWidth / 2) > chartArea.right) {
                labelX = chartArea.right - (labelWidth / 2);
            } 
            // If label is too close to the left edge, shift it right
            else if (xPos - (labelWidth / 2) < chartArea.left) {
                labelX = chartArea.left + (labelWidth / 2);
            }

            // Draw background box
            ctx.fillStyle = '#f4f4f4'; 
            ctx.fillRect(labelX - 30, chartArea.top - 22, 60, 20);

            // Draw Label Text
            ctx.fillStyle = color;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, labelX, chartArea.top - 12);
            ctx.restore();
        }

        drawLine(projectedX, '#66bb6a', 'Projected'); 
        drawLine(currentX, '#2e7d32', 'Current');
    }
};

Chart.register(verticalLinePlugin);

function renderProbabilityChart(calculated) {
    const canvas = document.getElementById("probabilityChart");
    if (!canvas) return; 

    if (!calculated) calculated = calculate();

    const cdfs = calculateCDFs();
    const isGuaranteed = state.guarantee; // Accessing your guarantee state

    const labels = Array.from({ length: bannerData.pityCap }, (_, i) => i + 1);
    const currentX = Math.min(calculated.pity + calculated.pulls, bannerData.pityCap);
    const projectedX = Math.min(calculated.pity + calculated.projectedPulls, bannerData.pityCap);

    if (probChartInstance) probChartInstance.destroy();
    
    // Select data based on Guarantee
    const selectedData = isGuaranteed ? cdfs.cdfAny : cdfs.cdfLimited;
    const labelText = isGuaranteed ? 'Probability of Any 5-Star (%)' : 'Probability of Limited 5-Star (%)';
    const borderColor = '#4caf50';

    probChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: labelText,
                    data: selectedData.map(val => (val * 100).toFixed(2)),
                    borderColor: borderColor,
                    fill: true,
                    // Dynamic Canvas Gradient for Limited line
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {ctx, chartArea, scales} = chart;
                        if (!chartArea) return 'rgba(76, 175, 80, 0.2)'; 

                        const currentXPixel = scales.x.getPixelForValue(currentX - 1);
                        const projectedXPixel = scales.x.getPixelForValue(projectedX - 1);

                        const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                        const width = chartArea.right - chartArea.left;

                        let currentPos = Math.max(0, Math.min(1, (currentXPixel - chartArea.left) / width));
                        let projectedPos = Math.max(0, Math.min(1, (projectedXPixel - chartArea.left) / width));

                        // Up to Current Line (Dark)
                        gradient.addColorStop(0, 'rgba(76, 175, 80, 0.45)');
                        gradient.addColorStop(currentPos, 'rgba(76, 175, 80, 0.45)');
                        
                        // Current to Projected Line (Light)
                        gradient.addColorStop(currentPos, 'rgba(76, 175, 80, 0.15)');
                        gradient.addColorStop(projectedPos, 'rgba(76, 175, 80, 0.15)');
                        
                        // After Projected Line (Transparent)
                        gradient.addColorStop(projectedPos, 'rgba(76, 175, 80, 0.0)');
                        gradient.addColorStop(1, 'rgba(76, 175, 80, 0.0)');

                        return gradient;
                    },
                    tension: 0.2, 
                    pointRadius: 0, 
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            layout: {
                padding: { top: 30 } 
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: { display: true, text: 'Pulls' },
                    grid: { display: false }
                },
                y: {
                    title: { display: true, text: 'Cumulative Probability (%)' },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                // ADD THIS LEGEND BLOCK HERE
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20 // Adds a little breathing room around the legend items
                    }
                },
                verticalLines: { currentX, projectedX },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label.replace(' (%)', '')}: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Pulls' }, grid: { display: false } },
                y: { title: { display: true, text: 'Cumulative Probability (%)' }, min: 0, max: 100 }
            }
        }
    });
}


// ===================== Future Plans & Goals Layout =====================
// Current Situation
function renderSummary(calculated) {
    // Total Pulls & Resource Breakdown Card
    document.getElementById("total-pulls-val").textContent = calculated.projectedPulls + calculated.projectedWeapons;
    document.getElementById("tides-val").textContent = calculated.projectedTides;
    document.getElementById("astrites-val").textContent = calculated.projectedAstrites;
    document.getElementById("lunites-val").textContent = calculated.projectedLunites;
    document.getElementById("weapons-val").textContent = calculated.projectedWeapons;

    // Pity Card
    document.getElementById("char-pity-val").textContent = state.pity || 0;
    document.getElementById("weap-pity-val").textContent = state.weaponPity || 0;
    
    const guaranteeEl = document.getElementById("guarantee-status");
    guaranteeEl.innerHTML = `<strong>Guarantee:</strong> ${state.guarantee ? "Yes" : "No"}`;
}

// ===================== Simulations =====================
/**
 * Gathers the priority inputs from the DOM.
 * @param {string} pKey - 'p1', 'p2', or 'p3'
 */
function getGoalFromInputs(pKey) {
    const sInput = document.getElementById(`${pKey}_char`);
    const rInput = document.getElementById(`${pKey}_weap`);
    const sCheckbox = document.getElementById(`${pKey}_char_cb`);
    
    // NEW: Grab the "Today Only" toggle (will be null for p2 and p3 if they don't have it)
    const todayCheckbox = document.getElementById(`${pKey}_today_cb`);

    const extraCopies = Number(sInput.value) || 0;
    const baseCopy = (sCheckbox && sCheckbox.checked) ? 1 : 0;

    return {
        S: baseCopy + extraCopies, 
        R: Number(rInput.value) || 0,
        useTodayOnly: (todayCheckbox && todayCheckbox.checked) // Returns true or false
    };
}

/**
 * Simulates a single pull session for a banner.
 * @param {string} type - 'character' or 'weapon'
 * @param {number} targetCount - Number of 5-stars needed
 * @param {number} startingPity - Current pity count
 * @param {boolean} isFiftyFifty - True for character banner, false for weapon
 * @returns {object} { success: boolean, cost: number, endingPity: number }
 */
function simulateBanner(type, targetCount, startingPity, isFiftyFifty) {
    let pulls = 0;
    let pity = startingPity;
    let fiveStarsPulled = 0;
    let guarantee = state.guarantee; // Use the global guarantee state

    while (fiveStarsPulled < targetCount) {
        pulls++;
        pity++;

        // 1. Determine probability based on pity
        let rate = bannerData.baseRate;
        if (pity > bannerData.softPity) {
            const step = (1.0 - bannerData.baseRate) / (bannerData.conversionCap - bannerData.softPity);
            rate += step * (pity - bannerData.softPity);
        }

        // 2. Roll
        if (Math.random() < rate || pity >= bannerData.conversionCap) {
            let wonFiftyFifty = !isFiftyFifty || guarantee || Math.random() < 0.5;

            if (wonFiftyFifty) {
                fiveStarsPulled++;
                guarantee = false;
            } else {
                guarantee = true; // Lost 50/50, next one is guaranteed
            }
            pity = 0; // Reset pity on 5-star
        }
    }

    return {
        success: true, 
        pulls: pulls, // <-- Added to track exact pull counts cleanly
        cost: pulls * 160,
        endingPity: pity,
        endingGuarantee: guarantee
    };
}

// ===================== Advanced Simulation & Charting =====================

// Global variables to hold Chart instances so they can be destroyed and redrawn
let survivalChart, failureChart, surplusChart;

function runSimulation(iterations = 10000) {
    const calculated = calculate(); 
    
    // 1. Build a sequential roadmap of individual 5-star milestones
    const milestones = [];
    const priorities = ['p1', 'p2', 'p3'];
    
    priorities.forEach(p => {
        const goal = getGoalFromInputs(p);
        
        for (let s = 1; s <= goal.S; s++) {
            milestones.push({ id: `${p}_char_${s}`, label: `${p.toUpperCase()} Char #${s}`, type: 'character', count: 1, priority: p, todayOnly: goal.useTodayOnly });
        }
        for (let r = 1; r <= goal.R; r++) {
            milestones.push({ id: `${p}_weap_${r}`, label: `${p.toUpperCase()} Weap #${r}`, type: 'weapon', count: 1, priority: p, todayOnly: goal.useTodayOnly });
        }
    });

    // 2. Initialize tracking metrics
    const milestoneCounts = {};
    const failurePoints = { success: 0 };
    const prioritySuccesses = { p1: 0, p2: 0, p3: 0 };
    
    milestones.forEach(m => {
        milestoneCounts[m.id] = 0;
        failurePoints[m.id] = 0;
    });

    const surpluses = []; 

    // 3. Run the simulation loop
    for (let i = 0; i < iterations; i++) {
        
        // BUCKET A: Liquid Assets (Available Today)
        let liquidCharTides = calculated.startingTides || 0;
        let liquidWeapTides = calculated.startingWeapons || 0;
        let liquidAstrites = (calculated.startingAstrites || 0) + (calculated.startingLunites || 0);

        // BUCKET B: Future Projected Income
        let futureCharTides = state.totals?.tides || 0;
        let futureWeapTides = state.totals?.weapons || 0;
        let futureAstrites = (state.totals?.astrites || 0) + (state.totals?.lunites || 0) + (state.daily || 0) + (state.weekly || 0);

        let charPity = state.pity || 0;
        let weapPity = state.weaponPity || 0;
        let localGuarantee = state.guarantee; 
        let failedAt = null;

        // Tracks highest priority tier completed during this individual loop run
        let highestPriorityCleared = { p1: true, p2: true, p3: true };

        for (let m of milestones) {
            if (failedAt) {
                highestPriorityCleared[m.priority] = false;
                continue;
            }

            // Calculate what resources are allowed to be used for this milestone
            let availableCharTides = liquidCharTides + (m.todayOnly ? 0 : futureCharTides);
            let availableWeapTides = liquidWeapTides + (m.todayOnly ? 0 : futureWeapTides);
            let availableAstrites = liquidAstrites + (m.todayOnly ? 0 : futureAstrites);

            if (m.type === 'character') {
                let res = simulateBanner('character', 1, charPity, true);
                res.endingGuarantee = localGuarantee; 
                
                let pullsNeeded = res.pulls;
                let tidesUsed = Math.min(pullsNeeded, availableCharTides);
                pullsNeeded -= tidesUsed;
                let astritesNeeded = pullsNeeded * 160;

                if (availableAstrites < astritesNeeded) {
                    failedAt = m.id;
                    highestPriorityCleared[m.priority] = false;
                } else {
                    // Deduct Resources (Drain liquid first, then future)
                    let liquidTideDeduct = Math.min(tidesUsed, liquidCharTides);
                    liquidCharTides -= liquidTideDeduct;
                    futureCharTides -= (tidesUsed - liquidTideDeduct);

                    let liquidAstDeduct = Math.min(astritesNeeded, liquidAstrites);
                    liquidAstrites -= liquidAstDeduct;
                    futureAstrites -= (astritesNeeded - liquidAstDeduct);

                    // Update State
                    charPity = res.endingPity;
                    localGuarantee = res.endingGuarantee;
                    milestoneCounts[m.id]++;
                }
            } else {
                let res = simulateBanner('weapon', 1, weapPity, false);
                
                let pullsNeeded = res.pulls;
                let tidesUsed = Math.min(pullsNeeded, availableWeapTides);
                pullsNeeded -= tidesUsed;
                let astritesNeeded = pullsNeeded * 160;

                if (availableAstrites < astritesNeeded) {
                    failedAt = m.id;
                    highestPriorityCleared[m.priority] = false;
                } else {
                    // Deduct Resources (Drain liquid first, then future)
                    let liquidTideDeduct = Math.min(tidesUsed, liquidWeapTides);
                    liquidWeapTides -= liquidTideDeduct;
                    futureWeapTides -= (tidesUsed - liquidTideDeduct);

                    let liquidAstDeduct = Math.min(astritesNeeded, liquidAstrites);
                    liquidAstrites -= liquidAstDeduct;
                    futureAstrites -= (astritesNeeded - liquidAstDeduct);

                    // Update State
                    weapPity = res.endingPity;
                    milestoneCounts[m.id]++;
                }
            }
        }

        // Tally up which full priority stacks survived this iteration loop
        if (highestPriorityCleared.p1) prioritySuccesses.p1++;
        if (highestPriorityCleared.p1 && highestPriorityCleared.p2) prioritySuccesses.p2++;
        if (highestPriorityCleared.p1 && highestPriorityCleared.p2 && highestPriorityCleared.p3) prioritySuccesses.p3++;

        if (failedAt) {
            failurePoints[failedAt]++;
        } else {
            failurePoints.success++;
            
            // Calculate total leftover pulls from all remaining buckets
            let leftoverTides = liquidCharTides + futureCharTides + liquidWeapTides + futureWeapTides;
            let leftoverAstrites = liquidAstrites + futureAstrites;
            let leftoverPulls = leftoverTides + Math.floor(leftoverAstrites / 160);
            
            surpluses.push(leftoverPulls);
        }
    }

    const milestoneRates = milestones.map(m => ({
        id: m.id,
        label: m.label,
        rate: (milestoneCounts[m.id] / iterations * 100).toFixed(1)
    }));

    return {
        p1: (prioritySuccesses.p1 / iterations * 100).toFixed(1),
        p2: (prioritySuccesses.p2 / iterations * 100).toFixed(1),
        p3: (prioritySuccesses.p3 / iterations * 100).toFixed(1),
        milestones: milestoneRates,
        failures: failurePoints,
        surpluses: surpluses,
        iterations: iterations
    };
}

function updateUIsimulation(simData) {
    // 1. Restore Priority Stack Success Probabilities to text badges
    document.getElementById("prob-p1").textContent = `${simData.p1}%`;
    document.getElementById("prob-p2").textContent = `${simData.p2}%`;
    document.getElementById("prob-p3").textContent = `${simData.p3}%`;

    // 2. Render Survival Funnel (Keeps your detailed 5-Star Breakpoint bars)
    const ctxSurvival = document.getElementById('survivalChart');
    if (survivalChart) survivalChart.destroy();
    
    const survivalLabels = simData.milestones.map(m => m.label);
    const survivalData = simData.milestones.map(m => m.rate);

    survivalChart = new Chart(ctxSurvival, {
        type: 'bar',
        data: {
            labels: survivalLabels.length ? survivalLabels : ['No Goals'],
            datasets: [{
                label: 'Survival Rate (%)',
                data: survivalData.length ? survivalData : [0],
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } },
            plugins: { legend: { display: false } }
        }
    });

    // 3. Render Failure Points (Donut Chart)
    const ctxFailure = document.getElementById('failureChart');
    if (failureChart) failureChart.destroy();

    const failLabels = [];
    const failData = [];
    const failColors = [];

    const modernPalette = ['#004d40', '#00695c', '#00796b', '#00897b', '#26a69a', '#4db6ac', '#80cbc4'];

    simData.milestones.forEach((m, idx) => {
        if (simData.failures[m.id] > 0) {
            failLabels.push(m.label);
            failData.push(simData.failures[m.id]);
            
            // Cycle through our custom palette safely using the modulo operator
            const colorIndex = idx % modernPalette.length;
            failColors.push(modernPalette[colorIndex]); 
        }
    });

    failureChart = new Chart(ctxFailure, {
        type: 'doughnut',
        data: {
            labels: failLabels.length ? failLabels : ['No Failures!'],
            datasets: [{
                data: failData.length ? failData : [1],
                backgroundColor: failData.length ? failColors : ['#4caf50'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } }
            }
        }
    });

// 4. Render Surplus Histogram (Bar Chart with Failure Reference)
    const ctxSurplus = document.getElementById('surplusChart');
    if (surplusChart) surplusChart.destroy();

    const binSize = 20;
    const maxSurplus = Math.max(...simData.surpluses, 0);
    const regularBinCount = Math.ceil(maxSurplus / binSize) + 1;
    
    // Create an array large enough for the failure bar + regular surplus bins
    const bins = new Array(1 + regularBinCount).fill(0);
    const binLabels = [];
    const binColors = [];

    // Index 0 is our explicit Failure Bar
    const totalRuns = simData.iterations;
    const failedRuns = totalRuns - simData.surpluses.length;
    bins[0] = failedRuns;
    binLabels.push("Failed");
    binColors.push("rgba(244, 67, 54, 0.7)"); // Distinct red color for failure

    // Populate the successful surplus bins, offset by 1
    simData.surpluses.forEach(pulls => {
        const targetBin = 1 + Math.floor(pulls / binSize);
        bins[targetBin]++;
    });

    // Generate the remaining labels and colors for successful bins
    for (let i = 0; i < regularBinCount; i++) {
        binLabels.push(`${i * binSize}-${(i + 1) * binSize - 1}`);
        binColors.push("#81c784"); // Standard green color for success
    }

    surplusChart = new Chart(ctxSurplus, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: '# of Simulated Runs',
                data: bins,
                backgroundColor: binColors, // Applies unique red/green colors per bar
                borderRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    title: { display: true, text: 'Leftover Pulls' } 
                },
                y: { display: false }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ===================== APP FLOW =====================
function update() {
    syncState();
    state.daily = calculateDailies();
    if (document.getElementById("daily")) document.getElementById("daily").textContent = state.daily;

    state.weekly = calculateWeeklies();
    if (document.getElementById("weekly")) document.getElementById("weekly").textContent = state.weekly;

    state.totals = calculateIncomeTotals();
    const calculated = calculate();

    renderSummary(calculated);
    renderTable(calculated);
    renderProbabilityChart(calculated);

    // FIX: Automatically run and render the simulation graphs on load/refresh
    if (typeof runSimulation === "function" && typeof updateUIsimulation === "function") {
        updateUIsimulation(runSimulation());
    }
}

function init() {
    renderIncomeSections();
    refreshInputs();
    initInputs();
    update(); // This will now handle both base math AND the future plans rendering
}
init();
