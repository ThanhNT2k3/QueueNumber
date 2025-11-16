window.openAndPrint = function (html) {
    try {
        const win = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
        if (!win) {
            console.warn('Popup blocked: cannot open print window');
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();

        // Wait for content to render before printing
        win.focus();
        setTimeout(function () {
            try {
                win.print();
                // Optionally close after printing
                // win.close();
            } catch (e) {
                console.error('Print failed', e);
            }
        }, 250);
    } catch (e) {
        console.error('openAndPrint error', e);
    }
};

window.playBeep = function () {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 800;
        g.gain.value = 0.1;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        setTimeout(() => { o.stop(); ctx.close(); }, 300);
    } catch (e) {
        console.error('playBeep error', e);
    }
};

window.flashElement = function (selector) {
    try {
        const el = document.querySelector(selector);
        if (!el) return;
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 900);
    } catch (e) {
        console.error('flashElement error', e);
    }
};
