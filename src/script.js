import { Wllama } from 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/index.js';

const statusEl = document.getElementById('status');
const progressEl = document.getElementById('progress');
const inputEl = document.getElementById('input');
const generateEl = document.getElementById('generate');
const outputEl = document.getElementById('output');

let wllama;

async function initWllama() {
  try {
    // Configure paths for Wllama files
    const CONFIG_PATHS = {
      'single-thread/wllama.js': 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/single-thread/wllama.js',
      'single-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/single-thread/wllama.wasm',
      'multi-thread/wllama.js': 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/multi-thread/wllama.js',
      'multi-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/multi-thread/wllama.wasm',
      'multi-thread/wllama.worker.mjs': 'https://cdn.jsdelivr.net/npm/@wllama/wllama/esm/multi-thread/wllama.worker.mjs',
    };

    wllama = new Wllama(CONFIG_PATHS);

    statusEl.textContent = 'Loading model...';

    // Load a small model for demo purposes
    await wllama.loadModelFromUrl(
      "https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf",
      {
        progressCallback: ({ loaded, total }) => {
          const progress = Math.round((loaded / total) * 100);
          progressEl.textContent = `Downloading model: ${progress}%`;
        },
        parallelDownloads: 3
      }
    );

    statusEl.textContent = 'Ready!';
    progressEl.textContent = '';
    inputEl.disabled = false;
    generateEl.disabled = false;

  } catch (error) {
    statusEl.textContent = 'Error initializing Wllama';
    console.error('Error:', error);
  }
}

generateEl.addEventListener('click', async () => {
  try {
    let prompt = inputEl.value.trim();
    if (!prompt) return;

    generateEl.disabled = true;
    outputEl.textContent = 'Generating...';

    //prompt += "\n\nInstructions: You are a helpful AI assistant. Provide direct and concise answers to questions with nothing extra.";

    const output = await wllama.createCompletion(prompt, {
      nPredict: 100,
      sampling: {
        temp: 0.7,
        top_k: 40,
        top_p: 0.9,
      },
    });

    outputEl.textContent = output;
  } catch (error) {
    outputEl.textContent = 'Error generating completion';
    console.error('Error:', error);
  } finally {
    generateEl.disabled = false;
  }
});

// Initialize when the page loads
initWllama();