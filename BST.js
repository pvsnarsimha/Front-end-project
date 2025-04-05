$(function () { $('[data-toggle="tooltip"]').tooltip(); });
let animationQueue = Promise.resolve();
let currentZoom = 100;
let currentLayout = 'standard'; // Default layout

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let synth = window.speechSynthesis;
let voices = [];
let selectedVoice = null;

function loadVoices() {
    voices = synth.getVoices();
    selectedVoice = voices.find(voice => voice.lang === "en-IN" && voice.name.toLowerCase().includes("female")) ||
                   voices.find(voice => voice.lang === "en-IN") || 
                   voices.find(voice => voice.name.toLowerCase().includes("female")) || 
                   voices[0];
}

synth.onvoiceschanged = loadVoices;
loadVoices();

function addIndianSlang(message) {
    let slangifiedMessage = message;
    if (message.includes("found")) slangifiedMessage = message.replace("found", "found, yaar");
    else if (message.includes("not found")) slangifiedMessage = message.replace("not found", "not found, na");
    else if (message.includes("inserted")) slangifiedMessage = message.replace("inserted", "inserted, yaar");
    else if (message.includes("deleted")) slangifiedMessage = message.replace("deleted", "deleted, na");
    else if (message.includes("moving left")) slangifiedMessage = message.replace("moving left", "moving left only");
    else if (message.includes("moving right")) slangifiedMessage = message.replace("moving right", "moving right only");
    else if (message.includes("is")) slangifiedMessage = message.replace("is", "is, yaar");
    else if (message.includes("empty")) slangifiedMessage = message.replace("empty", "empty, na");
    else if (message.includes("visiting")) slangifiedMessage = message.replace("visiting", "visiting, haan");
    if (Math.random() > 0.5) slangifiedMessage += " ";
    return slangifiedMessage;
}

async function showMessageBox(message, type = 'info') {
    const messageBox = document.getElementById('message-box');
    const messageContent = document.getElementById('message-content');
    
    messageBox.classList.remove('success', 'error', 'info', 'warning');
    messageBox.classList.add(type);
    
    messageContent.textContent = message;
    messageBox.classList.add('show');

    let utterance = new SpeechSynthesisUtterance(addIndianSlang(message));
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.pitch = 1.2;
    utterance.rate = 0.9;
    utterance.volume = 1;
    synth.speak(utterance);

    return new Promise(resolve => {
        const checkSpeech = setInterval(() => {
            if (!synth.speaking) {
                clearInterval(checkSpeech);
                resolve();
            }
        }, 100);
    });
}

function hideMessageBox() {
    const messageBox = document.getElementById('message-box');
    messageBox.style.animation = 'slideUpMessage 0.5s ease-in-out forwards';
    setTimeout(() => {
        messageBox.classList.remove('show');
        messageBox.style.animation = '';
    }, 500);
}

async function displayMessage(message, type = 'info') {
    animationQueue = animationQueue.then(async () => {
        await showMessageBox(message, type);
    });
    return animationQueue;
}

async function highlightNode(x, y, value, highlightClass = "highlight") {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let circle = Array.from(svg.getElementsByTagName("circle")).find(c => 
            c.getAttribute("cx") == x && c.getAttribute("cy") == y);
        let text = Array.from(svg.getElementsByTagName("text")).find(t => 
            t.getAttribute("x") == x && t.getAttribute("y") == (y + 5));
        if (circle) {
            circle.classList.add(highlightClass);
            // Add floating animation
            let animate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            animate.setAttribute("attributeName", "transform");
            animate.setAttribute("type", "translate");
            animate.setAttribute("values", "0,0;0,-5;0,0");
            animate.setAttribute("dur", "1s");
            animate.setAttribute("repeatCount", "1");
            animate.setAttribute("fill", "freeze");
            circle.appendChild(animate);
        }
        if (text) text.classList.add("highlighted-text");
        await delay(1000);
    });
    return animationQueue;
}

async function resetNodeStyles() {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let circles = svg.getElementsByTagName("circle");
        let texts = svg.getElementsByTagName("text");
        for (let circle of circles) {
            circle.classList.remove("highlight", "search-highlight", "delete-highlight", "moving-node");
            circle.classList.add("node");
        }
        for (let text of texts) {
            if (text.id !== "output-text") {
                text.classList.remove("highlighted-text");
                text.setAttribute("fill", "black");
            }
        }
        await delay(500);
    });
    return animationQueue;
}

async function animateLine(x1, y1, x2, y2) {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x1); line.setAttribute("y2", y1);
        line.setAttribute("stroke", "yellow"); line.setAttribute("stroke-width", "3");
        line.setAttribute("stroke-dasharray", "5, 5");
        svg.appendChild(line);

        let animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate.setAttribute("attributeName", "x2");
        animate.setAttribute("from", x1); animate.setAttribute("to", x2);
        animate.setAttribute("dur", "0.5s"); animate.setAttribute("fill", "freeze");
        line.appendChild(animate);

        let animate2 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate2.setAttribute("attributeName", "y2");
        animate2.setAttribute("from", y1); animate2.setAttribute("to", y2);
        animate2.setAttribute("dur", "0.5s"); animate2.setAttribute("fill", "freeze");
        line.appendChild(animate2);

        await delay(1000);
        line.setAttribute("stroke", "black");
    });
    return animationQueue;
}

async function animateLineDeletion(x1, y1, x2, y2) {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let line = Array.from(svg.getElementsByTagName("line")).find(l =>
            l.getAttribute("x1") == x1 && l.getAttribute("y1") == y1 &&
            l.getAttribute("x2") == x2 && l.getAttribute("y2") == y2);
        if (line) {
            let animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animate.setAttribute("attributeName", "opacity");
            animate.setAttribute("from", "1"); animate.setAttribute("to", "0");
            animate.setAttribute("dur", "0.5s"); animate.setAttribute("fill", "freeze");
            line.appendChild(animate);

            await delay(500);
            line.remove();
        }
    });
    return animationQueue;
}

async function animateNodeInsertion(x, y, value) {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x); circle.setAttribute("cy", y); circle.setAttribute("r", 0);
        circle.classList.add("node");
        svg.appendChild(circle);

        // Bounce-in animation
        let animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate.setAttribute("attributeName", "r");
        animate.setAttribute("values", "0;25;20");
        animate.setAttribute("keyTimes", "0;0.7;1");
        animate.setAttribute("dur", "1.0s"); 
        animate.setAttribute("fill", "freeze");
        circle.appendChild(animate);

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x); text.setAttribute("y", y + 5);
        text.setAttribute("text-anchor", "middle"); text.textContent = value;
        text.style.opacity = "0";
        svg.appendChild(text);

        let textAnimate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        textAnimate.setAttribute("attributeName", "opacity");
        textAnimate.setAttribute("from", "0"); textAnimate.setAttribute("to", "1");
        textAnimate.setAttribute("dur", "0.5s"); textAnimate.setAttribute("fill", "freeze");
        text.appendChild(textAnimate);

        // Add floating animation after insertion
        let floatAnimate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        floatAnimate.setAttribute("attributeName", "transform");
        floatAnimate.setAttribute("type", "translate");
        floatAnimate.setAttribute("values", "0,0;0,-5;0,0");
        floatAnimate.setAttribute("dur", "0.5s");
        floatAnimate.setAttribute("repeatCount", "indefinite");
        circle.appendChild(floatAnimate);

        await delay(1000);
    });
    return animationQueue;
}

