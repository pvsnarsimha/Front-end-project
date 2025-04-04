// Stack.js
document.addEventListener('DOMContentLoaded', function() {
    // Stack variables
    let stack = [];
    let stackCapacity = 10;
    let operationHistory = [];
    
    // DOM elements
    const stackContainer = document.getElementById('stack');
    const stackPointer = document.getElementById('stackPointer');
    const elementInput = document.getElementById('elementInput');
    const pushBtn = document.getElementById('pushBtn');
    const popBtn = document.getElementById('popBtn');
    const peekBtn = document.getElementById('peekBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusDiv = document.getElementById('status');
    const stackSizeElement = document.getElementById('stackSize');
    const stackCapacityElement = document.getElementById('stackCapacity');
    const stackUsageElement = document.getElementById('stackUsage');
    const stackUsageBar = document.getElementById('stackUsageBar');
    const lastOperationElement = document.getElementById('lastOperation');
    const operationHistoryDiv = document.getElementById('operationHistory');
    const stackSizeInput = document.getElementById('stackSizeInput');
    const updateSizeBtn = document.getElementById('updateSizeBtn');
    const stackDiagram = document.getElementById('stackDiagram');
    
    // Initialize the stack visualization
  // Initialize
function initStack() {
    stackContainer.innerHTML = '';
    stackContainer.appendChild(stackPointer);
    updateStackMetrics();
    drawMemoryDiagram();
    
    // Initialize operation history display
    operationHistoryDiv.innerHTML = '';
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'text-center text-muted py-3';
    emptyMsg.textContent = 'No operations yet';
    operationHistoryDiv.appendChild(emptyMsg);
}
    
    // Update stack metrics display
    function updateStackMetrics() {
        const currentSize = stack.length;
        const usagePercentage = Math.round((currentSize / stackCapacity) * 100);
        
        stackSizeElement.textContent = currentSize;
        stackCapacityElement.textContent = stackCapacity;
        stackUsageElement.textContent = usagePercentage;
        stackUsageBar.style.width = `${usagePercentage}%`;
        
        // Update progress bar color based on usage
        if (usagePercentage > 90) {
            stackUsageBar.className = 'progress-bar bg-danger';
        } else if (usagePercentage > 70) {
            stackUsageBar.className = 'progress-bar bg-warning';
        } else {
            stackUsageBar.className = 'progress-bar bg-success';
        }
    }
    
    // Draw the memory diagram
    function drawMemoryDiagram() {
        // Clear the existing diagram
        stackDiagram.innerHTML = '';
        
        // Add title
        const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
        title.setAttribute("x", "300");
        title.setAttribute("y", "30");
        title.setAttribute("text-anchor", "middle");
        title.setAttribute("font-size", "16");
        title.setAttribute("font-weight", "bold");
        title.textContent = "Stack Memory Layout";
        stackDiagram.appendChild(title);
        
        // Draw stack frame
        const stackFrame = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        stackFrame.setAttribute("x", "200");
        stackFrame.setAttribute("y", "50");
        stackFrame.setAttribute("width", "200");
        stackFrame.setAttribute("height", stackCapacity * 20 + 2);
        stackFrame.setAttribute("fill", "none");
        stackFrame.setAttribute("stroke", "#333");
        stackFrame.setAttribute("stroke-width", "2");
        stackDiagram.appendChild(stackFrame);
        
        // Draw memory cells and content
        for (let i = 0; i < stackCapacity; i++) {
            // Memory cell
            const cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            cell.setAttribute("x", "200");
            cell.setAttribute("y", 50 + i * 20);
            cell.setAttribute("width", "200");
            cell.setAttribute("height", "20");
            cell.setAttribute("fill", "none");
            cell.setAttribute("stroke", "#ddd");
            stackDiagram.appendChild(cell);
            
            // Address label
            const address = document.createElementNS("http://www.w3.org/2000/svg", "text");
            address.setAttribute("x", "190");
            address.setAttribute("y", 65 + i * 20);
            address.setAttribute("text-anchor", "end");
            address.setAttribute("font-size", "12");
            address.setAttribute("font-family", "Fira Code, monospace");
            address.textContent = `0x${(0x1000 + (stackCapacity - i - 1) * 4).toString(16).toUpperCase()}`;
            stackDiagram.appendChild(address);
            
            // Content (if exists in stack)
            if (i < stack.length) {
                const value = stack[stack.length - 1 - i]; // Reverse order for stack
                
                // Value background
                const valueBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                valueBg.setAttribute("x", "201");
                valueBg.setAttribute("y", 51 + i * 20);
                valueBg.setAttribute("width", "198");
                valueBg.setAttribute("height", "18");
                valueBg.setAttribute("fill", "#e3f2fd");
                stackDiagram.appendChild(valueBg);
                
                // Value text
                const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                valueText.setAttribute("x", "300");
                valueText.setAttribute("y", 65 + i * 20);
                valueText.setAttribute("text-anchor", "middle");
                valueText.setAttribute("font-size", "12");
                valueText.setAttribute("font-weight", "bold");
                valueText.textContent = value;
                stackDiagram.appendChild(valueText);
                
                // Highlight the top element
                if (i === 0) {
                    valueBg.setAttribute("fill", "#bbdefb");
                    const pointer = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    pointer.setAttribute("x", "410");
                    pointer.setAttribute("y", 65 + i * 20);
                    pointer.setAttribute("text-anchor", "start");
                    pointer.setAttribute("font-size", "12");
                    pointer.setAttribute("fill", "#2196F3");
                    pointer.textContent = "← TOP";
                    stackDiagram.appendChild(pointer);
                }
            }
        }
        
        // Draw stack pointer if not empty
        if (stack.length > 0) {
            const pointerY = 50 + (stackCapacity - stack.length) * 20;
            
            const pointerLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            pointerLine.setAttribute("x1", "150");
            pointerLine.setAttribute("y1", pointerY + 10);
            pointerLine.setAttribute("x2", "200");
            pointerLine.setAttribute("y2", pointerY + 10);
            pointerLine.setAttribute("stroke", "#2196F3");
            pointerLine.setAttribute("stroke-width", "2");
            pointerLine.setAttribute("stroke-dasharray", "5,5");
            stackDiagram.appendChild(pointerLine);
            
            const pointerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            pointerText.setAttribute("x", "140");
            pointerText.setAttribute("y", pointerY + 15);
            pointerText.setAttribute("text-anchor", "end");
            pointerText.setAttribute("font-size", "12");
            pointerText.setAttribute("fill", "#2196F3");
            pointerText.textContent = "SP";
            stackDiagram.appendChild(pointerText);
        }
    }
    
    // Push operation
    function pushElement() {
        const value = elementInput.value.trim();
        
        if (!value) {
            showStatus('Please enter a value to push', 'error');
            return;
        }
        
        if (stack.length >= stackCapacity) {
            showStatus('Stack overflow! Cannot push to a full stack', 'error');
            return;
        }
        
        // Add to stack
        stack.push(value);
        
        // Create stack element
        const stackElement = document.createElement('div');
        stackElement.className = 'stack-element';
        stackElement.textContent = value;
        
        // Add to visualization with animation
        stackContainer.insertBefore(stackElement, stackPointer);
        stackElement.style.transform = 'translateY(-20px)';
        stackElement.style.opacity = '0';
        
        setTimeout(() => {
            stackElement.style.transform = 'translateY(0)';
            stackElement.style.opacity = '1';
        }, 10);
        
        // Update pointer text
        stackPointer.textContent = 'TOP';
        
        // Update metrics
        updateStackMetrics();
        
        // Update memory diagram
        drawMemoryDiagram();
        
        // Log operation
        logOperation(`push(${value})`);
        showStatus(`Pushed "${value}" to stack`, 'success');
        
        // Clear input
        elementInput.value = '';
    }
    
    // Pop operation
    function popElement() {
        if (stack.length === 0) {
            showStatus('Stack underflow! Cannot pop from an empty stack', 'error');
            return;
        }
        
        const value = stack.pop();
        const stackElements = document.getElementsByClassName('stack-element');
        
        if (stackElements.length > 0) {
            const topElement = stackElements[stackElements.length - 1];
            
            // Animate removal
            topElement.style.transform = 'translateY(-20px)';
            topElement.style.opacity = '0';
            
            setTimeout(() => {
                stackContainer.removeChild(topElement);
                
                // Update pointer text if stack is empty
                if (stack.length === 0) {
                    stackPointer.textContent = 'TOP (Empty)';
                }
                
                // Update metrics
                updateStackMetrics();
                
                // Update memory diagram
                drawMemoryDiagram();
            }, 300);
        }
        
        // Log operation
        logOperation(`pop() → ${value}`);
        showStatus(`Popped "${value}" from stack`, 'success');
    }
    
    // Peek operation
    // Peek operation
    function peekElement() {
        if (stack.length === 0) {
            showStatus("Stack is empty - nothing to peek", "error");
            return;
        }
    
        const topElement = document.querySelector('.stack-element:last-child');
        const topValue = stack[stack.length - 1];
        
        // Display message
        showStatus(`Top element is: ${topValue}`, "success");
        
        // Create a more pronounced blinking effect
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            topElement.classList.toggle('peek-highlight');
            blinkCount++;
            
            if (blinkCount >= 6) { // Blink 3 times (on-off-on-off-on-off)
                clearInterval(blinkInterval);
                topElement.classList.remove('peek-highlight');
            }
        }, 1000); // Blink every 200ms
        
        // Log operation
        logOperation(`peek() → ${topValue}`);
    }
    
// Update the event listeners (remove any duplicate ones)
peekBtn.addEventListener('click', peekElement);
document.getElementById('floatingPeekBtn').addEventListener('click', peekElement);
    // Clear stack
    function clearStack() {
        if (stack.length === 0) {
            showStatus('Stack is already empty', 'info');
            return;
        }
        
        stack = [];
        
        // Remove all stack elements
        const stackElements = document.querySelectorAll('.stack-element');
        stackElements.forEach(el => {
            el.style.transform = 'translateY(-20px)';
            el.style.opacity = '0';
            
            setTimeout(() => {
                stackContainer.removeChild(el);
            }, 300);
        });
        
        // Update pointer text
        stackPointer.textContent = 'TOP (Empty)';
        
        // Update metrics
        updateStackMetrics();
        
        // Update memory diagram
        drawMemoryDiagram();
        
        // Log operation
        logOperation('clear()');
        showStatus('Stack cleared', 'success');
    }
    
    // Update stack capacity
    function updateStackCapacity() {
        const newCapacity = parseInt(stackSizeInput.value);
        
        if (isNaN(newCapacity)) {
            showStatus('Please enter a valid number', 'error');
            return;
        }
        
        if (newCapacity < 1) {
            showStatus('Capacity must be at least 1', 'error');
            return;
        }
        
        if (newCapacity < stack.length) {
            showStatus(`Cannot set capacity to ${newCapacity} - stack has ${stack.length} elements`, 'error');
            return;
        }
        
        stackCapacity = newCapacity;
        updateStackMetrics();
        drawMemoryDiagram();
        
        // Log operation
        logOperation(`setCapacity(${newCapacity})`);
        showStatus(`Stack capacity updated to ${newCapacity}`, 'success');
    }
    
    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status-message p-3 mb-3';
        
        switch (type) {
            case 'success':
                statusDiv.classList.add('alert-success');
                break;
            case 'error':
                statusDiv.classList.add('alert-danger');
                break;
            case 'info':
                statusDiv.classList.add('alert-info');
                break;
            default:
                statusDiv.classList.add('alert-secondary');
        }
    }
    
    // Log operation to history
 // Log operation to history
 // Log operation to history
