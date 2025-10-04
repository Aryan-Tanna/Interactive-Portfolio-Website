 const configs = {
      text: "Enthusiastic and detail-oriented junior web developer with a strong foundation in front-end and back-end technologies. Passionate about problem-solving and continuous learning, with a drive to apply web development skills while expanding into emerging fields like AI, machine learning, and quantum computing. Adept at collaborating within cross-functional teams, adapting quickly to new tools, and taking initiative in dynamic environments. Seeking an entry-level opportunity to contribute to innovative projects, sharpen my technical skills, and grow as a technologist in a supportive, growth-focused organization. Eager to bring energy, creativity, and a fresh perspective to the tech industry.",
      speed: 20,          // Interval speed in ms (faster for a better effect with more text)
      lineLength: 63,     // Approx. number of characters per line
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+',
    };

    // --- ELEMENT SELECTION ---
    const containers = document.getElementById('decrypted-text');

    if (!containers) {
        console.error("containers element with ID 'decrypted-text' not found.");
    } else {
        let isDecrypted = false;
        const intervalIds = [];

        // --- NEW HELPER: Auto-formats text with line breaks ---
        const formatTextWithLineBreaks = (text, lineLength) => {
            const words = text.split(' ');
            let formattedText = '';
            let currentLine = '';
            for (const word of words) {
                if ((currentLine + word).length > lineLength) {
                    formattedText += currentLine.trim() + '\n';
                    currentLine = '';
                }
                currentLine += word + ' ';
            }
            formattedText += currentLine.trim();
            return formattedText;
        };
        
        const originalText = formatTextWithLineBreaks(configs.text, configs.lineLength);
        const lines = originalText.split('\n');
        const lineElements = [];

        // --- CORE LOGIC (Refactored for per-line animation) ---

        const shuffleText = (lineText, currentRevealed) => {
          const availableChars = configs.characters.split('');
          return lineText.split('').map((char, i) => {
              if (char === ' ') return ' ';
              if (currentRevealed.has(i)) return lineText[i];
              return availableChars[Math.floor(Math.random() * availableChars.length)];
          }).join('');
        };

        const renderLine = (lineEl, textToRender, revealedIndices) => {
          lineEl.innerHTML = '';
          textToRender.split('').forEach((char, index) => {
              const charSpan = document.createElement('span');
              charSpan.className = revealedIndices.has(index) ? '' : 'encrypted-char';
              charSpan.textContent = char;
              lineEl.appendChild(charSpan);
          });
        };

        const startLineAnimation = (lineText, lineEl) => {
          let revealedIndices = new Set();
          const lineIntervalId = setInterval(() => {
            if (revealedIndices.size < lineText.length) {
              revealedIndices.add(revealedIndices.size);
              const shuffled = shuffleText(lineText, revealedIndices);
              renderLine(lineEl, shuffled, revealedIndices);
            } else {
              clearInterval(lineIntervalId);
              // Final render for the line
              renderLine(lineText, new Set(Array.from({length: lineText.length}, (_, i) => i)));
            }
          }, configs.speed);
          intervalIds.push(lineIntervalId);
        };

        const startAnimation = () => {
          if (isDecrypted || intervalIds.length > 0) return;
          isDecrypted = true;
          lines.forEach((lineText, index) => {
              startLineAnimation(lineText, lineElements[index]);
          });
        };

        // --- INITIAL RENDER ---
        const initialRender = () => {
            containers.innerHTML = '';
            lines.forEach(lineText => {
                const lineEl = document.createElement('div');
                const initiallyScrambledText = shuffleText(lineText, new Set());
                renderLine(lineEl, initiallyScrambledText, new Set());
                containers.appendChild(lineEl);
                lineElements.push(lineEl);
            });
        };
        
        initialRender();
        containers.addEventListener('mouseenter', startAnimation);
    }