async function animateNodeDeletion(x, y) {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let circle = Array.from(svg.getElementsByTagName("circle")).find(c => 
            c.getAttribute("cx") == x && c.getAttribute("cy") == y);
        let text = Array.from(svg.getElementsByTagName("text")).find(t => 
            t.getAttribute("x") == x && t.getAttribute("y") == (y + 5));

        if (circle && text) {
            // Shrink and fade animation
            let animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animate.setAttribute("attributeName", "r");
            animate.setAttribute("from", "20"); animate.setAttribute("to", "0");
            animate.setAttribute("dur", "0.5s"); animate.setAttribute("fill", "freeze");
            circle.appendChild(animate);

            let fadeAnimate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            fadeAnimate.setAttribute("attributeName", "opacity");
            fadeAnimate.setAttribute("from", "1"); fadeAnimate.setAttribute("to", "0");
            fadeAnimate.setAttribute("dur", "0.5s"); fadeAnimate.setAttribute("fill", "freeze");
            circle.appendChild(fadeAnimate);

            let textAnimate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            textAnimate.setAttribute("attributeName", "opacity");
            textAnimate.setAttribute("from", "1"); textAnimate.setAttribute("to", "0");
            textAnimate.setAttribute("dur", "0.5s"); textAnimate.setAttribute("fill", "freeze");
            text.appendChild(textAnimate);

            await delay(500);
            circle.remove(); text.remove();
        }
    });
    return animationQueue;
}

async function animateNodeMovement(nodeValue, fromX, fromY, toX, toY) {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let circle = Array.from(svg.getElementsByTagName("circle")).find(c => 
            c.getAttribute("cx") == fromX && c.getAttribute("cy") == fromY);
        let text = Array.from(svg.getElementsByTagName("text")).find(t => 
            t.getAttribute("x") == fromX && t.getAttribute("y") == (fromY + 5));

        if (circle && text) {
            // Mark as moving node
            circle.classList.add("moving-node");
            text.classList.add("highlighted-text");

            // Create animation for circle
            let circleAnimateX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            circleAnimateX.setAttribute("attributeName", "cx");
            circleAnimateX.setAttribute("from", fromX); circleAnimateX.setAttribute("to", toX);
            circleAnimateX.setAttribute("dur", "1s"); circleAnimateX.setAttribute("fill", "freeze");
            circle.appendChild(circleAnimateX);

            let circleAnimateY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            circleAnimateY.setAttribute("attributeName", "cy");
            circleAnimateY.setAttribute("from", fromY); circleAnimateY.setAttribute("to", toY);
            circleAnimateY.setAttribute("dur", "1s"); circleAnimateY.setAttribute("fill", "freeze");
            circle.appendChild(circleAnimateY);

            // Create animation for text
            let textAnimateX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            textAnimateX.setAttribute("attributeName", "x");
            textAnimateX.setAttribute("from", fromX); textAnimateX.setAttribute("to", toX);
            textAnimateX.setAttribute("dur", "1s"); textAnimateX.setAttribute("fill", "freeze");
            text.appendChild(textAnimateX);

            let textAnimateY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            textAnimateY.setAttribute("attributeName", "y");
            textAnimateY.setAttribute("from", fromY + 5); textAnimateY.setAttribute("to", toY + 5);
            textAnimateY.setAttribute("dur", "1s"); textAnimateY.setAttribute("fill", "freeze");
            text.appendChild(textAnimateY);

            // Update positions in the positions map
            bst.positions.set(nodeValue, { x: toX, y: toY });

            await delay(1000);
            
            // Remove moving class after animation completes
            circle.classList.remove("moving-node");
            text.classList.remove("highlighted-text");
        }
    });
    return animationQueue;
}

function startVisualizer() {
    document.getElementById('welcome-page').classList.add('hidden');
    document.getElementById('visualizer-content').classList.remove('hidden');
}

// Settings functions
function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('open');
}

