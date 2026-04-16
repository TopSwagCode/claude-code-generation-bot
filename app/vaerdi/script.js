class ValueStreamAnalyzer {
    constructor() {
        this.valueStreams = [];
        this.tasks = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
        this.updateAnalytics();
    }

    bindEvents() {
        // Value stream form
        document.getElementById('save-value-stream').addEventListener('click', () => this.saveValueStream());

        // Task form
        document.getElementById('add-task').addEventListener('click', () => this.addTask());

        // Backlog controls
        document.getElementById('sort-by-priority').addEventListener('click', () => this.sortByPriority());
        document.getElementById('sort-by-value').addEventListener('click', () => this.sortByValue());
        document.getElementById('export-backlog').addEventListener('click', () => this.exportBacklog());

        // Form validation
        this.bindFormValidation();
    }

    bindFormValidation() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    validateField(field) {
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.style.borderColor = 'var(--color-danger)';
        } else {
            field.style.borderColor = 'var(--color-border)';
        }
    }

    saveValueStream() {
        const name = document.getElementById('value-stream-name').value.trim();
        const description = document.getElementById('value-stream-description').value.trim();
        const stakeholders = document.getElementById('stakeholders').value.trim();

        if (!name || !description) {
            alert('Udfyld venligst navn og beskrivelse for værdistrømmen.');
            return;
        }

        const valueStream = {
            id: Date.now(),
            name,
            description,
            stakeholders,
            createdAt: new Date().toISOString()
        };

        this.valueStreams.push(valueStream);
        this.saveData();
        this.clearValueStreamForm();
        
        this.showNotification('Værdistrøm gemt succesfuldt!', 'success');
    }

    addTask() {
        const title = document.getElementById('task-title').value.trim();
        const effort = parseInt(document.getElementById('task-effort').value);
        const orgValue = parseInt(document.getElementById('org-value').value);
        const strategicValue = parseInt(document.getElementById('strategic-value').value);
        const blockers = document.getElementById('blockers').value.trim();

        if (!title) {
            alert('Udfyld venligst opgave titel.');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            effort,
            orgValue,
            strategicValue,
            blockers,
            createdAt: new Date().toISOString(),
            priority: this.calculatePriority(effort, orgValue, strategicValue, blockers)
        };

        this.tasks.push(task);
        this.saveData();
        this.clearTaskForm();
        this.renderBacklog();
        this.updateAnalytics();
        
        this.showNotification('Opgave tilføjet succesfuldt!', 'success');
    }

    calculatePriority(effort, orgValue, strategicValue, blockers) {
        // Calculate combined value
        const totalValue = (orgValue + strategicValue) / 2;
        
        // Calculate blocker penalty (more blockers = lower priority)
        const blockerCount = blockers ? blockers.split('\n').filter(b => b.trim()).length : 0;
        const blockerPenalty = Math.min(blockerCount * 0.5, 3); // Max penalty of 3 points
        
        // Priority formula: (Value / Effort) - Blocker Penalty
        // Higher value and lower effort = higher priority
        const basePriority = (totalValue / effort) * 10;
        const finalPriority = Math.max(basePriority - blockerPenalty, 0.1);
        
        return Math.round(finalPriority * 10) / 10;
    }

    sortByPriority() {
        this.tasks.sort((a, b) => b.priority - a.priority);
        this.renderBacklog();
        this.showNotification('Backlog sorteret efter prioritet', 'info');
    }

    sortByValue() {
        this.tasks.sort((a, b) => {
            const aValue = (a.orgValue + a.strategicValue) / 2;
            const bValue = (b.orgValue + b.strategicValue) / 2;
            return bValue - aValue;
        });
        this.renderBacklog();
        this.showNotification('Backlog sorteret efter værdi', 'info');
    }

    renderBacklog() {
        const backlogList = document.getElementById('backlog-list');
        
        if (this.tasks.length === 0) {
            backlogList.innerHTML = `
                <div class="empty-state">
                    <p>Ingen opgaver endnu. Tilføj opgaver ovenfor for at se dem prioriteret her.</p>
                </div>
            `;
            return;
        }

        const tasksHTML = this.tasks.map(task => this.renderTask(task)).join('');
        backlogList.innerHTML = tasksHTML;
    }

    renderTask(task) {
        const priorityClass = this.getPriorityClass(task.priority);
        const hasBlockers = task.blockers && task.blockers.trim();
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="priority-score ${priorityClass}">${task.priority}</div>
                </div>
                <div class="task-metrics">
                    <div class="metric">
                        <div class="metric-label">Omfang</div>
                        <div class="metric-value">${task.effort}/10</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Org. Værdi</div>
                        <div class="metric-value">${task.orgValue}/10</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Strategisk</div>
                        <div class="metric-value">${task.strategicValue}/10</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Prioritet</div>
                        <div class="metric-value">${task.priority}</div>
                    </div>
                </div>
                ${hasBlockers ? `
                    <div class="task-blockers">
                        <h4>⚠️ Blockere:</h4>
                        <p>${task.blockers.replace(/\n/g, '<br>')}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getPriorityClass(priority) {
        if (priority >= 7) return 'high';
        if (priority >= 4) return 'medium';
        return 'low';
    }

    updateAnalytics() {
        const totalTasks = this.tasks.length;
        const avgValue = totalTasks > 0 ? 
            this.tasks.reduce((sum, task) => sum + (task.orgValue + task.strategicValue) / 2, 0) / totalTasks : 0;
        const highPriorityTasks = this.tasks.filter(task => task.priority >= 7).length;
        const blockedTasks = this.tasks.filter(task => task.blockers && task.blockers.trim()).length;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('avg-value').textContent = Math.round(avgValue * 10) / 10;
        document.getElementById('high-priority').textContent = highPriorityTasks;
        document.getElementById('blocked-tasks').textContent = blockedTasks;
    }

    exportBacklog() {
        if (this.tasks.length === 0) {
            alert('Ingen opgaver at eksportere.');
            return;
        }

        const csvContent = this.generateCSV();
        this.downloadCSV(csvContent, 'backlog.csv');
        this.showNotification('Backlog eksporteret som CSV', 'success');
    }

    generateCSV() {
        const headers = ['Titel', 'Prioritet', 'Omfang', 'Org. Værdi', 'Strategisk Værdi', 'Blockere', 'Oprettet'];
        const rows = this.tasks.map(task => [
            `"${task.title}"`,
            task.priority,
            task.effort,
            task.orgValue,
            task.strategicValue,
            `"${task.blockers || ''}"`,
            new Date(task.createdAt).toLocaleDateString('da-DK')
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    clearValueStreamForm() {
        document.getElementById('value-stream-name').value = '';
        document.getElementById('value-stream-description').value = '';
        document.getElementById('stakeholders').value = '';
    }

    clearTaskForm() {
        document.getElementById('task-title').value = '';
        document.getElementById('task-effort').value = '5';
        document.getElementById('org-value').value = '5';
        document.getElementById('strategic-value').value = '5';
        document.getElementById('blockers').value = '';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--color-success);
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-md);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        
        if (type === 'info') {
            notification.style.background = 'var(--color-primary)';
        } else if (type === 'warning') {
            notification.style.background = 'var(--color-warning)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    saveData() {
        const data = {
            valueStreams: this.valueStreams,
            tasks: this.tasks,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('vaerdi-data', JSON.stringify(data));
    }

    loadData() {
        const saved = localStorage.getItem('vaerdi-data');
        if (saved) {
            const data = JSON.parse(saved);
            this.valueStreams = data.valueStreams || [];
            this.tasks = data.tasks || [];
            this.renderBacklog();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ValueStreamAnalyzer();
});