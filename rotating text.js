const texts = [
   
  'Web Developer',
  'Designer',
  'Physics Philomath',
  'Coder',
   'AI/ML Enthusiast',
  'Learner'
];

let idx = 0;
const rotatingEl = document.getElementById('rotating-text');
const interval = 3000;

function renderText(text) {
  rotatingEl.innerHTML = '';
  var words = text;
 
    const wordSpan = document.createElement('span');
    wordSpan.className = 'text-rotate-word';
    Array.from(words).forEach((char, j) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'text-rotate-element';
      charSpan.style.animationDelay = (j * 0.05) + 's';
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
    });
 
    rotatingEl.appendChild(wordSpan);
 
}



function nextText() {
  renderText(texts[idx]);
  idx = (idx + 1) % texts.length;
}

setInterval(nextText, interval);
nextText(); // initial render
