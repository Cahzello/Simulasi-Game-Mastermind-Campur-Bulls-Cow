// --- VARIABEL GLOBAL ---
let possibleCodes = []; // Himpunan Semesta S (0000-9999)

// --- 1. LOGIKA INTI (BACKEND LOGIC) ---

/**
 * Membandingkan tebakan dengan kunci jawaban.
 * Menggunakan logika 2-Pass untuk menangani angka kembar dengan benar.
 * Return format: Array of colors ['lightgreen', 'tomato', 'yellow', ...]
 */
function getFeedback(secret, guess) {
  let result = ["tomato", "tomato", "tomato", "tomato"]; // Default MERAH (salah)
  let secretCounts = {}; // Menghitung stok angka di kunci

  // Hitung frekuensi angka di kunci (misal: "1122" -> {1:2, 2:2})
  for (let char of secret) {
    secretCounts[char] = (secretCounts[char] || 0) + 1;
  }

  // PASS 1: Cek HIJAU (Posisi & Angka Benar)
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      result[i] = "lightgreen";
      secretCounts[guess[i]]--; // Kurangi jatah stok
    }
  }

  // PASS 2: Cek KUNING (Angka Benar, Posisi Salah)
  for (let i = 0; i < 4; i++) {
    if (result[i] === "lightgreen") continue; // Skip yang sudah hijau

    let char = guess[i];
    if (secretCounts[char] > 0) {
      result[i] = "yellow";
      secretCounts[char]--; // Kurangi jatah stok
    }
  }

  return result;
}

// --- 2. FUNGSI VISUALISASI (UI) ---

function renderRow(guess, colors) {
  let div = document.createElement("div");
  div.className = "row";

  for (let i = 0; i < 4; i++) {
    let p = document.createElement("div");
    p.className = "box";
    p.textContent = guess[i];
    p.style.backgroundColor = colors[i];

    // Styling warna teks agar kontras
    if (colors[i] === "tomato") p.style.color = "white";
    else p.style.color = "black";

    div.appendChild(p);
  }
  document.getElementById("jawaban").appendChild(div);
  // Scroll ke bawah otomatis
  window.scrollTo(0, document.body.scrollHeight);
}

function handleManualGuess() {
  let tebakan = document.getElementById("guess").value;
  let kunci = document.getElementById("kunci").value;

  if (tebakan.length !== 4 || kunci.length !== 4) {
    return alert("Pastikan kunci dan tebakan 4 digit!");
  }

  let colors = getFeedback(kunci, tebakan);
  renderRow(tebakan, colors);
}

// --- 3. LOGIKA AI (MINIMAX & GREEDY) ---

// Generate semua kemungkinan 0000 - 9999
function generateAllCodes() {
  let codes = [];
  for (let i = 0; i < 10000; i++) {
    // Padding agar jadi "0001", bukan "1"
    codes.push(String(i).padStart(4, "0"));
  }
  return codes;
}

// Menghapus kode yang tidak mungkin dari daftar (Pruning)
function pruneCodes(candidates, lastGuess, lastFeedback) {
  return candidates.filter((code) => {
    // Jika 'code' ini adalah kunci rahasianya,
    // apakah dia akan memberikan feedback yang SAMA persis ke 'lastGuess'?
    // Jika tidak sama, berarti 'code' ini bukan jawabannya.
    let simFeedback = getFeedback(code, lastGuess);
    return JSON.stringify(simFeedback) === JSON.stringify(lastFeedback);
  });
}

// Algoritma MINIMAX (Versi Sederhana/Konsisten)
// Mencari tebakan yang meminimalkan sisa kemungkinan terburuk
function getMinimaxGuess(candidates) {
  // Optimasi: Jika kandidat tinggal sedikit, langsung return yg pertama
  if (candidates.length <= 2) return candidates[0];

  let bestGuess = candidates[0];
  let minWorstCase = Infinity;

  // Batasi loop agar browser tidak hang (Sampling jika terlalu banyak)
  // Untuk demo web, kita hanya cek skor Minimax dari kandidat yang tersisa (S)
  // Knuth asli mengecek SEMUA 10.000, tapi itu butuh worker thread/loading lama.
  let searchSpace =
    candidates.length > 500 ? candidates.slice(0, 500) : candidates;

  for (let guess of searchSpace) {
    let scores = {}; // Map untuk menghitung feedback group

    // Simulasikan: Jika saya tebak 'guess', sisa kandidat jadi berapa?
    for (let solution of candidates) {
      let feedback = JSON.stringify(getFeedback(solution, guess));
      scores[feedback] = (scores[feedback] || 0) + 1;
    }

    // Cari Worst Case (Max) dari tebakan ini
    let maxSisa = 0;
    for (let key in scores) {
      if (scores[key] > maxSisa) maxSisa = scores[key];
    }

    // Kita cari Min dari Max (Minimax)
    if (maxSisa < minWorstCase) {
      minWorstCase = maxSisa;
      bestGuess = guess;
    }
  }
  return bestGuess;
}

// --- 4. FUNGSI EKSEKUSI SIMULASI ---

async function startSimulation() {
  let kunci = document.getElementById("kunci").value;
  if (kunci.length !== 4) return alert("Isi kunci jawaban dulu!");

  // Reset
  document.getElementById("jawaban").innerHTML = "";
  document.getElementById("statusAI").textContent = "Menginisialisasi AI...";
  possibleCodes = generateAllCodes(); // Reset S ke 10.000 kemungkinan

  // Tebakan Pertama (Strategi Statis agar Cepat)
  // "1122" atau "0123" adalah pembuka yang bagus. Kita pakai "1122"
  let currentGuess = "1122";
  let attempts = 0;
  let solved = false;

  while (!solved && possibleCodes.length > 0) {
    attempts++;
    document.getElementById("statusAI").textContent =
      `Langkah ke-${attempts}: AI menebak ${currentGuess} (Sisa kemungkinan: ${possibleCodes.length})`;

    // 1. Dapatkan Feedback Real
    let colors = getFeedback(kunci, currentGuess);
    renderRow(currentGuess, colors);

    // Cek Menang
    if (colors.every((c) => c === "lightgreen")) {
      document.getElementById("statusAI").textContent =
        `AI Menang dalam ${attempts} langkah!`;
      solved = true;
      break;
    }

    // Jeda waktu agar terlihat animasinya (500ms)
    await new Promise((r) => setTimeout(r, 800));

    // 2. Pruning (Eliminasi kemungkinan yang salah)
    possibleCodes = pruneCodes(possibleCodes, currentGuess, colors);

    // 3. Tentukan Tebakan Selanjutnya pakai MINIMAX
    if (possibleCodes.length > 0) {
      currentGuess = getMinimaxGuess(possibleCodes);
    } else {
      document.getElementById("statusAI").textContent =
        "AI Menyerah (Logika Error/Kunci tidak valid)";
    }
  }
}