function logOperation(operation) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    const operationText = `${timestamp}: ${operation}`;
    
    // Add to beginning of history array (most recent first)
    operationHistory.unshift(operationText);
    
    // Update last operation display
    lastOperationElement.textContent = operationText;
    
    // Clear the history div and rebuild it
    operationHistoryDiv.innerHTML = '';
    
    if (operationHistory.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'text-center text-muted py-3';
        emptyMsg.textContent = 'No operations yet';
        operationHistoryDiv.appendChild(emptyMsg);
    } else {
        operationHistory.forEach(op => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item p-2 border-bottom';
            historyItem.textContent = op;
            operationHistoryDiv.appendChild(historyItem);
        });
    }
    
    // Limit history to 10 items
    if (operationHistory.length > 10) {
        operationHistory.length = 10;
    }
}
    // Event listeners
    pushBtn.addEventListener('click', pushElement);
    popBtn.addEventListener('click', popElement);
    peekBtn.addEventListener('click', peekElement);
    clearBtn.addEventListener('click', clearStack);
    updateSizeBtn.addEventListener('click', updateStackCapacity);
    
    elementInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            pushElement();
        }
    });
    
    // Floating buttons
    document.getElementById('floatingPeekBtn').addEventListener('click', peekElement);
    document.getElementById('floatingClearBtn').addEventListener('click', clearStack);
    
    // Initialize
    initStack();
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
});