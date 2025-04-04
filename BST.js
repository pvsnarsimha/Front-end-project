// BST.js
$(function () { $('[data-toggle="tooltip"]').tooltip(); });

let animationQueue = Promise.resolve();

// Speech Synthesis Setup
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

async function displayMessage(message, type = 'info') {
    animationQueue = animationQueue.then(async () => {
        await showMessageBox(message, type);
    });
    return animationQueue;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Animation Functions with Mobile Support
async function highlightNode(x, y, value, highlightClass = "highlight") {
    animationQueue = animationQueue.then(async () => {
        let svg = document.getElementById("bstTree");
        let circle = Array.from(svg.getElementsByTagName("circle")).find(c => 
            c.getAttribute("cx") == x && c.getAttribute("cy") == y);
        let text = Array.from(svg.getElementsByTagName("text")).find(t => 
            t.getAttribute("x") == x && t.getAttribute("y") == (y + 5));
        if (circle) {
            circle.classList.add(highlightClass);
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
            circle.classList.add("moving-node");
            text.classList.add("highlighted-text");

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

            bst.positions.set(nodeValue, { x: toX, y: toY });

            await delay(1000);
            circle.classList.remove("moving-node");
            text.classList.remove("highlighted-text");
        }
    });
    return animationQueue;
}

// BST Class with Mobile Adjustments
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

    // Adjust coordinates based on zoom and pan from HTML script
    adjustCoordinates(x, y, scale, translateX, translateY) {
        return {
            x: (x * scale) + translateX,
            y: (y * scale) + translateY
        };
    }

    async insert(value) {
        if (this._search(this.root, value)) {
            await displayMessage(`Node ${value} already exists in the BST.`, 'warning');
            return { success: false, message: `Node ${value} already exists in the BST.` };
        }
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        const baseX = 500 / scale, baseY = 50 / scale, baseOffset = 250 / scale;
        this.root = await this._insertWithAnimation(this.root, value, baseX, baseY, baseOffset, scale, translateX, translateY);
        this.render();
        await displayMessage(`Inserted ${value} into the BST.`, 'success');
        return { success: true, message: `Inserted ${value} into the BST.` };
    }

    async _insertWithAnimation(node, value, x, y, offset, scale, translateX, translateY) {
        if (!node) {
            const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
            this.positions.set(value, { x, y });
            await animateNodeInsertion(adjusted.x, adjusted.y, value);
            return new TreeNode(value);
        }

        const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, node.value);
        if (value < node.value) {
            await displayMessage(`Value ${value} < ${node.value}, moving left.`, 'info');
            const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            node.left = await this._insertWithAnimation(node.left, value, x - offset, y + 70, offset / 2, scale, translateX, translateY);
        } else if (value > node.value) {
            await displayMessage(`Value ${value} > ${node.value}, moving right.`, 'info');
            const nextAdjusted = this.adjustCoordinates(x + offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            node.right = await this._insertWithAnimation(node.right, value, x + offset, y + 70, offset / 2, scale, translateX, translateY);
        }
        return node;
    }

    async search(value) {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        const baseX = 500 / scale, baseY = 50 / scale, baseOffset = 250 / scale;
        let result = await this._searchWithAnimation(this.root, value, baseX, baseY, baseOffset, scale, translateX, translateY);
        await displayMessage(result.found ? `Value ${value} found!` : `Value ${value} not found.`, result.found ? 'success' : 'error');
        await delay(1000);
        await resetNodeStyles();
        return result;
    }

    async _searchWithAnimation(node, value, x, y, offset, scale, translateX, translateY) {
        if (!node) return { found: false };

        const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, node.value, "highlight");
        if (node.value === value) {
            await highlightNode(adjusted.x, adjusted.y, node.value, "search-highlight");
            return { found: true };
        }

        if (value < node.value) {
            await displayMessage(`Value ${value} < ${node.value}, moving left.`, 'info');
            const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            return this._searchWithAnimation(node.left, value, x - offset, y + 70, offset / 2, scale, translateX, translateY);
        } else {
            await displayMessage(`Value ${value} > ${node.value}, moving right.`, 'info');
            const nextAdjusted = this.adjustCoordinates(x + offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            return this._searchWithAnimation(node.right, value, x + offset, y + 70, offset / 2, scale, translateX, translateY);
        }
    }

    async delete(value) {
        if (!this._search(this.root, value)) {
            await displayMessage(`Node ${value} does not exist in the BST.`, 'error');
            return;
        }
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        const baseX = 500 / scale, baseY = 50 / scale, baseOffset = 250 / scale;
        this.root = await this._deleteWithAnimation(this.root, value, baseX, baseY, baseOffset, scale, translateX, translateY);
        this.render();
        await displayMessage(`Node ${value} deleted successfully.`, 'success');
    }

    async _deleteWithAnimation(node, value, x, y, offset, scale, translateX, translateY) {
        if (!node) return null;

        const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, node.value, "highlight");
        if (value < node.value) {
            await displayMessage(`Value ${value} < ${node.value}, moving left.`, 'info');
            const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            node.left = await this._deleteWithAnimation(node.left, value, x - offset, y + 70, offset / 2, scale, translateX, translateY);
        } else if (value > node.value) {
            await displayMessage(`Value ${value} > ${node.value}, moving right.`, 'info');
            const nextAdjusted = this.adjustCoordinates(x + offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            node.right = await this._deleteWithAnimation(node.right, value, x + offset, y + 70, offset / 2, scale, translateX, translateY);
        } else {
            await displayMessage(`Found node ${value}, deleting...`, 'info');
            await highlightNode(adjusted.x, adjusted.y, node.value, "delete-highlight");

            if (!node.left) {
                await animateNodeDeletion(adjusted.x, adjusted.y);
                return node.right;
            }
            if (!node.right) {
                await animateNodeDeletion(adjusted.x, adjusted.y);
                return node.left;
            }

            await displayMessage(`Node ${value} has two children, finding minimum in right subtree...`, 'info');
            let minLargerNode = await this._getMinWithAnimation(node.right, x + offset, y + 70, offset / 2, scale, translateX, translateY);
            
            let oldPos = this.positions.get(node.value);
            let newPos = this.positions.get(minLargerNode.value);
            if (oldPos && newPos) {
                const adjustedOld = this.adjustCoordinates(oldPos.x, oldPos.y, scale, translateX, translateY);
                const adjustedNew = this.adjustCoordinates(newPos.x, newPos.y, scale, translateX, translateY);
                await animateNodeMovement(minLargerNode.value, adjustedNew.x, adjustedNew.y, adjustedOld.x, adjustedOld.y);
                this.positions.set(minLargerNode.value, { x: oldPos.x, y: oldPos.y });
            }
            
            node.value = minLargerNode.value;
            await displayMessage(`Replacing ${value} with ${minLargerNode.value}.`, 'info');
            node.right = await this._deleteWithAnimation(node.right, minLargerNode.value, x + offset, y + 70, offset / 2, scale, translateX, translateY);
        }
        return node;
    }

    async _getMinWithAnimation(node, x, y, offset, scale, translateX, translateY) {
        while (node && node.left) {
            const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
            await highlightNode(adjusted.x, adjusted.y, node.value);
            await displayMessage(`Finding minimum, moving left from ${node.value}.`, 'info');
            const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            node = node.left;
            x -= offset; y += 70; offset /= 2;
        }
        const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, node.value, "search-highlight");
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
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        let positions = this.collectPositions(this.root);
        let lines = this.collectLines(this.root, 500 / scale, 50 / scale, 250 / scale);
        lines.sort((a, b) => b.y2 - a.y2);
        for (let line of lines) {
            const adjustedStart = this.adjustCoordinates(line.x1, line.y1, scale, translateX, translateY);
            const adjustedEnd = this.adjustCoordinates(line.x2, line.y2, scale, translateX, translateY);
            await animateLineDeletion(adjustedStart.x, adjustedStart.y, adjustedEnd.x, adjustedEnd.y);
        }
        positions.sort((a, b) => b.y - a.y);
        for (let pos of positions) {
            const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
            await highlightNode(adjusted.x, adjusted.y, pos.value, "delete-highlight");
            await displayMessage(`Removing node ${pos.value}...`, 'info');
            await animateNodeDeletion(adjusted.x, adjusted.y);
        }
    }

    async animateBalancedTreeInsertion(node, x, y, offset) {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        if (!node) return;
        const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
        this.positions.set(node.value, { x, y });
        await displayMessage(`Inserting node ${node.value} in the balanced BST...`, 'info');
        await animateNodeInsertion(adjusted.x, adjusted.y, node.value);

        if (node.left) {
            const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            await this.animateBalancedTreeInsertion(node.left, x - offset, y + 70, offset / 2);
        }
        if (node.right) {
            const nextAdjusted = this.adjustCoordinates(x + offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            await this.animateBalancedTreeInsertion(node.right, x + offset, y + 70, offset / 2);
        }
    }

    async convertToBalancedBST() {
        if (!this.root) {
            await displayMessage("The BST is empty, na. Nothing to balance.", 'warning');
            return { success: false, message: "The BST is empty. Nothing to balance." };
        }

        let balanceCheck = await this.checkIfBalanced();
        if (balanceCheck.isBalanced) {
            await displayMessage("The BST is already balanced, yaar!", 'success');
            return { success: false, message: "The BST is already balanced." };
        }

        await displayMessage("BST is not balanced, converting to balanced BST...", 'info');
        let nodes = [];
        this.inorder(this.root, nodes);
        await displayMessage(`Nodes in sorted order: ${nodes.join(' --> ')}`, 'info');

        await displayMessage("Removing the current unbalanced tree...", 'info');
        await this.animateTreeRemoval();

        let svg = document.getElementById("bstTree");
        svg.innerHTML = "";
        this.positions.clear();

        let outputText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        outputText.setAttribute("id", "output-text");
        outputText.setAttribute("x", "500");
        outputText.setAttribute("y", "480");
        outputText.setAttribute("text-anchor", "middle");
        svg.appendChild(outputText);

        await displayMessage("Building the balanced BST...", 'info');
        this.root = this._buildBalancedBST(nodes, 0, nodes.length - 1);

        const scale = window.scale || 1;
        await displayMessage("Drawing the balanced BST...", 'info');
        await this.animateBalancedTreeInsertion(this.root, 500 / scale, 50 / scale, 250 / scale);

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
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        if (!node) return;
        let pos = this.positions.get(node.value);
        if (pos) {
            const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
            await highlightNode(adjusted.x, adjusted.y, node.value, "highlight");
            await displayMessage(`Preorder: visiting node ${node.value}`, 'info');
        }
        result.push(node.value);
        await this.preorder(node.left, result);
        await this.preorder(node.right, result);
        return result;
    }

    async inorderTraversal(node, result = []) {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        if (!node) return;
        await this.inorderTraversal(node.left, result);
        let pos = this.positions.get(node.value);
        if (pos) {
            const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
            await highlightNode(adjusted.x, adjusted.y, node.value, "highlight");
            await displayMessage(`Inorder: visiting node ${node.value}`, 'info');
        }
        result.push(node.value);
        await this.inorderTraversal(node.right, result);
        return result;
    }

    async postorder(node, result = []) {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        if (!node) return;
        await this.postorder(node.left, result);
        await this.postorder(node.right, result);
        let pos = this.positions.get(node.value);
        if (pos) {
            const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
            await highlightNode(adjusted.x, adjusted.y, node.value, "highlight");
            await displayMessage(`Postorder: visiting node ${node.value}`, 'info');
        }
        result.push(node.value);
        return result;
    }

    async levelOrder(node, result = []) {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        if (!node) return result;
        let queue = [node];
        while (queue.length > 0) {
            let current = queue.shift();
            let pos = this.positions.get(current.value);
            if (pos) {
                const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
                await highlightNode(adjusted.x, adjusted.y, current.value, "highlight");
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
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
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
        const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, minValue, "search-highlight");
        await displayMessage(`The minimum value in the left subtree of the root is ${minValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, minValue: minValue, message: `The minimum value in the left subtree of the root is ${minValue}.` };
    }

    async findMaxLeftSubtree() {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
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
        const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, maxValue, "search-highlight");
        await displayMessage(`The maximum value in the left subtree of the root is ${maxValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, maxValue: maxValue, message: `The maximum value in the left subtree of the root is ${maxValue}.` };
    }

    async findMinRightSubtree() {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
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
        const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, minValue, "search-highlight");
        await displayMessage(`The minimum value in the right subtree of the root is ${minValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, minValue: minValue, message: `The minimum value in the right subtree of the root is ${minValue}.` };
    }

    async findMaxRightSubtree() {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
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
        const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
        await highlightNode(adjusted.x, adjusted.y, maxValue, "search-highlight");
        await displayMessage(`The maximum value in the right subtree of the root is ${maxValue}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, hasSubtree: true, maxValue: maxValue, message: `The maximum value in the right subtree of the root is ${maxValue}.` };
    }

    async calculateSum() {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        if (!this.root) {
            await displayMessage("The BST is empty, na.", 'warning');
            return { found: false, message: "The BST is empty." };
        }
        let sum = await this._calculateSumWithAnimation(this.root, scale, translateX, translateY);
        await displayMessage(`The sum of all nodes in the BST is ${sum}.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, sum: sum, message: `The sum of all nodes in the BST is ${sum}.` };
    }

    async _calculateSumWithAnimation(node, scale, translateX, translateY) {
        if (!node) return 0;
        let pos = this.positions.get(node.value);
        if (pos) {
            const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
            await highlightNode(adjusted.x, adjusted.y, node.value, "search-highlight");
            await displayMessage(`Adding node ${node.value} to the sum...`, 'info');
        }
        let leftSum = await this._calculateSumWithAnimation(node.left, scale, translateX, translateY);
        let rightSum = await this._calculateSumWithAnimation(node.right, scale, translateX, translateY);
        return node.value + leftSum + rightSum;
    }

    async findDiameter(value1, value2) {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        const baseX = 500 / scale, baseY = 50 / scale, baseOffset = 250 / scale;
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

        let lca = this._findLCA(this.root, value1, value2);
        let distance1 = await this._findDistanceWithAnimation(this.root, value1, lca, baseX, baseY, baseOffset, scale, translateX, translateY);
        let distance2 = await this._findDistanceWithAnimation(this.root, value2, lca, baseX, baseY, baseOffset, scale, translateX, translateY);

        if (distance1 < 0 || distance2 < 0) {
            await displayMessage("Error calculating distance between nodes.", 'error');
            return { found: false, message: "Error calculating distance between nodes." };
        }

        let totalDistance = distance1 + distance2;
        await displayMessage(`The distance between ${value1} and ${value2} is ${totalDistance} nodes.`, 'success');
        await delay(1000);
        await resetNodeStyles();
        return { found: true, distance: totalDistance, message: `The diameter between ${value1} and ${value2} is ${totalDistance}` };
    }

    async _findDistanceWithAnimation(node, targetValue, stopValue, x, y, offset, scale, translateX, translateY) {
        if (!node) return -1;
        
        let pos = this.positions.get(node.value);
        if (pos) {
            const adjusted = this.adjustCoordinates(pos.x, pos.y, scale, translateX, translateY);
            await highlightNode(adjusted.x, adjusted.y, node.value, "search-highlight");
            await displayMessage(`Checking node ${node.value} on path to ${targetValue}...`, 'info');
            await delay(500);
        }

        if (node.value === targetValue) return 0;

        if (node.value === stopValue) {
            if (targetValue < node.value) {
                const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
                const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
                await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
                let leftDistance = await this._findDistanceWithAnimation(node.left, targetValue, node.value, x - offset, y + 70, offset / 2, scale, translateX, translateY);
                return leftDistance === -1 ? -1 : leftDistance + 1;
            } else if (targetValue > node.value) {
                const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
                const nextAdjusted = this.adjustCoordinates(x + offset, y + 70, scale, translateX, translateY);
                await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
                let rightDistance = await this._findDistanceWithAnimation(node.right, targetValue, node.value, x + offset, y + 70, offset / 2, scale, translateX, translateY);
                return rightDistance === -1 ? -1 : rightDistance + 1;
            }
            return 0;
        }

        let distance;
        if (targetValue < node.value) {
            const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
            const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            distance = await this._findDistanceWithAnimation(node.left, targetValue, stopValue, x - offset, y + 70, offset / 2, scale, translateX, translateY);
        } else {
            const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
            const nextAdjusted = this.adjustCoordinates(x + offset, y + 70, scale, translateX, translateY);
            await animateLine(adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            distance = await this._findDistanceWithAnimation(node.right, targetValue, stopValue, x + offset, y + 70, offset / 2, scale, translateX, translateY);
        }

        return distance === -1 ? -1 : distance + 1;
    }

    render() {
        const scale = window.scale || 1;
        const translateX = window.translateX || 0;
        const translateY = window.translateY || 0;
        let svg = document.getElementById("bstTree");
        svg.innerHTML = "";
        this.positions.clear();
        if (this.root) this._renderNode(svg, this.root, 500 / scale, 50 / scale, 250 / scale, scale, translateX, translateY);
        let outputText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        outputText.setAttribute("id", "output-text");
        outputText.setAttribute("x", (500 / scale) + translateX);
        outputText.setAttribute("y", (480 / scale) + translateY);
        outputText.setAttribute("text-anchor", "middle");
        svg.appendChild(outputText);
    }

    _renderNode(svg, node, x, y, offset, scale, translateX, translateY) {
        if (!node) return;
        this.positions.set(node.value, { x, y });
        const adjusted = this.adjustCoordinates(x, y, scale, translateX, translateY);
        if (node.left) {
            const nextAdjusted = this.adjustCoordinates(x - offset, y + 70, scale, translateX, translateY);
            this._drawLine(svg, adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            this._renderNode(svg, node.left, x - offset, y + 70, offset / 2, scale, translateX, translateY);
        }
        if (node.right) {
            const nextAdjusted = this.adjustCoordinates(x + offset, y + 70, scale, translateX, translateY);
            this._drawLine(svg, adjusted.x, adjusted.y, nextAdjusted.x, nextAdjusted.y);
            this._renderNode(svg, node.right, x + offset, y + 70, offset / 2, scale, translateX, translateY);
        }
        this._drawNode(svg, adjusted.x, adjusted.y, node.value);
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

// Operation Functions (unchanged except for disabling inputs)
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