function changeTheme(theme) {
    // Remove selected class from all theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.classList.add('selected');
    
    // Change the theme based on selection
    const root = document.documentElement;
    switch(theme) {
        case 'blue':
            root.style.setProperty('--primary-color', '#2c3e50');
            root.style.setProperty('--secondary-color', '#4ca1af');
            root.style.setProperty('--node-color', '#3498db');
            root.style.setProperty('--highlight-color', '#e74c3c');
            root.style.setProperty('--search-color', '#2ecc71');
            root.style.setProperty('--delete-color', '#e67e22');
            break;
        case 'red':
            root.style.setProperty('--primary-color', '#e74c3c');
            root.style.setProperty('--secondary-color', '#e67e22');
            root.style.setProperty('--node-color', '#f39c12');
            root.style.setProperty('--highlight-color', '#3498db');
            root.style.setProperty('--search-color', '#2ecc71');
            root.style.setProperty('--delete-color', '#9b59b6');
            break;
        case 'green':
            root.style.setProperty('--primary-color', '#27ae60');
            root.style.setProperty('--secondary-color', '#2ecc71');
            root.style.setProperty('--node-color', '#3498db');
            root.style.setProperty('--highlight-color', '#e74c3c');
            root.style.setProperty('--search-color', '#f1c40f');
            root.style.setProperty('--delete-color', '#e67e22');
            break;
        case 'purple':
            root.style.setProperty('--primary-color', '#8e44ad');
            root.style.setProperty('--secondary-color', '#3498db');
            root.style.setProperty('--node-color', '#9b59b6');
            root.style.setProperty('--highlight-color', '#e74c3c');
            root.style.setProperty('--search-color', '#2ecc71');
            root.style.setProperty('--delete-color', '#e67e22');
            break;
        default: // default theme
            root.style.setProperty('--primary-color', '#6e48aa');
            root.style.setProperty('--secondary-color', '#9d50bb');
            root.style.setProperty('--node-color', '#007bff');
            root.style.setProperty('--highlight-color', '#ff5733');
            root.style.setProperty('--search-color', '#28a745');
            root.style.setProperty('--delete-color', '#dc3545');
    }
}
function changeBackground(bg) {
    // Remove selected class from all background options
    document.querySelectorAll('.bg-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.classList.add('selected');
    
    // Change the background based on selection
    const root = document.documentElement;
    switch(bg) {
        case 'tree2':
            root.style.setProperty('--bg-image', "url('https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80')");
            break;
        case 'forest':
            root.style.setProperty('--bg-image', "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')");
            break;
        case 'leaves':
            root.style.setProperty('--bg-image', "url('https://images.unsplash.com/photo-1476231682828-37e571bc172f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')");
            break;
        default: // default background
            root.style.setProperty('--bg-image', "url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')");
    }
}
function changeLandscape(layout) {
    document.querySelectorAll('.landscape-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.classList.add('selected');

    currentLayout = layout;
    bst.render();

    displayMessage(`Tree layout changed to ${layout}.`, 'info');
}
function zoomIn() {
    if (currentZoom < 150) {
        currentZoom += 10;
        updateZoom();
    }
}

function zoomOut() {
    if (currentZoom > 50) {
        currentZoom -= 10;
        updateZoom();
    }
}

function resetZoom() {
    currentZoom = 100;
    updateZoom();
}

function updateZoom() {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.style.transform = `scale(${currentZoom / 100})`;
    document.getElementById('zoom-value').textContent = `${currentZoom}%`;
}

function toggleFullScreen() {
    const elem = document.documentElement;
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    if (!document.fullscreenElement) {
        // Enter full-screen mode
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
        // Optional: Change icon to exit full-screen symbol
        fullscreenBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
        `;
    } else {
        // Exit full-screen mode
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
        // Optional: Revert icon to enter full-screen symbol
        fullscreenBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        `;
    }
}

// Optional: Update button state when full-screen mode changes
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (!document.fullscreenElement) {
        fullscreenBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        `;
    }
});

function toggleHelp() {
    const helpPanel = document.getElementById('help-panel');
    helpPanel.classList.toggle('open');
}

// Close help panel when clicking outside
document.addEventListener('click', function(event) {
    const helpPanel = document.getElementById('help-panel');
    const helpToggle = document.getElementById('help-toggle');
    
    if (helpPanel.classList.contains('open') && 
        !helpPanel.contains(event.target) && 
        !helpToggle.contains(event.target)) {
        helpPanel.classList.remove('open');
    }
});

// Ensure help toggle is visible on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('help-toggle').style.display = 'flex';
});

function goHome() {
    window.location.href = "Visulization.html";
}

class TreeNode {
    constructor(value) { 
        this.value = value; 
        this.left = null; 
        this.right = null; 
    }
}

class BST {
    constructor() { 
        this.root = null; 
        this.positions = new Map(); 
    }

    async insert(value) {
        if (this._search(this.root, value)) {
            await displayMessage(`Node ${value} already exists in the BST.`, 'warning');
            return { success: false, message: `Node ${value} already exists in the BST.` };
        }
        this.root = await this._insertWithAnimation(this.root, value, 500, 50, 250);
        this.render();
        await displayMessage(`Inserted ${value} into the BST.`, 'success');
        return { success: true, message: `Inserted ${value} into the BST.` };
    }

    async _insertWithAnimation(node, value, x, y, offset) {
        if (!node) {
            this.positions.set(value, { x, y });
            await animateNodeInsertion(x, y, value);
            return new TreeNode(value);
        }

        await highlightNode(x, y, node.value);
        if (value < node.value) {
            await displayMessage(`Value ${value} < ${node.value}, moving left.`, 'info');
            await animateLine(x, y, x - offset, y + 70);
            node.left = await this._insertWithAnimation(node.left, value, x - offset, y + 70, offset / 2);
        } else if (value > node.value) {
            await displayMessage(`Value ${value} > ${node.value}, moving right.`, 'info');
            await animateLine(x, y, x + offset, y + 70);
            node.right = await this._insertWithAnimation(node.right, value, x + offset, y + 70, offset / 2);
        }
        return node;
    }

    async search(value) {
        let result = await this._searchWithAnimation(this.root, value, 500, 50, 250);
        await displayMessage(result.found ? `Value ${value} found!` : `Value ${value} not found.`, result.found ? 'success' : 'error');
        await delay(1000);
        await resetNodeStyles();
        return result;
    }

    async _searchWithAnimation(node, value, x, y, offset) {
        if (!node) return { found: false };

        await highlightNode(x, y, node.value, "highlight");
        if (node.value === value) {
            await highlightNode(x, y, node.value, "search-highlight");
            return { found: true };
        }

        if (value < node.value) {
            await displayMessage(`Value ${value} < ${node.value}, moving left.`, 'info');
            await animateLine(x, y, x - offset, y + 70);
            return this._searchWithAnimation(node.left, value, x - offset, y + 70, offset / 2);
        } else {
            await displayMessage(`Value ${value} > ${node.value}, moving right.`, 'info');
            await animateLine(x, y, x + offset, y + 70);
            return this._searchWithAnimation(node.right, value, x + offset, y + 70, offset / 2);
        }
    }

    async delete(value) {
        if (!this._search(this.root, value)) {
            await displayMessage(`Node ${value} does not exist in the BST.`, 'error');
            return;
        }
        this.root = await this._deleteWithAnimation(this.root, value, 500, 50, 250);
        this.render();
        await displayMessage(`Node ${value} deleted successfully.`, 'success');
    }

    async _deleteWithAnimation(node, value, x, y, offset) {
        if (!node) return null;

        await highlightNode(x, y, node.value, "highlight");
        if (value < node.value) {
            await displayMessage(`Value ${value} < ${node.value}, moving left.`, 'info');
            await animateLine(x, y, x - offset, y + 70);
            node.left = await this._deleteWithAnimation(node.left, value, x - offset, y + 70, offset / 2);
        } else if (value > node.value) {
            await displayMessage(`Value ${value} > ${node.value}, moving right.`, 'info');
            await animateLine(x, y, x + offset, y + 70);
            node.right = await this._deleteWithAnimation(node.right, value, x + offset, y + 70, offset / 2);
        } else {
            await displayMessage(`Found node ${value}, deleting...`, 'info');
            await highlightNode(x, y, node.value, "delete-highlight");

            if (!node.left) {
                await animateNodeDeletion(x, y);
                return node.right;
            }
            if (!node.right) {
                await animateNodeDeletion(x, y);
                return node.left;
            }

            await displayMessage(`Node ${value} has two children, finding minimum in right subtree...`, 'info');
            let minLargerNode = await this._getMinWithAnimation(node.right, x + offset, y + 70, offset / 2);
            
            // Animate the movement of the replacement node
            let oldPos = this.positions.get(node.value);
            let newPos = this.positions.get(minLargerNode.value);
            if (oldPos && newPos) {
                await animateNodeMovement(minLargerNode.value, newPos.x, newPos.y, oldPos.x, oldPos.y);
                this.positions.set(minLargerNode.value, { x: oldPos.x, y: oldPos.y });
            }
            
            node.value = minLargerNode.value;
            await displayMessage(`Replacing ${value} with ${minLargerNode.value}.`, 'info');
            node.right = await this._deleteWithAnimation(node.right, minLargerNode.value, x + offset, y + 70, offset / 2);
        }
        return node;
    }

    async _getMinWithAnimation(node, x, y, offset) {
        while (node && node.left) {
            await highlightNode(x, y, node.value);
            await displayMessage(`Finding minimum, moving left from ${node.value}.`, 'info');
            await animateLine(x, y, x - offset, y + 70);
            node = node.left;
            x -= offset; y += 70; offset /= 2;
        }
        await highlightNode(x, y, node.value, "search-highlight");
        return node;
    }

    _search(node, value) {
        if (!node) return false;
        if (node.value === value) return true;
        return value < node.value ? this._search(node.left, value) : this._search(node.right, value);
    }

    findMin() { return this._getMin(this.root)?.value ?? null; }
    _getMin(node) { while (node && node.left) node = node.left; return node; }
    findMax() { return this._getMax(this.root)?.value ?? null; }
    _getMax(node) { while (node && node.right) node = node.right; return node; }

    async findSibling(value) {
        if (!this._search(this.root, value)) {
            await displayMessage(`Node ${value} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value} does not exist in the BST.` };
        }
        if (this.root && this.root.value === value) {
            await displayMessage(`Node ${value} is the root and has no sibling.`, 'warning');
            return { found: true, hasSibling: false, message: `Node ${value} is the root and has no sibling.` };
        }
        let sibling = this._findSibling(this.root, value, null);
        await displayMessage(sibling !== null ? `The sibling of ${value} is ${sibling}.` : `Node ${value} has no sibling.`, sibling !== null ? 'success' : 'warning');
        return sibling !== null 
            ? { found: true, hasSibling: true, sibling: sibling, message: `The sibling of ${value} is ${sibling}.` }
            : { found: true, hasSibling: false, message: `Node ${value} has no sibling.` };
    }

    _findSibling(node, value, parent) {
        if (!node) return null;
        if (parent) {
            if (parent.left && parent.left.value === value) return parent.right ? parent.right.value : null;
            if (parent.right && parent.right.value === value) return parent.left ? parent.left.value : null;
        }
        return value < node.value 
            ? this._findSibling(node.left, value, node) 
            : this._findSibling(node.right, value, node);
    }

    findHeight() { return this._findHeight(this.root); }
    _findHeight(node) {
        if (!node) return -1;
        return Math.max(this._findHeight(node.left), this._findHeight(node.right)) + 1;
    }

    _isBalanced(node) {
        if (!node) return { balanced: true, height: -1 };

        let leftResult = this._isBalanced(node.left);
        if (!leftResult.balanced) return { balanced: false, height: 0 };

        let rightResult = this._isBalanced(node.right);
        if (!rightResult.balanced) return { balanced: false, height: 0 };

        let heightDiff = Math.abs(leftResult.height - rightResult.height);
        let balanced = heightDiff <= 1;
        let height = Math.max(leftResult.height, rightResult.height) + 1;

        return { balanced: balanced, height: height };
    }

    async checkIfBalanced() {
        if (!this.root) {
            await displayMessage("The BST is empty, which is balanced by default.", 'warning');
            return { isBalanced: true, message: "The BST is empty, which is balanced by default." };
        }
        let result = this._isBalanced(this.root);
        return {
            isBalanced: result.balanced,
            message: result.balanced ? "The BST is already balanced, yaar!" : "The BST is not balanced, let's balance it."
        };
    }

    inorder(node, result = []) {
        if (!node) return;
        this.inorder(node.left, result);
        result.push(node.value);
        this.inorder(node.right, result);
        return result;
    }

    collectPositions(node, positions = []) {
        if (!node) return;
        let pos = this.positions.get(node.value);
        if (pos) positions.push({ value: node.value, x: pos.x, y: pos.y });
        this.collectPositions(node.left, positions);
        this.collectPositions(node.right, positions);
        return positions;
    }

    collectLines(node, x, y, offset, lines = []) {
        if (!node) return;
        if (node.left) {
            lines.push({ x1: x, y1: y, x2: x - offset, y2: y + 70 });
            this.collectLines(node.left, x - offset, y + 70, offset / 2, lines);
        }
        if (node.right) {
            lines.push({ x1: x, y1: y, x2: x + offset, y2: y + 70 });
            this.collectLines(node.right, x + offset, y + 70, offset / 2, lines);
        }
        return lines;
    }

    async animateTreeRemoval() {
        let positions = this.collectPositions(this.root);
        let lines = this.collectLines(this.root, 500, 50, 250);
        lines.sort((a, b) => b.y2 - a.y2);
        for (let line of lines) {
            await animateLineDeletion(line.x1, line.y1, line.x2, line.y2);
        }
        positions.sort((a, b) => b.y - a.y);
        for (let pos of positions) {
            await highlightNode(pos.x, pos.y, pos.value, "delete-highlight");
            await displayMessage(`Removing node ${pos.value}...`, 'info');
            await animateNodeDeletion(pos.x, pos.y);
        }
    }

    async animateBalancedTreeInsertion(node, x, y, offset) {
        if (!node) return;
        this.positions.set(node.value, { x, y });
        await displayMessage(`Inserting node ${node.value} in the balanced BST...`, 'info');
        await animateNodeInsertion(x, y, node.value);

        if (node.left) {
            await animateLine(x, y, x - offset, y + 70);
            await this.animateBalancedTreeInsertion(node.left, x - offset, y + 70, offset / 2);
        }
        if (node.right) {
            await animateLine(x, y, x + offset, y + 70);
            await this.animateBalancedTreeInsertion(node.right, x + offset, y + 70, offset / 2);
        }
    }

    async convertToBalancedBST() {
        if (!this.root) {
            await displayMessage("The BST is empty, na. Nothing to balance.", 'warning');
            return { success: false, message: "The BST is empty. Nothing to balance." };
        }

        // Check if the BST is already balanced
        let balanceCheck = await this.checkIfBalanced();
        if (balanceCheck.isBalanced) {
            await displayMessage("The BST is already balanced, yaar!", 'success');
            return { success: false, message: "The BST is already balanced." };
        }

        // If not balanced, proceed with conversion
        await displayMessage("BST is not balanced, converting to balanced BST...", 'info');

        // Step 1: Collect nodes in sorted order using inorder traversal
        await displayMessage("Collecting nodes in sorted order using inorder traversal...", 'info');
        let nodes = [];
        this.inorder(this.root, nodes);
        await displayMessage(`Nodes in sorted order: ${nodes.join(' --> ')}`, 'info');

        // Step 2: Remove the current unbalanced tree
        await displayMessage("Removing the current unbalanced tree...", 'info');
        await this.animateTreeRemoval();

        // Step 3: Clear SVG and positions
        let svg = document.getElementById("bstTree");
        svg.innerHTML = "";
        this.positions.clear();

        // Re-add output text element
        let outputText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        outputText.setAttribute("id", "output-text");
        outputText.setAttribute("x", "500");
        outputText.setAttribute("y", "480");
        outputText.setAttribute("text-anchor", "middle");
        svg.appendChild(outputText);

        // Step 4: Build the balanced BST
        await displayMessage("Building the balanced BST...", 'info');
        this.root = this._buildBalancedBST(nodes, 0, nodes.length - 1);

        // Step 5: Animate the insertion of the balanced BST
        await displayMessage("Drawing the balanced BST...", 'info');
        await this.animateBalancedTreeInsertion(this.root, 500, 50, 250);

        // Step 6: Final confirmation
        await displayMessage("BST has been converted to a balanced BST, yaar!", 'success');
        return { success: true, message: "BST has been converted to a balanced BST." };
    }

    _buildBalancedBST(nodes, start, end) {
        if (start > end) return null;
        let mid = Math.floor((start + end) / 2);
        let node = new TreeNode(nodes[mid]);
        node.left = this._buildBalancedBST(nodes, start, mid - 1);
        node.right = this._buildBalancedBST(nodes, mid + 1, end);
        return node;
    }

    async findDepth(value) {
        if (!this._search(this.root, value)) {
            await displayMessage(`Node ${value} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value} does not exist in the BST.` };
        }
        let depth = this._findDepth(this.root, value, 0);
        await displayMessage(`The depth of node ${value} is ${depth}.`, 'success');
        return { found: true, depth: depth, message: `The depth of node ${value} is ${depth}.` };
    }

    _findDepth(node, value, depth) {
        if (!node) return -1;
        if (node.value === value) return depth;
        return value < node.value ? this._findDepth(node.left, value, depth + 1) : this._findDepth(node.right, value, depth + 1);
    }

    async findSuccessor(value) {
        if (!this._search(this.root, value)) {
            await displayMessage(`Node ${value} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value} does not exist in the BST.` };
        }
        let nodes = []; this.inorder(this.root, nodes);
        let index = nodes.indexOf(value);
        if (index === -1 || index === nodes.length - 1) {
            await displayMessage(`Node ${value} has no inorder successor.`, 'warning');
            return { found: true, hasSuccessor: false, message: `Node ${value} has no inorder successor.` };
        }
        let successor = nodes[index + 1];
        await displayMessage(`The inorder successor of ${value} is ${successor}.`, 'success');
        return { found: true, hasSuccessor: true, successor: successor, message: `The inorder successor of ${value} is ${successor}.` };
    }

    async findPredecessor(value) {
        if (!this._search(this.root, value)) {
            await displayMessage(`Node ${value} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value} does not exist in the BST.` };
        }
        let nodes = []; this.inorder(this.root, nodes);
        let index = nodes.indexOf(value);
        if (index === -1 || index === 0) {
            await displayMessage(`Node ${value} has no inorder predecessor.`, 'warning');
            return { found: true, hasPredecessor: false, message: `Node ${value} has no inorder predecessor.` };
        }
        let predecessor = nodes[index - 1];
        await displayMessage(`The inorder predecessor of ${value} is ${predecessor}.`, 'success');
        return { found: true, hasPredecessor: true, predecessor: predecessor, message: `The inorder predecessor of ${value} is ${predecessor}.` };
    }

    async findAncestors(value) {
        if (!this._search(this.root, value)) {
            await displayMessage(`Node ${value} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value} does not exist in the BST.` };
        }
        let ancestors = [];
        this._findAncestors(this.root, value, ancestors);
        await displayMessage(ancestors.length === 0 ? `Node ${value} is the root and has no ancestors.` : `The ancestors of ${value} are ${ancestors.join(' --> ')}.`, ancestors.length === 0 ? 'warning' : 'success');
        return ancestors.length === 0 
            ? { found: true, hasAncestors: false, message: `Node ${value} is the root and has no ancestors.` }
            : { found: true, hasAncestors: true, ancestors: ancestors, message: `The ancestors of ${value} are ${ancestors.join(' --> ')}.` };
    }

    _findAncestors(node, value, ancestors) {
        if (!node) return false;
        if (node.value === value) return true;
        if (value < node.value) {
            ancestors.push(node.value);
            return this._findAncestors(node.left, value, ancestors);
        } else {
            ancestors.push(node.value);
            return this._findAncestors(node.right, value, ancestors);
        }
    }

    async findLCA(value1, value2) {
        if (!this._search(this.root, value1)) {
            await displayMessage(`Node ${value1} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value1} does not exist in the BST.` };
        }
        if (!this._search(this.root, value2)) {
            await displayMessage(`Node ${value2} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value2} does not exist in the BST.` };
        }
        let lca = this._findLCA(this.root, value1, value2);
        await displayMessage(`The lowest common ancestor of ${value1} and ${value2} is ${lca}.`, 'success');
        return { found: true, lca: lca, message: `The lowest common ancestor of ${value1} and ${value2} is ${lca}.` };
    }

    _findLCA(node, value1, value2) {
        if (!node) return null;
        if (node.value > value1 && node.value > value2) return this._findLCA(node.left, value1, value2);
        if (node.value < value1 && node.value < value2) return this._findLCA(node.right, value1, value2);
        return node.value;
    }

    async preorder(node, result = []) {
        if (!node) return;
        let pos = this.positions.get(node.value);
        if (pos) {
            await highlightNode(pos.x, pos.y, node.value, "highlight");
            await displayMessage(`Preorder: visiting node ${node.value}`, 'info');
        }
        result.push(node.value);
        await this.preorder(node.left, result);
        await this.preorder(node.right, result);
        return result;
    }

    async inorderTraversal(node, result = []) {
        if (!node) return;
        await this.inorderTraversal(node.left, result);
        let pos = this.positions.get(node.value);
        if (pos) {
            await highlightNode(pos.x, pos.y, node.value, "highlight");
            await displayMessage(`Inorder: visiting node ${node.value}`, 'info');
        }
        result.push(node.value);
        await this.inorderTraversal(node.right, result);
        return result;
    }

    async postorder(node, result = []) {
        if (!node) return;
        await this.postorder(node.left, result);
        await this.postorder(node.right, result);
        let pos = this.positions.get(node.value);
        if (pos) {
            await highlightNode(pos.x, pos.y, node.value, "highlight");
            await displayMessage(`Postorder: visiting node ${node.value}`, 'info');
        }
        result.push(node.value);
        return result;
    }

    async levelOrder(node, result = []) {
        if (!node) return result;
        let queue = [node];
        while (queue.length > 0) {
            let current = queue.shift();
            let pos = this.positions.get(current.value);
            if (pos) {
                await highlightNode(pos.x, pos.y, current.value, "highlight");
                await displayMessage(`Level order: visiting node ${current.value}`, 'info');
            }
            result.push(current.value);
            if (current.left) queue.push(current.left);
            if (current.right) queue.push(current.right);
        }
        return result;
    }

    async checkIfBST() {
        if (!this.root) {
            await displayMessage("The tree is empty, which is a valid BST.", 'warning');
            return { isBST: true, message: "The tree is empty, which is a valid BST." };
        }
        let isBST = this._checkIfBST(this.root, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        await displayMessage(isBST ? "The tree is a valid BST." : "The tree is not a valid BST.", isBST ? 'success' : 'error');
        return { isBST: isBST, message: isBST ? "The tree is a valid BST." : "The tree is not a valid BST." };
    }

    _checkIfBST(node, min, max) {
        if (!node) return true;
        if (node.value <= min || node.value >= max) return false;
        return this._checkIfBST(node.left, min, node.value) && this._checkIfBST(node.right, node.value, max);
    }

    async findMinLeftSubtree() {
        if (!this.root) {
            await displayMessage("The BST is empty, na.", 'warning');
            return { found: false, message: "The BST is empty." };
        }
        if (!this.root.left) {
            await displayMessage("Root has no left subtree.", 'warning');
            return { found: true, hasSubtree: false, message: "Root has no left subtree." };
        }
        let minValue = this._getMin(this.root.left).value;
        let pos = this.positions.get(minValue);
        await highlightNode(pos.x, pos.y, minValue, "search-highlight");
        await displayMessage(`The minimum value in the left subtree of the root is ${minValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, minValue: minValue, message: `The minimum value in the left subtree of the root is ${minValue}.` };
    }

    async findMaxLeftSubtree() {
        if (!this.root) {
            await displayMessage("The BST is empty, na.", 'warning');
            return { found: false, message: "The BST is empty." };
        }
        if (!this.root.left) {
            await displayMessage("Root has no left subtree.", 'warning');
            return { found: true, hasSubtree: false, message: "Root has no left subtree." };
        }
        let maxValue = this._getMax(this.root.left).value;
        let pos = this.positions.get(maxValue);
        await highlightNode(pos.x, pos.y, maxValue, "search-highlight");
        await displayMessage(`The maximum value in the left subtree of the root is ${maxValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, maxValue: maxValue, message: `The maximum value in the left subtree of the root is ${maxValue}.` };
    }

    async findMinRightSubtree() {
        if (!this.root) {
            await displayMessage("The BST is empty, na.", 'warning');
            return { found: false, message: "The BST is empty." };
        }
        if (!this.root.right) {
            await displayMessage("Root has no right subtree.", 'warning');
            return { found: true, hasSubtree: false, message: "Root has no right subtree." };
        }
        let minValue = this._getMin(this.root.right).value;
        let pos = this.positions.get(minValue);
        await highlightNode(pos.x, pos.y, minValue, "search-highlight");
        await displayMessage(`The minimum value in the right subtree of the root is ${minValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, minValue: minValue, message: `The minimum value in the right subtree of the root is ${minValue}.` };
    }

    async findMaxRightSubtree() {
        if (!this.root) {
            await displayMessage("The BST is empty, na.", 'warning');
            return { found: false, message: "The BST is empty." };
        }
        if (!this.root.right) {
            await displayMessage("Root has no right subtree.", 'warning');
            return { found: true, hasSubtree: false, message: "Root has no right subtree." };
        }
        let maxValue = this._getMax(this.root.right).value;
        let pos = this.positions.get(maxValue);
        await highlightNode(pos.x, pos.y, maxValue, "search-highlight");
        await displayMessage(`The maximum value in the right subtree of the root is ${maxValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, maxValue: maxValue, message: `The maximum value in the right subtree of the root is ${maxValue}.` };
    }

    async _findNodeWithAnimation(node, value, x, y, offset) {
        if (!node) return null;

        await highlightNode(x, y, node.value, "highlight");
        if (node.value === value) {
            await highlightNode(x, y, node.value, "search-highlight");
            return node;
        }

        if (value < node.value) {
            await displayMessage(`Value ${value} < ${node.value}, moving left.`, 'info');
            await animateLine(x, y, x - offset, y + 70);
            return this._findNodeWithAnimation(node.left, value, x - offset, y + 70, offset / 2);
        } else {
            await displayMessage(`Value ${value} > ${node.value}, moving right.`, 'info');
            await animateLine(x, y, x + offset, y + 70);
            return this._findNodeWithAnimation(node.right, value, x + offset, y + 70, offset / 2);
        }
    }

    async calculateSum() {
        if (!this.root) {
            await displayMessage("The BST is empty, na.", 'warning');
            return { found: false, message: "The BST is empty." };
        }
        let sum = await this._calculateSumWithAnimation(this.root);
        await displayMessage(`The sum of all nodes in the BST is ${sum}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, sum: sum, message: `The sum of all nodes in the BST is ${sum}.` };
    }

    async _calculateSumWithAnimation(node) {
        if (!node) return 0;
        let pos = this.positions.get(node.value);
        if (pos) {
            await highlightNode(pos.x, pos.y, node.value, "search-highlight");
            await displayMessage(`Adding node ${node.value} to the sum...`, 'info');
        }
        let leftSum = await this._calculateSumWithAnimation(node.left);
        let rightSum = await this._calculateSumWithAnimation(node.right);
        return node.value + leftSum + rightSum;
    }

    async findDiameter(value1, value2) {
        if (!this.root) {
            await displayMessage("The BST is empty, na.", 'warning');
            return { found: false, message: "The BST is empty." };
        }
        
        if (!this._search(this.root, value1)) {
            await displayMessage(`Node ${value1} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value1} does not exist in the BST.` };
        }
        
        if (!this._search(this.root, value2)) {
            await displayMessage(`Node ${value2} does not exist in the BST.`, 'error');
            return { found: false, message: `Node ${value2} does not exist in the BST.` };
        }

        // Find the Lowest Common Ancestor (LCA)
        let lca = this._findLCA(this.root, value1, value2);
        
        // Calculate distances from LCA to both nodes
        let distance1 = await this._findDistanceWithAnimation(this.root, value1, lca, 500, 50, 250);
        let distance2 = await this._findDistanceWithAnimation(this.root, value2, lca, 500, 50, 250);

        // Handle case where distance might be -1 (shouldn't happen with valid nodes)
        if (distance1 < 0 || distance2 < 0) {
            await displayMessage("Error calculating distance between nodes.", 'error');
            return { found: false, message: "Error calculating distance between nodes." };
        }

        let totalDistance = distance1 + distance2;

        await displayMessage(`The distance between ${value1} and ${value2} is ${totalDistance} nodes.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        
        return { 
            found: true, 
            distance: totalDistance, 
            message: `The diameter between ${value1} and ${value2} is ${totalDistance}` 
        };
    }
    _findDiameterWithAnimation(node) {
        if (!node) return { height: -1, diameter: 0 };

        let left = this._findDiameterWithAnimation(node.left);
        let right = this._findDiameterWithAnimation(node.right);

        let height = Math.max(left.height, right.height) + 1;
        let diameterThroughRoot = left.height + right.height + 2; // Path through current node
        let maxDiameter = Math.max(diameterThroughRoot, left.diameter, right.diameter);

        return { height: height, diameter: maxDiameter };
    }
    async _findDistanceWithAnimation(node, targetValue, stopValue, x, y, offset) {
        if (!node) return -1; // Return -1 if we hit a null node (shouldn't happen with valid inputs)
        
        let pos = this.positions.get(node.value);
        if (pos) {
            await highlightNode(pos.x, pos.y, node.value, "search-highlight");
            await displayMessage(`Checking node ${node.value} on path to ${targetValue}...`, 'info');
            await delay(500);
        }

        // If we reach the target value, return 0 (distance from target to itself is 0)
        if (node.value === targetValue) {
            return 0;
        }

        // If we reach the LCA (stopValue), start counting distance to target
        if (node.value === stopValue) {
            if (targetValue < node.value) {
                await animateLine(x, y, x - offset, y + 70);
                let leftDistance = await this._findDistanceWithAnimation(node.left, targetValue, node.value, x - offset, y + 70, offset / 2);
                return leftDistance === -1 ? -1 : leftDistance + 1; // Add 1 for the edge from LCA
            } else if (targetValue > node.value) {
                await animateLine(x, y, x + offset, y + 70);
                let rightDistance = await this._findDistanceWithAnimation(node.right, targetValue, node.value, x + offset, y + 70, offset / 2);
                return rightDistance === -1 ? -1 : rightDistance + 1; // Add 1 for the edge from LCA
            }
            return 0; // If targetValue equals stopValue (LCA is target)
        }

        // Continue searching towards the LCA or target
        let distance;
        if (targetValue < node.value) {
            await animateLine(x, y, x - offset, y + 70);
            distance = await this._findDistanceWithAnimation(node.left, targetValue, stopValue, x - offset, y + 70, offset / 2);
        } else {
            await animateLine(x, y, x + offset, y + 70);
            distance = await this._findDistanceWithAnimation(node.right, targetValue, stopValue, x + offset, y + 70, offset / 2);
        }

        // Increment distance only if a valid path is found
        return distance === -1 ? -1 : distance + 1;
    }
    render() {
        let svg = document.getElementById("bstTree");
        svg.setAttribute("width", currentLayout === 'radial' ? "1000" : "1000");
        svg.setAttribute("height", currentLayout === 'radial' ? "600" : "600");
        svg.setAttribute("viewBox", currentLayout === 'radial' ? "0 0 1000 600" : "0 0 1000 600");
        svg.innerHTML = "";
        this.positions.clear();
        if (this.root) {
            switch (currentLayout) {
                case 'standard':
                    this._renderStandard(svg, this.root, 500, 50, 250);
                    break;
                case 'vertical':
                    this._renderVertical(svg, this.root, 500, 50, 100);
                    break;
                case 'horizontal':
                    this._renderHorizontal(svg, this.root, 50, 300, 100);
                    break;
                case 'radial':
                    this._renderRadial(svg, this.root, 500, 300, 0, 2 * Math.PI, 150);
                    break;
            }
        }
        let outputText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        outputText.setAttribute("id", "output-text");
        outputText.setAttribute("x", "500");
        outputText.setAttribute("y", "480");
        outputText.setAttribute("text-anchor", "middle");
        svg.appendChild(outputText);
    }
    
    _renderStandard(svg, node, x, y, offset) {
        if (!node) return;
        this.positions.set(node.value, { x, y });
        if (node.left) {
            this._drawLine(svg, x, y, x - offset, y + 70);
            this._renderStandard(svg, node.left, x - offset, y + 70, offset / 2);
        }
        if (node.right) {
            this._drawLine(svg, x, y, x + offset, y + 70);
            this._renderStandard(svg, node.right, x + offset, y + 70, offset / 2);
        }
        this._drawNode(svg, x, y, node.value);
    }
    
    _renderVertical(svg, node, x, y, offset) {
        if (!node) return;
        this.positions.set(node.value, { x, y });
        if (node.left) {
            this._drawLine(svg, x, y, x, y + offset);
            this._renderVertical(svg, node.left, x, y + offset, offset);
        }
        if (node.right) {
            this._drawLine(svg, x, y + offset, x, y + 2 * offset);
            this._renderVertical(svg, node.right, x, y + 2 * offset, offset);
        }
        this._drawNode(svg, x, y, node.value);
    }
    
    _renderHorizontal(svg, node, x, y, offset) {
        if (!node) return;
        this.positions.set(node.value, { x, y });
        if (node.left) {
            this._drawLine(svg, x, y, x + offset, y);
            this._renderHorizontal(svg, node.left, x + offset, y, offset);
        }
        if (node.right) {
            this._drawLine(svg, x + offset, y, x + 2 * offset, y);
            this._renderHorizontal(svg, node.right, x + 2 * offset, y, offset);
        }
        this._drawNode(svg, x, y, node.value);
    }
    
    _renderRadial(svg, node, cx, cy, startAngle, endAngle, radius) {
        if (!node) return;
        const angle = (startAngle + endAngle) / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        this.positions.set(node.value, { x, y });
    
        if (node.left || node.right) {
            const angleRange = (endAngle - startAngle) / 2;
            if (node.left) {
                this._drawLine(svg, cx, cy, x, y);
                this._renderRadial(svg, node.left, cx, cy, startAngle, startAngle + angleRange, radius - 50);
            }
            if (node.right) {
                this._drawLine(svg, cx, cy, x, y);
                this._renderRadial(svg, node.right, cx, cy, startAngle + angleRange, endAngle, radius - 50);
            }
        }
        this._drawNode(svg, x, y, node.value);
    }
    
    _drawNode(svg, x, y, value) {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x); circle.setAttribute("cy", y); circle.setAttribute("r", 20);
        circle.classList.add("node");
        svg.appendChild(circle);
    
        let floatAnimate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        floatAnimate.setAttribute("attributeName", "transform");
        floatAnimate.setAttribute("type", "translate");
        floatAnimate.setAttribute("values", "0,0;0,-5;0,0");
        floatAnimate.setAttribute("dur", "3s");
        floatAnimate.setAttribute("repeatCount", "indefinite");
        circle.appendChild(floatAnimate);
    
        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x); text.setAttribute("y", y + 5);
        text.setAttribute("text-anchor", "middle"); text.textContent = value;
        svg.appendChild(text);
    }
    
    _drawLine(svg, x1, y1, x2, y2) {
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x2); line.setAttribute("y2", y2);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-dasharray", "5, 5");
        svg.appendChild(line);
    }
}

let bst = new BST();

// Make the visualization box draggable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Initialize draggable visualization box
document.addEventListener('DOMContentLoaded', function() {
    const visualizationBox = document.getElementById('visualizationBox');
    makeDraggable(visualizationBox);
    
    // Add drag and drop functionality for operation items
    const items = document.querySelectorAll('.visualization-item');
    items.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-operation'));
        });
    });
    
    // Add drop target for the tree container
    const treeContainer = document.getElementById('tree-container');
    treeContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    treeContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        const operation = e.dataTransfer.getData('text/plain');
        handleOperationDrop(operation);
    });
});

function handleOperationDrop(operation) {
    switch(operation) {
        case 'insert':
            insertNode();
            break;
        case 'delete':
            deleteNode();
            break;
        case 'search':
            searchNode();
            break;
        case 'findMin':
            findMinNode();
            break;
        case 'findMax':
            findMaxNode();
            break;
        case 'findSibling':
            findSibling();
            break;
        case 'preorder':
            preorderTraversal();
            break;
        case 'inorder':
            inorderTraversal();
            break;
        case 'postorder':
            postorderTraversal();
            break;
        case 'levelOrder':
            levelOrderTraversal();
            break;
        case 'findHeight':
            findHeight();
            break;
        case 'balanceBST':
            convertToBalancedBST();
            break;
        case 'findDepth':
            findDepth();
            break;
        case 'findSuccessor':
            findSuccessor();
            break;
        case 'findPredecessor':
            findPredecessor();
            break;
        case 'findAncestors':
            findAncestors();
            break;
        case 'checkIfBST':
            checkIfBST();
            break;
        case 'findMinLeftSubtree':
            findMinLeftSubtree();
            break;
        case 'findMaxLeftSubtree':
            findMaxLeftSubtree();
            break;
        case 'findMinRightSubtree':
            findMinRightSubtree();
            break;
        case 'findMaxRightSubtree':
            findMaxRightSubtree();
            break;
        case 'sumOfNodes':
            calculateSum();
            break;
        case 'findDiameter':
            findDiameter();
            break;
        case 'findLCA':
            findLCA();
            break;
        default:
            console.log('Unknown operation:', operation);
    }
}

async function insertNode() { 
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Inserting node...", 'info');
    await bst.insert(value);
    inputField.disabled = false;
}

async function searchNode() { 
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Searching for node...", 'info');
    await bst.search(value);
    inputField.disabled = false;
}

async function deleteNode() { 
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Deleting node...", 'info');
    await bst.delete(value);
    inputField.disabled = false;
}

async function findMinNode() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding minimum node...", 'info');
    let minValue = bst.findMin();
    await displayMessage(minValue !== null ? `The minimum node in the BST is ${minValue}.` : "The BST is empty.", minValue !== null ? 'success' : 'warning');
    inputField.disabled = false;
}

async function findMaxNode() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding maximum node...", 'info');
    let maxValue = bst.findMax();
    await displayMessage(maxValue !== null ? `The maximum node in the BST is ${maxValue}.` : "The BST is empty.", maxValue !== null ? 'success' : 'warning');
    inputField.disabled = false;
}

async function findSibling() {
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding sibling...", 'info');
    let result = await bst.findSibling(value);
    await displayMessage(result.message, result.found && result.hasSibling ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function findHeight() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding height...", 'info');
    let height = bst.findHeight();
    await displayMessage(height >= 0 ? `The height of the BST is ${height}.` : "The BST is empty.", height >= 0 ? 'success' : 'warning');
    inputField.disabled = false;
}

async function convertToBalancedBST() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Converting to balanced BST...", 'info');
    let result = await bst.convertToBalancedBST();
    await displayMessage(result.message, result.success ? 'success' : result.success === false && result.message.includes("already balanced") ? 'success' : 'warning');
    inputField.disabled = false;
}

async function findDepth() {
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding depth...", 'info');
    let result = await bst.findDepth(value);
    await displayMessage(result.message, result.found ? 'success' : 'error');
    inputField.disabled = false;
}

async function findSuccessor() {
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding successor...", 'info');
    let result = await bst.findSuccessor(value);
    await displayMessage(result.message, result.found && result.hasSuccessor ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function findPredecessor() {
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding predecessor...", 'info');
    let result = await bst.findPredecessor(value);
    await displayMessage(result.message, result.found && result.hasPredecessor ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function findAncestors() {
    let value = parseInt(document.getElementById('nodeValue').value);
    if (isNaN(value)) {
        await displayMessage("Please enter a valid number.", 'error');
        return;
    }

    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding ancestors...", 'info');
    let result = await bst.findAncestors(value);
    await displayMessage(result.message, result.found && result.hasAncestors ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function findLCA() {
    let value1 = parseInt(document.getElementById('nodeValue1').value);
    let value2 = parseInt(document.getElementById('nodeValue2').value);
    if (isNaN(value1) || isNaN(value2)) {
        await displayMessage("Please enter valid numbers for both values.", 'error');
        return;
    }

    let inputField1 = document.getElementById('nodeValue1');
    let inputField2 = document.getElementById('nodeValue2');
    inputField1.disabled = true; inputField2.disabled = true;
    await displayMessage("Finding lowest common ancestor...", 'info');
    let result = await bst.findLCA(value1, value2);
    await displayMessage(result.message, result.found ? 'success' : 'error');
    inputField1.disabled = false; inputField2.disabled = false;
}

async function checkIfBST() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Checking if the tree is a valid BST...", 'info');
    let result = await bst.checkIfBST();
    await displayMessage(result.message, result.isBST ? 'success' : 'error');
    inputField.disabled = false;
}

async function preorderTraversal() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Performing preorder traversal...", 'info');
    let result = await bst.preorder(bst.root) || [];
    await displayMessage(result.length ? `Preorder Traversal (Root → Left → Right): ${result.join(' --> ')}` : "BST is empty.", result.length ? 'success' : 'warning');
    await resetNodeStyles();
    inputField.disabled = false;
}

async function inorderTraversal() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Performing inorder traversal...", 'info');
    let result = await bst.inorderTraversal(bst.root) || [];
    await displayMessage(result.length ? `Inorder Traversal (Left → Root → Right): ${result.join(' --> ')}` : "BST is empty.", result.length ? 'success' : 'warning');
    await resetNodeStyles();
    inputField.disabled = false;
}

async function postorderTraversal() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Performing postorder traversal...", 'info');
    let result = await bst.postorder(bst.root) || [];
    await displayMessage(result.length ? `Postorder Traversal (Left → Right → Root): ${result.join(' --> ')}` : "BST is empty.", result.length ? 'success' : 'warning');
    await resetNodeStyles();
    inputField.disabled = false;
}

async function levelOrderTraversal() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Performing level order traversal...", 'info');
    let result = await bst.levelOrder(bst.root) || [];
    await displayMessage(result.length ? `Level Order Traversal (BFS, Top to Bottom): ${result.join(' --> ')}` : "BST is empty.", result.length ? 'success' : 'warning');
    await resetNodeStyles();
    inputField.disabled = false;
}

async function findMinLeftSubtree() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding minimum in left subtree of root...", 'info');
    let result = await bst.findMinLeftSubtree();
    await displayMessage(result.message, result.found && result.hasSubtree ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function findMaxLeftSubtree() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding maximum in left subtree of root...", 'info');
    let result = await bst.findMaxLeftSubtree();
    await displayMessage(result.message, result.found && result.hasSubtree ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function findMinRightSubtree() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding minimum in right subtree of root...", 'info');
    let result = await bst.findMinRightSubtree();
    await displayMessage(result.message, result.found && result.hasSubtree ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function findMaxRightSubtree() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Finding maximum in right subtree of root...", 'info');
    let result = await bst.findMaxRightSubtree();
    await displayMessage(result.message, result.found && result.hasSubtree ? 'success' : result.found ? 'warning' : 'error');
    inputField.disabled = false;
}

async function calculateSum() {
    let inputField = document.getElementById('nodeValue');
    inputField.disabled = true;
    await displayMessage("Calculating sum of all nodes...", 'info');
    let result = await bst.calculateSum();
    await displayMessage(result.message, result.found ? 'success' : 'warning');
    inputField.disabled = false;
}

async function findDiameter() {
    let value1 = parseInt(document.getElementById('nodeValue1').value);
    let value2 = parseInt(document.getElementById('nodeValue2').value);
    
    if (isNaN(value1) || isNaN(value2)) {
        await displayMessage("Please enter valid numbers for both nodes.", 'error');
        return;
    }

    let inputField1 = document.getElementById('nodeValue1');
    let inputField2 = document.getElementById('nodeValue2');
    inputField1.disabled = true;
    inputField2.disabled = true;
    
    await displayMessage(`Finding diameter between ${value1} and ${value2}...`, 'info');
    let result = await bst.findDiameter(value1, value2);
    await displayMessage(result.message, result.found ? 'success' : 'error');
    
    inputField1.disabled = false;
    inputField2.disabled = false;
}
